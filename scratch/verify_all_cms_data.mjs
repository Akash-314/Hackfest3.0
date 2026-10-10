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

async function runVerification() {
  console.log('=== RUNNING COMPREHENSIVE CMS & SUPABASE AUDIT ===');

  // 1. Event Settings
  console.log('\n--- 1. Event Settings ---');
  const { data: esRow, error: esErr } = await supabase.from('event_settings').select('*').limit(1).maybeSingle();
  console.log('Event Settings row found:', Boolean(esRow), 'Error:', esErr?.message || 'none');
  console.log('Current settings snapshot:', {
    id: esRow?.id,
    venue: esRow?.venue,
    registration_status: esRow?.registration_status,
    registration_deadline: esRow?.registration_deadline,
    live_mode_status: esRow?.live_mode_status,
    leaderboard_published: esRow?.leaderboard_published,
  });

  // 2. Schedules
  console.log('\n--- 2. Schedules ---');
  const { data: schList, error: schErr } = await supabase.from('schedules').select('*');
  console.log('Schedules rows count in DB:', schList?.length, 'Error:', schErr?.message || 'none');

  // 3. Announcements
  console.log('\n--- 3. Announcements ---');
  const { data: annList, error: annErr } = await supabase.from('announcements').select('*');
  console.log('Announcements rows count in DB:', annList?.length, 'Error:', annErr?.message || 'none');
  if (annList?.length) {
    console.log('Published announcements:', annList.filter(a => a.published).map(a => a.title));
  }

  // 4. FAQs
  console.log('\n--- 4. FAQs ---');
  const { data: faqList, error: faqErr } = await supabase.from('faqs').select('*');
  console.log('FAQs count in DB:', faqList?.length, 'Error:', faqErr?.message || 'none');

  // 5. Competitions
  console.log('\n--- 5. Competitions ---');
  const { data: compList, error: compErr } = await supabase.from('competitions').select('*');
  console.log('Competitions count in DB:', compList?.length, 'Error:', compErr?.message || 'none');
  compList?.forEach(c => {
    console.log(` - ${c.slug} (${c.name}): min ${c.min_team_size}, max ${c.max_team_size}, open: ${c.registration_open}`);
  });

  // 6. SDC Members
  console.log('\n--- 6. SDC Members ---');
  const { data: sdcList, error: sdcErr } = await supabase.from('sdc_members').select('*');
  console.log('SDC Members count in DB:', sdcList?.length, 'Error:', sdcErr?.message || 'none');
  sdcList?.forEach(m => {
    console.log(` - [${m.category}] ${m.name} (${m.role_title})`);
  });

  // 7. Audit Logs
  console.log('\n--- 7. Audit Logs ---');
  const { data: auditList, error: auditErr } = await supabase.from('audit_logs').select('*').limit(5);
  console.log('Audit logs reachable:', !auditErr, 'Count sample:', auditList?.length);

  console.log('\n=== ALL TABLE READ VERIFICATIONS COMPLETE ===');
}

runVerification();
