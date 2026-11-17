async function testRender() {
  const payload = {
    job_id: '8610fe39-61d1-47e4-ab91-07541f7c932e',
    user_id: '4c81a4f5-1af3-46b7-9040-138a0f33e4c7',
    segment_id: '390baa7b-698c-4c13-95e4-a11be1c47ce4',
    video_source_url_or_path: 'D:/VICE CLIPS/public/videos/sample1.mp4',
    start_time: 0,
    end_time: 3,
    aspect_ratio: '9:16',
    framing_mode: 'cover',
    subtitle_style: 'neon_pink',
    subtitle_position: 'bottom',
    subtitle_size: 'medium',
    caption_text: 'TESTE ENGINE PYTHON 9:16'
  };

  console.log('Sending render request to AI Engine...');
  const res = await fetch('http://127.0.0.1:8000/api/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AI-Engine-Key': 'vice_ai_secret_engine_key_2026'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Render response:', res.status, data);
}

testRender();
