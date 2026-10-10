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

const tables = [
  'profiles', 'competitions', 'problem_categories', 'teams', 'team_members',
  'registrations', 'schedules', 'mentors', 'judges', 'judging_criteria',
  'submissions', 'scores', 'sponsors', 'faqs', 'event_settings', 'announcements'
];

for (const t of tables) {
  const { data, error, count } = await supabase.from(t).select('*', { count: 'exact', head: true });
  console.log(`${t}:`, error ? `ERROR: ${error.message}` : `EXISTS (${count} rows)`);
}
