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

async function testRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      profile:profiles!registrations_user_id_fkey(id, full_name, email, phone, college, branch, year),
      competition:competitions(id, slug, name),
      team:teams(id, name, code, leader_id)
    `)
    .limit(3);
  console.log('Registrations query result:', { count: data?.length, error: error?.message });
}

testRegistrations();
