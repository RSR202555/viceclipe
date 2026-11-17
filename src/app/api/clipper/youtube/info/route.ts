export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Ytdl } from '@distube/ytdl-core';

const ytdl = new Ytdl();

function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL do YouTube é obrigatória' }, { status: 400 });
    }

    const videoId = extractYoutubeId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Formato de link do YouTube não reconhecido. Use https://youtube.com/watch?v=... ou https://youtu.be/...' },
        { status: 400 }
      );
    }

    const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      const info = await ytdl.getInfo(fullUrl);
      const lengthSeconds = Number(info.videoDetails.lengthSeconds) || 90;
      const thumbs = info.videoDetails.thumbnails || [];
      const bestThumb = thumbs[thumbs.length - 1]?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // Prioritize H.264 (AVC1) MP4 formats for universal hardware-accelerated playback
      const h264Formats = info.formats
        .filter(
          (f) =>
            f.hasVideo &&
            f.container === 'mp4' &&
            Boolean(f.url) &&
            (f.codecs?.includes('avc1') || f.mimeType?.includes('avc1'))
        )
        .sort((a, b) => (b.height || 0) - (a.height || 0));

      const allMp4Formats = info.formats
        .filter((f) => f.hasVideo && f.container === 'mp4' && Boolean(f.url))
        .sort((a, b) => (b.height || 0) - (a.height || 0));

      const videoFormat =
        h264Formats.find((f) => f.height && f.height === 1080) ||
        h264Formats.find((f) => f.height && f.height === 720) ||
        h264Formats[0] ||
        allMp4Formats.find((f) => f.height && f.height <= 1080) ||
        allMp4Formats[0] ||
        info.formats.find((f) => f.hasVideo && Boolean(f.url));

      const now = Date.now();
      const hasEmbeddedAudio = Boolean(videoFormat?.hasAudio);
      const audioUrl = hasEmbeddedAudio ? '' : `/api/clipper/youtube/stream?v=${videoId}&type=audio&t=${now}`;

      // Extract available audio tracks if video has multiple audio language streams
      const audioTracksMap = new Map<string, { id: string; label: string; isDefault: boolean }>();
      info.formats.forEach((f) => {
        if (f.audioTrack?.id && !audioTracksMap.has(f.audioTrack.id)) {
          audioTracksMap.set(f.audioTrack.id, {
            id: f.audioTrack.id,
            label: f.audioTrack.displayName || f.audioTrack.id,
            isDefault: Boolean(f.audioTrack.audioIsDefault),
          });
        }
      });
      const availableAudioTracks = Array.from(audioTracksMap.values());

      // Extract timed speech captions (subtitles of what is spoken in the video)
      let speechCues: { start: number; end: number; text: string }[] = [];
      try {
        const captionTracks = (info as any).captionTracks || [];
        const preferredTrack =
          captionTracks.find((t: any) => t.languageCode?.startsWith('pt')) ||
          captionTracks.find((t: any) => t.isDefault) ||
          captionTracks[0];

        if (preferredTrack && preferredTrack.url) {
          const timedRes = await fetch(preferredTrack.url + '&fmt=json3');
          if (timedRes.ok) {
            const timedJson = await timedRes.json();
            for (const ev of timedJson.events || []) {
              if (!ev.segs || !ev.dDurationMs) continue;
              const text = ev.segs
                .map((s: any) => s.utf8 || '')
                .join('')
                .replace(/\n/g, ' ')
                .trim();
              if (!text) continue;
              const start = Math.round((ev.tStartMs / 1000) * 10) / 10;
              const end = Math.round(((ev.tStartMs + ev.dDurationMs) / 1000) * 10) / 10;
              speechCues.push({ start, end, text });
            }
          }
        }
      } catch (captionErr) {
        console.warn('[Caption fetch warning]:', captionErr);
      }

      return NextResponse.json({
        success: true,
        videoId,
        title: info.videoDetails.title,
        author: info.videoDetails.author?.name || 'Criador do YouTube',
        duration: lengthSeconds,
        thumbnail: bestThumb,
        keywords: info.videoDetails.keywords || [],
        description: info.videoDetails.description?.substring(0, 500) || '',
        streamUrl: `/api/clipper/youtube/stream?v=${videoId}&t=${now}`,
        audioUrl,
        availableAudioTracks,
        speechCues,
      });
    } catch (ytdlErr: any) {
      console.warn('[ytdl bot detection, using oEmbed fallback]:', ytdlErr.message);

      // Robust fallback to YouTube official oEmbed API
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      if (!oembedRes.ok) {
        throw new Error('Não foi possível obter dados do vídeo do YouTube.');
      }

      const oembed = await oembedRes.json();
      const bestThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      const now = Date.now();
      return NextResponse.json({
        success: true,
        videoId,
        title: oembed.title || 'Vídeo do YouTube',
        author: oembed.author_name || 'Criador do YouTube',
        duration: 90,
        thumbnail: bestThumb,
        keywords: [oembed.author_name || '', 'YouTube', 'Viral'],
        description: `Vídeo importado de ${oembed.author_name}`,
        streamUrl: `/api/clipper/youtube/stream?v=${videoId}&t=${now}`,
        audioUrl: `/api/clipper/youtube/stream?v=${videoId}&type=audio&t=${now}`,
        isOembedFallback: true,
      });
    }
  } catch (err: any) {
    console.error('[YouTube Info Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Não foi possível carregar este vídeo do YouTube.' },
      { status: 500 }
    );
  }
}
