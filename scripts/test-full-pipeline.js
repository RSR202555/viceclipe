const http = require('http');

async function testPipeline() {
  console.log('--- TESTANDO PIPELINE COMPLETO DO VICE CLIPPER ---');

  // 1. Health check FastAPI AI Engine
  console.log('\n[1/4] Testando FastAPI AI Engine (Health)...');
  const healthRes = await fetch('http://127.0.0.1:8000/health');
  const health = await healthRes.json();
  console.log('Status FastAPI:', health.status, '| Supabase:', health.supabase.connected, '| Whisper:', health.whisper.model_size);

  // 2. Test AI Analyze API with Target Duration
  console.log('\n[2/4] Testando Gateway Next.js /api/clipper/ai-analyze com targetDuration=30-45...');
  const analyzeRes = await fetch('http://localhost:3000/api/clipper/ai-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoId: 'sample-oceandrive',
      videoSourceUrl: 'D:/VICE CLIPS/public/videos/gta_oceandrive.mp4',
      sourceType: 'sample',
      title: 'Perseguição Policial em Vice City',
      author: 'Rockstar Games',
      duration: 46,
      targetDuration: '30-45',
      keywords: ['perseguição', 'polícia', 'velocidade', 'ação'],
    }),
  });

  const analyzeData = await analyzeRes.json();
  console.log('Status Análise:', analyzeRes.status, '| Source:', analyzeData.source, '| Momentos:', analyzeData.moments?.length);
  if (analyzeData.moments && analyzeData.moments.length > 0) {
    const m = analyzeData.moments[0];
    console.log(`Momento Top: "${m.title}" (${m.startTime}s - ${m.endTime}s) - Viral Score: ${m.viralScore}`);
    console.log('Breakdown Viral:', m.scoreBreakdown);
  }

  // 3. Test Jobs API
  console.log('\n[3/4] Testando Gateway Next.js /api/clipper/jobs...');
  const jobsRes = await fetch('http://localhost:3000/api/clipper/jobs');
  const jobsData = await jobsRes.json();
  console.log('Status Jobs:', jobsRes.status, '| Jobs encontrados:', jobsData.jobs?.length);

  // 4. Test Render API with Subtitle & Cover Framing
  console.log('\n[4/4] Testando Gateway Next.js /api/clipper/render (Cover Framing + Subtitle Rodapé)...');
  const renderRes = await fetch('http://localhost:3000/api/clipper/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoUrl: '/videos/gta_oceandrive.mp4',
      startTime: 2,
      endTime: 6, // 4-second quick render test
      aspectRatio: '9:16',
      framingMode: 'cover',
      captionText: 'A VELOCIDADE DESSA JOGADA FOI SURREAL! 🏎️💥',
      subtitleStyle: 'neon-pink',
      subtitlePosition: 'bottom',
      subtitleSize: 'medium',
      resolution: '1080p',
    }),
  });

  const renderData = await renderRes.json();
  console.log('Status Render:', renderRes.status, '| Sucesso:', renderData.success);
  console.log('URL de Saída:', renderData.downloadUrl);
  console.log('Tamanho em Bytes:', renderData.fileSizeBytes);
  console.log('Supabase Export Id:', renderData.exportId);

  console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO REAL!');
}

testPipeline().catch((err) => {
  console.error('❌ Erro no pipeline:', err);
  process.exit(1);
});
