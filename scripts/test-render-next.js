async function testNextRender() {
  const payload = {
    videoId: 'sample1',
    videoSourceType: 'sample',
    sampleVideoUrl: '/videos/sample1.mp4',
    startTime: 0,
    endTime: 3,
    aspectRatio: '9:16',
    framingMode: 'cover',
    subtitleStyle: 'neon-pink',
    subtitlePosition: 'bottom',
    subtitleSize: 'medium',
    includeSubtitles: true,
    captionText: 'SUPABASE EXPORT INTEGRATION TEST'
  };

  console.log('Testing Next.js /api/clipper/render with Supabase clip_exports...');
  const res = await fetch('http://localhost:3000/api/clipper/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Render API response:', res.status, data);

  // Check Supabase clip_exports table
  const { createClient } = require('@supabase/supabase-js');
  const fs = require('fs');
  const path = require('path');
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envContent.split(/\r?\n/).forEach((l) => {
    const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m) env[m[1]] = m[2] ? m[2].trim() : '';
  });

  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: exportsData, error } = await client.from('clip_exports').select('*').order('created_at', { ascending: false }).limit(1);
  console.log('Supabase clip_exports latest record:', exportsData, 'error:', error?.message);
}

testNextRender();
