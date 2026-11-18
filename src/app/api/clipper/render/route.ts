export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow serverless functions up to 60s for video rendering

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getOrFetchStreamUrls } from '@/lib/youtubeStream';
import { supabaseAdmin } from '@/lib/supabase';

const execFileAsync = promisify(execFile);

// Cleanup old files in public/renders (older than 2 hours)
function cleanupOldRenders(dir: string) {
  try {
    if (!fs.existsSync(dir)) return;
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (now - stat.mtimeMs > maxAge) {
        fs.unlinkSync(full);
      }
    }
  } catch (err) {
    console.warn('[cleanupOldRenders warning]:', err);
  }
}

function formatAssTime(sec: number): string {
  const s = Math.max(0, sec);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const cs = Math.floor((s - Math.floor(s)) * 100);
  return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

// Build video and subtitle filter args for FFmpeg
function buildVideoFilter({
  aspectRatio,
  framingMode,
  coverZoom = 1.18,
  captionText,
  subtitleStyle,
  subtitlePosition = 'bottom',
  subtitleSize = 'medium',
  hasSeparateAudio,
  assFileRelPath,
}: {
  aspectRatio: string;
  framingMode: string;
  coverZoom?: number;
  captionText?: string;
  subtitleStyle?: string;
  subtitlePosition?: string;
  subtitleSize?: string;
  hasSeparateAudio?: boolean;
  assFileRelPath?: string | null;
}) {
  let subtitleFilter = '';

  if (assFileRelPath) {
    // Mode A: Dynamic timed speech captions from .ass with exact PlayRes scaling
    // Escape colons and backslashes for FFmpeg filtergraph syntax
    const safeAss = assFileRelPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    subtitleFilter = `subtitles='${safeAss}'`;
  } else if (captionText && captionText.trim()) {
    // Mode B: Static highlight headline banner
    const esc = captionText
      .trim()
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[:\\']/g, '\\$&');

    let color = 'fontcolor=white:box=1:boxcolor=black@0.8:boxborderw=14';
    if (subtitleStyle === 'neon-pink') {
      color = 'fontcolor=#FF1493:box=1:boxcolor=black@0.75:boxborderw=16';
    } else if (subtitleStyle === 'cyber-cyan') {
      color = 'fontcolor=#00ffff:box=1:boxcolor=black@0.75:boxborderw=16';
    } else if (subtitleStyle === 'gold') {
      color = 'fontcolor=#ffd700:box=1:boxcolor=black@0.75:boxborderw=16';
    }

    let fontSize = 44;
    if (subtitleSize === 'small') fontSize = 34;
    if (subtitleSize === 'large') fontSize = 54;

    let y = 'h-text_h-240'; // Default bottom / lower-third
    if (subtitlePosition === 'top') y = '160';
    if (subtitlePosition === 'middle') y = '(h-text_h)/2';

    subtitleFilter = `drawtext=text='${esc}':${color}:fontsize=${fontSize}:x=(w-text_w)/2:y=${y}`;
  }

  const audioMap = hasSeparateAudio ? '1:a' : '0:a?';

  if (aspectRatio === '9:16') {
    if (framingMode === 'cover') {
      // 1. Smart Cover: Proportional intelligent fill with balanced zoom limit (preserves >84% width and all subjects)
      // Enforces a strict zoom limit to avoid aggressive crop while 100% filling 9:16 screen
      const safeZoom = Math.min(1.35, Math.max(1.0, Number(coverZoom) || 1.18));
      const fgWidth = Math.round(1080 * safeZoom);

      let fc =
        `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=16:4,setsar=1[bg];` +
        `[0:v]scale=${fgWidth}:-2,crop=1080:ih:(iw-1080)/2:0,setsar=1[fg];` +
        `[bg][fg]overlay=(W-w)/2:(H-h)/2`;

      if (subtitleFilter) {
        fc += `[merged];[merged]${subtitleFilter}[outv]`;
      } else {
        fc += '[outv]';
      }
      return ['-filter_complex', fc, '-map', '[outv]', '-map', audioMap];
    } else if (framingMode === 'black-bars') {
      // 2. Black bars: Center whole video inside 1080x1920 with solid black background (NO blur/shading)
      const vf = [
        'scale=1080:1920:force_original_aspect_ratio=decrease',
        'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
        subtitleFilter,
      ]
        .filter(Boolean)
        .join(',');
      return ['-vf', vf, '-map', '0:v', '-map', audioMap];
    } else {
      // 3. Blur: Ambient synthwave blurred background + centered crisp video
      let fc =
        '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2';
      if (subtitleFilter) {
        fc += `[merged];[merged]${subtitleFilter}[outv]`;
      } else {
        fc += '[outv]';
      }
      return ['-filter_complex', fc, '-map', '[outv]', '-map', audioMap];
    }
  } else {
    // 16:9 format
    const vf = [
      'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black',
      subtitleFilter,
    ]
      .filter(Boolean)
      .join(',');
    return ['-vf', vf, '-map', '0:v', '-map', audioMap];
  }
}

export async function POST(request: NextRequest) {
  let tempAssPath: string | null = null;
  try {
    const body = await request.json();
    const {
      userId,
      jobId,
      segmentId,
      videoId,
      videoSourceType = 'url',
      sampleVideoUrl,
      videoUrl,
      startTime = 0,
      endTime = 15,
      aspectRatio = '9:16',
      framingMode = 'cover', // Default to 'cover' (fills screen, zero blur)
      coverZoom = 1.18, // Default smart open framing zoom (1.18x)
      lang,
      videoFilter = 'normal',
      captionText = '',
      subtitleStyle = 'neon-pink',
      subtitlePosition = 'bottom', // Default to 'bottom' (lower-third, doesn't block faces)
      subtitleSize = 'medium',
      subtitleMode = 'speech',
      includeSubtitles = true,
      speechCues = [],
    } = body;

    const startSec = Math.max(0, Number(startTime) || 0);
    const endSec = Math.max(startSec + 1, Number(endTime) || (startSec + 10));
    const durationSec = Math.min(60, endSec - startSec); // Cap clip at 60s for high responsiveness

    // Ensure output directory exists (safe for both serverless/read-only and local environments)
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    let rendersDir: string;
    if (isServerless) {
      rendersDir = path.join(os.tmpdir(), 'vice_renders');
    } else {
      rendersDir = path.join(process.cwd(), 'public', 'renders');
    }

    try {
      if (!fs.existsSync(rendersDir)) {
        fs.mkdirSync(rendersDir, { recursive: true });
      }
      cleanupOldRenders(rendersDir);
    } catch (fsErr) {
      console.warn('[rendersDir init warning]:', fsErr);
      rendersDir = path.join(os.tmpdir(), 'vice_renders');
      if (!fs.existsSync(rendersDir)) {
        fs.mkdirSync(rendersDir, { recursive: true });
      }
    }

    let assFileRelPath: string | null = null;

    // Build real speech dialogue subtitle file (.ass) with exact PlayRes coordinates
    if (includeSubtitles && subtitleMode === 'speech' && Array.isArray(speechCues) && speechCues.length > 0) {
      const activeCues = speechCues.filter(
        (c: any) => c.end > startSec && c.start < endSec && c.text && c.text.trim()
      );

      if (activeCues.length > 0) {
        const playResX = aspectRatio === '9:16' ? 1080 : 1920;
        const playResY = aspectRatio === '9:16' ? 1920 : 1080;

        // Font color (ASS format is &HAABBGGRR)
        let assColor = '&H00FFFFFF';
        if (subtitleStyle === 'neon-pink') assColor = '&H009314FF';
        else if (subtitleStyle === 'cyber-cyan') assColor = '&H00FFFF00';
        else if (subtitleStyle === 'gold') assColor = '&H0000D7FF';

        let fontSize = aspectRatio === '9:16' ? 46 : 34;
        if (subtitleSize === 'small') fontSize = aspectRatio === '9:16' ? 36 : 26;
        if (subtitleSize === 'large') fontSize = aspectRatio === '9:16' ? 56 : 42;

        let alignment = 2; // bottom center
        let marginV = aspectRatio === '9:16' ? 240 : 80; // lower-third positioning
        if (subtitlePosition === 'top') {
          alignment = 8;
          marginV = aspectRatio === '9:16' ? 160 : 70;
        } else if (subtitlePosition === 'middle') {
          alignment = 5;
          marginV = 0;
        }

        const eventsSection = activeCues
          .map((c: any) => {
            const relStart = Math.max(0, c.start - startSec);
            const relEnd = Math.min(durationSec, c.end - startSec);
            const cleanText = c.text.trim().replace(/[\r\n\t]/g, ' ');
            return `Dialogue: 0,${formatAssTime(relStart)},${formatAssTime(relEnd)},Style1,,0,0,0,,${cleanText}`;
          })
          .join('\n');

        const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: ${playResX}
PlayResY: ${playResY}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Style1,Arial,${fontSize},${assColor},&H000000FF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,3.5,1.5,${alignment},40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${eventsSection}
`;

        const assFileName = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.ass`;
        tempAssPath = path.join(rendersDir, assFileName);
        fs.writeFileSync(tempAssPath, assContent, 'utf8');
        assFileRelPath = tempAssPath;
      }
    }

    const outFileName = `vice_clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.mp4`;
    const outFilePath = path.join(rendersDir, outFileName);

    // Resolve FFmpeg binary
    const possiblePaths = [
      path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
      path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg'),
    ];
    let ffmpegPath = possiblePaths.find((p) => fs.existsSync(p));
    if (!ffmpegPath) {
      try {
        const required = require('ffmpeg-static') as string;
        if (fs.existsSync(required)) ffmpegPath = required;
      } catch {}
    }
    if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
      throw new Error('Binário do FFmpeg não encontrado no servidor.');
    }

    // Ensure execution permissions on serverless Linux
    try {
      fs.chmodSync(ffmpegPath, '755');
    } catch {}

    let inputArgs: string[] = [];
    let filterArgs: string[] = [];

    const effectiveCaption = includeSubtitles ? captionText : '';

    // Case 1: Local sample gameplay video or direct path
    const resolvedMedia = sampleVideoUrl || videoUrl;
    if (videoSourceType === 'sample' || (resolvedMedia && (resolvedMedia.startsWith('/videos/') || resolvedMedia.includes('public/videos')))) {
      const cleanRel = (resolvedMedia || '/videos/gta_oceandrive.mp4')
        .replace(/^.*\/videos\//, 'videos/')
        .replace(/^\//, '');
      const localFile = path.join(process.cwd(), 'public', cleanRel);
      if (!fs.existsSync(localFile)) {
        throw new Error(`Arquivo de vídeo "${cleanRel}" não encontrado no servidor.`);
      }

      inputArgs = [
        '-ss', String(startSec),
        '-to', String(startSec + durationSec),
        '-i', localFile,
      ];

      filterArgs = buildVideoFilter({
        aspectRatio,
        framingMode,
        coverZoom,
        captionText: effectiveCaption,
        subtitleStyle,
        subtitlePosition,
        subtitleSize,
        hasSeparateAudio: false,
        assFileRelPath,
      });
    } else if (videoId) {
      // Case 2: YouTube Video with separate audio & video adaptive streams
      const cached = await getOrFetchStreamUrls(videoId, lang);
      if (!cached || !cached.videoUrl) {
        throw new Error('Não foi possível obter a transmissão do vídeo do YouTube.');
      }

      const hasSeparateAudio = Boolean(cached.audioUrl);

      if (hasSeparateAudio) {
        inputArgs = [
          '-ss', String(startSec),
          '-to', String(startSec + durationSec),
          '-i', cached.videoUrl,
          '-ss', String(startSec),
          '-to', String(startSec + durationSec),
          '-i', cached.audioUrl,
        ];
      } else {
        // Video already has embedded audio
        inputArgs = [
          '-ss', String(startSec),
          '-to', String(startSec + durationSec),
          '-i', cached.videoUrl,
        ];
      }

      filterArgs = buildVideoFilter({
        aspectRatio,
        framingMode,
        coverZoom,
        captionText: effectiveCaption,
        subtitleStyle,
        subtitlePosition,
        subtitleSize,
        hasSeparateAudio,
        assFileRelPath,
      });
    } else {
      throw new Error('Nenhum vídeo fornecido para renderização.');
    }

    // Assemble final ffmpeg command args
    const finalArgs = [
      ...inputArgs,
      ...filterArgs,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '22',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      '-y',
      outFilePath,
    ];

    console.log('[FFmpeg Render Start]:', { videoId, startSec, durationSec, outFileName });
    const startTimeMs = Date.now();
    await execFileAsync(ffmpegPath, finalArgs);
    console.log('[FFmpeg Render Success]: Done in', Date.now() - startTimeMs, 'ms');

    if (tempAssPath && fs.existsSync(tempAssPath)) {
      try {
        fs.unlinkSync(tempAssPath);
      } catch {}
    }

    // Construct universal video access URL (works both locally and in serverless /tmp)
    const finalVideoUrl = `/api/clipper/render/file?name=${encodeURIComponent(outFileName)}`;

    // Persist real export to Supabase
    try {
      const stats = fs.statSync(outFilePath);
      await supabaseAdmin.from('clip_exports').insert({
        user_id: userId || '4c81a4f5-1af3-46b7-9040-138a0f33e4c7',
        job_id: jobId || null,
        segment_id: segmentId || null,
        output_url: finalVideoUrl,
        resolution: aspectRatio === '9:16' ? '1080p' : '1080p',
        aspect_ratio: aspectRatio,
        framing_mode: framingMode,
        subtitle_style: subtitleStyle,
        subtitle_position: subtitlePosition,
        file_size_bytes: stats.size,
        status: 'ready'
      });
    } catch (dbErr) {
      console.warn('[clip_exports db persist note]:', dbErr);
    }

    return NextResponse.json({
      success: true,
      videoUrl: finalVideoUrl,
      filename: outFileName,
      duration: durationSec,
    });
  } catch (err: any) {
    if (tempAssPath && fs.existsSync(tempAssPath)) {
      try {
        fs.unlinkSync(tempAssPath);
      } catch {}
    }
    console.error('[FFmpeg Render Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar e recortar vídeo com FFmpeg.' },
      { status: 500 }
    );
  }
}
