const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = match[2] ? match[2].trim() : '';
  }
});

const client = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Verifying Supabase tables...');

  const { data: jobs, error: jobsErr } = await client.from('clip_jobs').select('*').limit(1);
  console.log('clip_jobs:', { ok: !jobsErr, error: jobsErr?.message });

  const { data: segs, error: segsErr } = await client.from('clip_segments').select('*').limit(1);
  console.log('clip_segments:', { ok: !segsErr, error: segsErr?.message });

  const { data: exportsData, error: exportsErr } = await client.from('clip_exports').select('*').limit(1);
  console.log('clip_exports:', { ok: !exportsErr, error: exportsErr?.message });
}

check();
