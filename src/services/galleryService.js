import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const LOCAL_STORAGE_KEY = 'hackfest_gallery_photos';

function getLocalPhotos() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPhotos(photos) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  } catch (err) {
    console.warn('Failed to save gallery photos to localStorage:', err);
  }
}

export const galleryService = {
  /**
   * Upload an image to the Supabase storage bucket (sdc-members/gallery)
   * Falls back to Base64 data URL if storage upload is unavailable
   */
  async uploadPhoto(file) {
    if (!file) throw new Error('No file selected.');

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('Invalid file format. Please upload a JPEG, PNG, WEBP, or GIF image.');
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('File size exceeds the 15MB limit. Please upload a smaller photograph.');
    }

    if (isSupabaseConfigured) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
        const filePath = `gallery/${cleanName}`;

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
        } else {
          console.warn('Storage upload encountered an issue, falling back to local encoding:', uploadError.message);
        }
      } catch (err) {
        console.warn('Storage upload error, falling back to local encoding:', err.message);
      }
    }

    // Fallback: convert to Base64 data URL
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
   * Get photographs with optional category filter
   */
  async getPhotos(category = null) {
    let photos = [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('gallery_photos')
          .select('*')
          .order('upload_date', { ascending: false });

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          photos = data;
          saveLocalPhotos(data);
          return photos;
        }
      } catch (err) {
        // Fallback to local storage
      }
    }

    // Fallback to locally stored photos
    photos = getLocalPhotos();
    if (category && category !== 'all') {
      photos = photos.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    return photos.sort((a, b) => new Date(b.upload_date || b.created_at) - new Date(a.upload_date || a.created_at));
  },

  /**
   * Admin: Get all photos for management
   */
  async getPhotosAdmin() {
    return this.getPhotos('all');
  },

  /**
   * Admin: Save or update a photo
   */
  async savePhoto(photoData) {
    const isNew = !photoData.id;
    const now = new Date().toISOString();

    const record = {
      title: photoData.title.trim(),
      caption: photoData.caption?.trim() || '',
      category: photoData.category || 'event',
      image_url: photoData.image_url,
      storage_path: photoData.storage_path || null,
      upload_date: photoData.upload_date || now,
      created_at: photoData.created_at || now,
    };

    if (photoData.id) {
      record.id = photoData.id;
    }

    if (isSupabaseConfigured) {
      try {
        if (isNew) {
          const { data, error } = await supabase
            .from('gallery_photos')
            .insert([record])
            .select()
            .single();

          if (!error && data) {
            const local = getLocalPhotos();
            local.unshift(data);
            saveLocalPhotos(local);
            return data;
          }
        } else {
          const { data, error } = await supabase
            .from('gallery_photos')
            .update(record)
            .eq('id', record.id)
            .select()
            .single();

          if (!error && data) {
            const local = getLocalPhotos().map((p) => (p.id === data.id ? data : p));
            saveLocalPhotos(local);
            return data;
          }
        }
      } catch (err) {
        console.warn('Supabase save failed, persisting locally:', err.message);
      }
    }

    // Local fallback
    const local = getLocalPhotos();
    let savedItem;
    if (isNew) {
      savedItem = {
        ...record,
        id: `local-photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      local.unshift(savedItem);
    } else {
      savedItem = { ...record };
      const idx = local.findIndex((p) => p.id === record.id);
      if (idx !== -1) {
        local[idx] = savedItem;
      } else {
        local.unshift(savedItem);
      }
    }
    saveLocalPhotos(local);
    return savedItem;
  },

  /**
   * Admin: Delete a photo
   */
  async deletePhoto(id, storagePath = null) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('gallery_photos').delete().eq('id', id);
        if (storagePath) {
          await supabase.storage.from('sdc-members').remove([storagePath]).catch(() => {});
        }
      } catch (err) {
        console.warn('Supabase delete error:', err.message);
      }
    }

    // Remove from local storage
    const local = getLocalPhotos().filter((p) => p.id !== id);
    saveLocalPhotos(local);
    return true;
  },
};
