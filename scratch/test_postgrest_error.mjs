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
const { data, error } = await supabase.from('event_settings').update({ event_date: 'test' }).eq('id', 'c6d5a7ca-e7cc-4d37-9f75-8f03d2634e97').select();
console.log('Result:', { data, error });
