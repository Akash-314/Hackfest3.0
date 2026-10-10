import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
}
const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function updateResilient(settings) {
  // First get target row id
  const { data: row } = await supabase.from('event_settings').select('id').limit(1).maybeSingle();
  const rowId = row?.id;

  const payload = {
    venue: settings.venue,
    contact_email: settings.contact_email,
    registration_deadline: settings.registration_deadline,
    live_mode_status: settings.live_mode_status,
    leaderboard_published: settings.leaderboard_published,
    registration_status: settings.registration_open ? 'OPEN' : 'CLOSED',
    updated_at: new Date().toISOString(),
  };

  // If event_date provided, try including it
  let queryPayload = { ...payload };
  if (settings.event_date) {
    queryPayload.event_date = settings.event_date;
  }
  if (settings.registration_open !== undefined) {
    queryPayload.registration_open = settings.registration_open;
  }

  let result = null;
  if (rowId) {
    result = await supabase.from('event_settings').update(queryPayload).eq('id', rowId).select();
  } else {
    result = await supabase.from('event_settings').insert([queryPayload]).select();
  }

  if (result.error && result.error.code === 'PGRST204' && result.error.message.includes('event_date')) {
    console.log('Detected missing event_date column, falling back to core schema...');
    // Fall back without event_date or registration_open
    if (rowId) {
      result = await supabase.from('event_settings').update(payload).eq('id', rowId).select();
    } else {
      result = await supabase.from('event_settings').insert([payload]).select();
    }
  }

  console.log('Final update result:', { data: result.data, error: result.error });
}

await updateResilient({
  event_date: 'OCTOBER 24-25, 2026',
  venue: 'Multipurpose Hall, REC Banda Campus, Atarra, Banda (U.P.)',
  contact_email: 'sdc@recbanda.ac.in',
  registration_deadline: 'October 20, 2026',
  live_mode_status: 'REGISTRATION OPEN',
  leaderboard_published: false,
  registration_open: true,
});
