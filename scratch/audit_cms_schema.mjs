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

async function audit() {
  console.log('=== 1. EVENT SETTINGS ===');
  const { data: es, error: esErr } = await supabase.from('event_settings').select('*');
  console.log('Error:', esErr);
  console.log('Rows count:', es?.length);
  if (es && es.length > 0) {
    console.log('Row[0] columns and values:', es[0]);
  }

  console.log('\n=== 2. SCHEDULES ===');
  const { data: sch, error: schErr } = await supabase.from('schedules').select('*').limit(3);
  console.log('Error:', schErr);
  console.log('Count:', sch?.length);
  if (sch && sch.length > 0) {
    console.log('Sample row:', sch[0]);
  }

  console.log('\n=== 3. ANNOUNCEMENTS ===');
  const { data: ann, error: annErr } = await supabase.from('announcements').select('*').limit(3);
  console.log('Error:', annErr);
  console.log('Count:', ann?.length);
  if (ann && ann.length > 0) {
    console.log('Sample row:', ann[0]);
  }

  console.log('\n=== 4. FAQS ===');
  const { data: faqs, error: faqErr } = await supabase.from('faqs').select('*').limit(3);
  console.log('Error:', faqErr);
  console.log('Count:', faqs?.length);
  if (faqs && faqs.length > 0) {
    console.log('Sample row:', faqs[0]);
  }

  console.log('\n=== 5. COMPETITIONS ===');
  const { data: comps, error: compErr } = await supabase.from('competitions').select('*');
  console.log('Error:', compErr);
  console.log('Count:', comps?.length);
  if (comps && comps.length > 0) {
    console.log('Sample row:', comps[0]);
  }

  console.log('\n=== 6. SDC MEMBERS ===');
  const { data: sdc, error: sdcErr } = await supabase.from('sdc_members').select('*');
  console.log('Error:', sdcErr);
  console.log('Count:', sdc?.length);
  if (sdc && sdc.length > 0) {
    console.log('Sample row:', sdc[0]);
  }
}

audit();
