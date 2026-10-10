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

async function check() {
  console.log('--- 1. CHECKING NEW TABLES ---');
  for (const t of ['app_admins', 'sdc_members', 'audit_logs']) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    console.log(`Table "${t}":`, error ? `NOT APPLIED (${error.message})` : 'EXISTS IN SUPABASE');
  }

  console.log('--- 2. CHECKING PROFILES is_super_admin COLUMN ---');
  const { data: prof, error: pErr } = await supabase.from('profiles').select('id, email, role, is_super_admin').limit(5);
  if (pErr) {
    console.log('Column "is_super_admin" in profiles:', `NOT APPLIED (${pErr.message})`);
  } else {
    console.log('Column "is_super_admin" in profiles: EXISTS. Profiles count:', prof.length);
    console.log('Registered profiles in database:');
    prof.forEach(p => console.log(`  - ID: ${p.id}, Email: ${p.email}, Role: ${p.role}, is_super_admin: ${p.is_super_admin}`));
  }

  console.log('--- 3. CHECKING RPC FUNCTION set_super_admin_by_email ---');
  const { data: rpcData, error: rpcErr } = await supabase.rpc('set_super_admin_by_email', { p_email: 'nonexistent_test_probe@example.com' });
  if (rpcErr) {
    if (rpcErr.message.includes('Could not find the function') || rpcErr.code === 'PGRST202') {
      console.log('Function public.set_super_admin_by_email: NOT APPLIED TO DATABASE');
    } else {
      console.log('Function public.set_super_admin_by_email: FUNCTION EXISTS (returned expected validation error:', rpcErr.message, ')');
    }
  } else {
    console.log('Function public.set_super_admin_by_email: EXISTS');
  }

  console.log('--- 4. CHECKING STORAGE BUCKET sdc-members ---');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.log('Storage buckets query error:', bErr.message);
  } else {
    const sdcBucket = buckets?.find(b => b.name === 'sdc-members' || b.id === 'sdc-members');
    console.log('Storage bucket "sdc-members":', sdcBucket ? 'EXISTS (public: ' + sdcBucket.public + ')' : 'NOT CREATED YET');
  }
}

check();
