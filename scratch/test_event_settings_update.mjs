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

async function testUpdate() {
  const { data: current, error: getErr } = await supabase.from('event_settings').select('*').limit(1).single();
  console.log('Current row:', current);

  // Test updating with text date vs ISO timestamp for event_start
  const { data: upd1, error: err1 } = await supabase
    .from('event_settings')
    .update({ event_start: 'OCTOBER 24, 2026' })
    .eq('id', current.id)
    .select();
  console.log('Update with string date:', { upd1, err1: err1?.message });

  // Test updating with ISO date
  const isoDate = new Date('2026-10-24T09:00:00.000Z').toISOString();
  const { data: upd2, error: err2 } = await supabase
    .from('event_settings')
    .update({ event_start: isoDate })
    .eq('id', current.id)
    .select();
  console.log('Update with ISO date:', { upd2, err2: err2?.message });
}

testUpdate();
