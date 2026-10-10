import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('[SUPABASE CONFIG] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectDatabase() {
  console.log('=== INSPECTING LIVE SUPABASE DATABASE ===');
  
  // 1. Inspect event_settings
  console.log('\n--- Checking event_settings ---');
  try {
    const { data, error } = await supabase.from('event_settings').select('*').limit(1);
    if (error) {
      console.log('event_settings query error:', error.message, error.code, error.details);
    } else if (data && data.length > 0) {
      console.log('event_settings columns detected:', Object.keys(data[0]));
      console.log('Sample event_settings row:', {
        live_mode_status: data[0].live_mode_status,
        registration_open: data[0].registration_open,
        registration_start_date: data[0].registration_start_date,
        registration_deadline: data[0].registration_deadline,
        ppt_submissions_open: data[0].ppt_submissions_open,
        submission_deadline: data[0].submission_deadline,
        accepted_file_types: data[0].accepted_file_types,
        max_file_size_mb: data[0].max_file_size_mb,
        event_date: data[0].event_date,
      });
    } else {
      console.log('event_settings table is empty or no rows returned.');
    }
  } catch (err) {
    console.log('Failed to query event_settings:', err.message);
  }

  // 2. Inspect problem_categories
  console.log('\n--- Checking problem_categories ---');
  try {
    const { data, error } = await supabase.from('problem_categories').select('*').limit(2);
    if (error) {
      console.log('problem_categories query error:', error.message, error.code);
    } else if (data && data.length > 0) {
      console.log('problem_categories columns detected:', Object.keys(data[0]));
      console.log(`problem_categories row count sample: ${data.length} records. Sample titles:`, data.map(c => c.title));
      console.log('Has is_published column?', 'is_published' in data[0]);
    } else {
      console.log('problem_categories table is empty.');
    }
  } catch (err) {
    console.log('Failed to query problem_categories:', err.message);
  }

  // 3. Inspect problem_statements
  console.log('\n--- Checking problem_statements ---');
  try {
    const { data, error } = await supabase.from('problem_statements').select('*').limit(2);
    if (error) {
      console.log('problem_statements query error (table might not exist yet):', error.message, error.code);
    } else if (data) {
      console.log(`problem_statements exists! Found ${data.length} rows.`);
      if (data.length > 0) {
        console.log('problem_statements columns detected:', Object.keys(data[0]));
        console.log('Sample statements:', data.map(s => s.title));
      }
    }
  } catch (err) {
    console.log('Failed to query problem_statements:', err.message);
  }

  // 4. Inspect registrations and submissions
  console.log('\n--- Checking registrations and submissions ---');
  try {
    const { data: reg, error: regErr } = await supabase.from('registrations').select('id, user_id, competition_id').limit(1);
    if (regErr) console.log('registrations query note:', regErr.message);
    else console.log('registrations accessible. Sample rows:', reg?.length);

    const { data: sub, error: subErr } = await supabase.from('submissions').select('id, user_id, status').limit(1);
    if (subErr) console.log('submissions query note:', subErr.message);
    else console.log('submissions accessible. Sample rows:', sub?.length);
  } catch (err) {
    console.log('Failed query on reg/sub:', err.message);
  }
}

inspectDatabase();
