async function test() {
  const payload = {
    videoId: 'sample1',
    videoSourceUrl: 'D:/VICE CLIPS/public/videos/sample1.mp4',
    sourceType: 'sample',
    title: 'Amostra Gameplay GTA 6 Ocean Drive',
    author: 'Rockstar Games',
    duration: 60
  };

  console.log('Testing Next.js /api/clipper/ai-analyze endpoint...');
  const res = await fetch('http://localhost:3000/api/clipper/ai-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Source:', data.source);
  console.log('Moments Count:', data.moments?.length);
  if (data.moments && data.moments.length > 0) {
    console.log('First Moment:', JSON.stringify(data.moments[0], null, 2));
  }
}

test();
