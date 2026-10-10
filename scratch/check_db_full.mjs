import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runCheck() {
  console.log('--- 1. Testing event_settings update with anon key ---');
  // First read existing event_settings
  const { data: currentSettings, error: readErr } = await supabase.from('event_settings').select('*').limit(1).single();
  if (readErr) {
    console.error('Failed to read event_settings:', readErr);
    return;
  }
  console.log('Current settings id:', currentSettings.id);

  // Try updating with full payload
  const testPayload = {
    venue: currentSettings.venue,
    registration_status: currentSettings.registration_status,
    ppt_submissions_open: currentSettings.ppt_submissions_open,
    submission_deadline: currentSettings.submission_deadline,
    submission_instructions: currentSettings.submission_instructions,
    accepted_file_types: currentSettings.accepted_file_types,
    max_file_size_mb: currentSettings.max_file_size_mb,
    updated_at: new Date().toISOString(),
  };

  const { data: updateRes, error: updateErr } = await supabase
    .from('event_settings')
    .update(testPayload)
    .eq('id', currentSettings.id)
    .select();

  if (updateErr) {
    console.log('event_settings update result (anon role):', updateErr.message, updateErr.code);
  } else {
    console.log('event_settings update succeeded!', updateRes);
  }

  // 2. Test problem_categories RLS and operations
  console.log('\n--- 2. Testing problem_categories read ---');
  const { data: cats, error: catErr } = await supabase.from('problem_categories').select('*');
  if (catErr) {
    console.log('problem_categories read error:', catErr);
  } else {
    console.log(`problem_categories read OK: found ${cats.length} records:`, cats.map(c => ({ id: c.id, title: c.title, is_published: c.is_published, is_active: c.is_active })));
  }

  // 3. Test problem_statements read
  console.log('\n--- 3. Testing problem_statements read ---');
  const { data: stmts, error: stmtErr } = await supabase.from('problem_statements').select('*');
  if (stmtErr) {
    console.log('problem_statements read error:', stmtErr);
  } else {
    console.log(`problem_statements read OK: found ${stmts.length} records:`, stmts.map(s => ({ id: s.id, title: s.title, is_published: s.is_published, status: s.status })));
  }
}

runCheck();
