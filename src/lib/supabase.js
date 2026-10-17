import { createClient } from '@supabase/supabase-js';

const envObj = (typeof import.meta !== 'undefined' && import.meta.env) 
  ? import.meta.env 
  : (typeof process !== 'undefined' && process.env ? process.env : {});

const rawUrl = envObj.VITE_SUPABASE_URL || envObj.SUPABASE_URL || '';
const rawKey = envObj.VITE_SUPABASE_ANON_KEY || 
  envObj.VITE_SUPABASE_KEY || 
  envObj.VITE_SUPABASE_PUBLISHABLE_KEY || 
  envObj.SUPABASE_ANON_KEY || '';

// Clean up whitespace, quotation marks, and trailing slashes
const supabaseUrl = (typeof rawUrl === 'string' ? rawUrl.trim().replace(/^["']|["']$/g, '') : '').replace(/\/+$/, '');
const supabaseAnonKey = typeof rawKey === 'string' ? rawKey.trim().replace(/^["']|["']$/g, '') : '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseUrl.includes('placeholder.supabase.co')
);

// Fallback dummy client for when environment variables are not set yet
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-anon-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

if (import.meta.env?.DEV) {
  if (isSupabaseConfigured) {
    console.info(`[Supabase] Successfully connected to: ${supabaseUrl}`);
  } else {
    console.warn('[Supabase] Running in fallback mode. Missing or placeholder VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.');
  }
}

export default supabase;

