import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const LOCAL_STORAGE_KEY = 'hackfest_competition_highlights';

function getLocalHighlights() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalHighlights(items) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save highlights to localStorage:', err);
  }
}

export const highlightsService = {
  /**
   * Upload an image to Supabase storage bucket (sdc-members/highlights)
   */
  async uploadHighlightPhoto(file) {
    if (!file) throw new Error('No file selected.');

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('Invalid file format. Please upload a JPEG, PNG, WEBP, or GIF image.');
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new Error('File size exceeds the 15MB limit.');
    }

    if (isSupabaseConfigured) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
        const filePath = `highlights/${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from('sdc-members')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('sdc-members')
            .getPublicUrl(filePath);

          return {
            publicUrl: publicUrlData.publicUrl,
            storagePath: filePath,
          };
        }
      } catch (err) {
        console.warn('Storage upload error, falling back to local encoding:', err.message);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          publicUrl: reader.result,
          storagePath: null,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Get highlights with optional competitionId filter ('codeathon' | 'ideathon' | null)
   */
  async getHighlights(competitionId = null) {
    let list = [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('competition_highlights')
          .select('*')
          .order('created_at', { ascending: false });

        if (competitionId && competitionId !== 'all') {
          query = query.eq('competition_id', competitionId);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          list = data;
          saveLocalHighlights(data);
          return list;
        }
      } catch {
        // Fallback to local storage
      }
    }

    list = getLocalHighlights();
    if (competitionId && competitionId !== 'all') {
      list = list.filter((h) => h.competition_id?.toLowerCase() === competitionId.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Admin: Get all highlights
   */
  async getHighlightsAdmin() {
    return this.getHighlights('all');
  },

  /**
   * Admin: Save or update a highlight
   */
  async saveHighlight(item) {
    const isNew = !item.id;
    const now = new Date().toISOString();

    const record = {
      competition_id: item.competition_id || 'codeathon',
      title: item.title.trim(),
      team_name: item.team_name?.trim() || '',
      description: item.description.trim(),
      image_url: item.image_url || null,
      storage_path: item.storage_path || null,
      result_badge: item.result_badge?.trim() || 'Verified Result',
      sort_order: item.sort_order || 0,
      created_at: item.created_at || now,
    };

    if (item.id) {
      record.id = item.id;
    }

    if (isSupabaseConfigured) {
      try {
        if (isNew) {
          const { data, error } = await supabase
            .from('competition_highlights')
            .insert([record])
            .select()
            .single();

          if (!error && data) {
            const local = getLocalHighlights();
            local.unshift(data);
            saveLocalHighlights(local);
            return data;
          }
        } else {
          const { data, error } = await supabase
            .from('competition_highlights')
            .update(record)
            .eq('id', record.id)
            .select()
            .single();

          if (!error && data) {
            const local = getLocalHighlights().map((h) => (h.id === data.id ? data : h));
            saveLocalHighlights(local);
            return data;
          }
        }
      } catch (err) {
        console.warn('Supabase save highlight failed, saving locally:', err.message);
      }
    }

    const local = getLocalHighlights();
    let savedItem;
    if (isNew) {
      savedItem = {
        ...record,
        id: `local-highlight-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      local.unshift(savedItem);
    } else {
      savedItem = { ...record };
      const idx = local.findIndex((h) => h.id === record.id);
      if (idx !== -1) {
        local[idx] = savedItem;
      } else {
        local.unshift(savedItem);
      }
    }
    saveLocalHighlights(local);
    return savedItem;
  },

  /**
   * Admin: Delete a highlight
   */
  async deleteHighlight(id, storagePath = null) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('competition_highlights').delete().eq('id', id);
        if (storagePath) {
          await supabase.storage.from('sdc-members').remove([storagePath]).catch(() => {});
        }
      } catch (err) {
        console.warn('Supabase delete highlight error:', err.message);
      }
    }

    const local = getLocalHighlights().filter((h) => h.id !== id);
    saveLocalHighlights(local);
    return true;
  },
};
