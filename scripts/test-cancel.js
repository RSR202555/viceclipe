async function testCancel() {
  const headers = {
    'Content-Type': 'application/json',
    'X-AI-Engine-Key': 'vice_ai_secret_engine_key_2026',
  };

  const createRes = await fetch('http://127.0.0.1:8000/api/jobs', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source_video_url: 'D:/VICE CLIPS/public/videos/gta_oceandrive.mp4',
      source_type: 'file',
      user_id: '4c81a4f5-1af3-46b7-9040-138a0f33e4c7',
    }),
  });

  const job = await createRes.json();
  console.log('Created Job ID:', job.id, '| Initial Status:', job.status);

  // Cancel immediately
  const cancelRes = await fetch(`http://127.0.0.1:8000/api/jobs/${job.id}/cancel`, {
    method: 'POST',
    headers,
  });

  const cancelData = await cancelRes.json();
  console.log('Cancelled Job Response:', cancelData);

  // Check job status
  const checkRes = await fetch(`http://127.0.0.1:8000/api/jobs/${job.id}`, { headers });
  const checkData = await checkRes.json();
  console.log('Status After Cancel:', checkData.status, '| Stage:', checkData.current_stage);
}

testCancel().catch(console.error);
