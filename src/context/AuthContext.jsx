import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or sync user profile from profiles table
  const fetchProfile = useCallback(async (userId, userEmail, userMeta) => {
    if (!isSupabaseConfigured || !userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        // Check if app_admins table has elevated privileges for this user
        try {
          const { data: adminRow } = await supabase
            .from('app_admins')
            .select('role, is_super_admin')
            .eq('user_id', userId)
            .maybeSingle();
          if (adminRow) {
            data.is_super_admin = adminRow.is_super_admin || adminRow.role === 'super_admin';
            if (data.is_super_admin) data.role = 'super_admin';
            else if (adminRow.role === 'admin' && data.role !== 'super_admin') data.role = 'admin';
          }
        } catch {
          // Ignore if table does not exist yet
        }
        setProfile(data);
        return data;
      }

      // If user row not yet created by DB trigger, initialize it
      const newProfile = {
        id: userId,
        email: userEmail || '',
        full_name: userMeta?.full_name || (userEmail ? userEmail.split('@')[0] : 'Participant'),
        role: userMeta?.role || 'participant',
        college: userMeta?.college || 'Rajkiya Engineering College Banda',
      };

      const { data: createdProfile, error: insertError } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();

      if (!insertError && createdProfile) {
        setProfile(createdProfile);
        return createdProfile;
      }
      return null;
    } catch (err) {
      console.error('Failed to load profile:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up
  const signUp = async ({ email, password, fullName, college, phone, role = 'participant' }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          college: college || 'Rajkiya Engineering College Banda',
          phone: phone || '',
          role: role,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await fetchProfile(data.user.id, email, {
        full_name: fullName,
        college,
        phone,
        role,
      });
    }

    return data;
  };

  // Sign in
  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
    }

    return data;
  };

  // Sign out
  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  // Reset password
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/profile`,
    });
    if (error) throw error;
    return data;
  };

  // Update profile
  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const refreshProfile = () => {
    if (user) {
      return fetchProfile(user.id, user.email, user.user_metadata);
    }
    return Promise.resolve(null);
  };

  const isSuperAdmin = Boolean(profile?.is_super_admin === true || profile?.role === 'super_admin');
  const role = isSuperAdmin ? 'super_admin' : (profile?.role || 'participant');
  const isAdmin = role === 'admin' || role === 'organizer' || isSuperAdmin;
  const isJudge = role === 'judge' || isAdmin;
  const isMentor = role === 'mentor' || isAdmin;

  const value = {
    user,
    profile,
    role,
    isAdmin,
    isSuperAdmin,
    isJudge,
    isMentor,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
