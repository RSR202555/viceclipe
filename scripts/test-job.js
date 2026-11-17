async function test() {
  const payload = {
    source_video_url: 'D:/VICE CLIPS/public/videos/sample1.mp4',
    source_type: 'file',
    user_id: '4c81a4f5-1af3-46b7-9040-138a0f33e4c7',
    target_duration: '15-30',
    is_live: false
  };

  console.log('Sending job request to AI Engine on port 8000...');
  const res = await fetch('http://127.0.0.1:8000/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AI-Engine-Key': 'vice_ai_secret_engine_key_2026'
    },
    body: JSON.stringify(payload)
  });

  const job = await res.json();
  console.log('Job response status:', res.status, job);

  if (job.id) {
    console.log('Polling job status for 5 seconds...');
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const sRes = await fetch(`http://127.0.0.1:8000/api/jobs/${job.id}`, {
        headers: { 'X-AI-Engine-Key': 'vice_ai_secret_engine_key_2026' }
      });
      const statusData = await sRes.json();
      console.log(`Poll ${i+1}:`, statusData.status, `(${statusData.progress}%)`, '-', statusData.current_stage);
      if (statusData.status === 'completed' || statusData.status === 'failed') {
        const segRes = await fetch(`http://127.0.0.1:8000/api/jobs/${job.id}/segments`, {
          headers: { 'X-AI-Engine-Key': 'vice_ai_secret_engine_key_2026' }
        });
        const segData = await segRes.json();
        console.log('Detected Segments:', JSON.stringify(segData, null, 2));
        break;
      }
    }
  }
}

test();
