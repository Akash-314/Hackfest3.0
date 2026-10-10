import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env without printing secrets
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

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

console.log('Supabase URL defined:', !!supabaseUrl);
console.log('Supabase Anon Key defined:', !!supabaseKey);

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, role').limit(5);
  if (error) {
    console.log('Query profiles error:', error.message);
  } else {
    console.log('Profiles table exists. Count:', data.length);
    console.log('Profiles roles:', data.map(p => ({ role: p.role, email_prefix: p.email ? p.email.split('@')[0] : 'none' })));
  }

  // Check event_settings
  const { data: esData, error: esErr } = await supabase.from('event_settings').select('*').limit(1);
  console.log('event_settings exists:', !esErr, esErr ? esErr.message : '');

  // Check sdc_members if exists
  const { data: sdcData, error: sdcErr } = await supabase.from('sdc_members').select('*').limit(1);
  console.log('sdc_members exists:', !sdcErr, sdcErr ? sdcErr.message : '');

  // Check audit_logs if exists
  const { data: auditData, error: auditErr } = await supabase.from('audit_logs').select('*').limit(1);
  console.log('audit_logs exists:', !auditErr, auditErr ? auditErr.message : '');
}
