export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getYtdlInstance } from '@/lib/youtubeStream';

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
      const ytdl = getYtdlInstance();
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

      if (!videoFormat || !videoFormat.url) {
        throw new Error('Nenhum formato de vídeo reproduzível disponível para este vídeo.');
      }

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
      console.warn('[ytdl getInfo error]:', ytdlErr.message);

      const errMsg = ytdlErr?.message || '';
      const isAgeRestricted =
        errMsg.includes('confirm your age') ||
        errMsg.includes('age-restricted') ||
        errMsg.includes('AGE_RESTRICTED');
      const isBotCheck =
        errMsg.includes('not a bot') ||
        errMsg.includes('BOT_CHECK') ||
        errMsg.includes('Sign in to confirm');
      const isPlayerSolve =
        errMsg.includes('prepare player') ||
        errMsg.includes('PLAYER_SOLVE_FAILED') ||
        errMsg.includes('signature cipher');
      const isPrivate = errMsg.includes('private') || errMsg.includes('PRIVATE');
      const isNotFound =
        errMsg.includes('unavailable') ||
        errMsg.includes('NOT_FOUND') ||
        errMsg.includes('removed');

      // Attempt to fetch title & author via oembed so we can present user-friendly metadata
      let oembedTitle = '';
      let oembedAuthor = '';
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          oembedTitle = oembed.title || '';
          oembedAuthor = oembed.author_name || '';
        }
      } catch {}

      const displayTitle = oembedTitle ? `"${oembedTitle}"` : `(ID: ${videoId})`;

      if (isAgeRestricted) {
        return NextResponse.json(
          {
            success: false,
            isAgeRestricted: true,
            videoId,
            title: oembedTitle || 'Vídeo com Restrição de Idade (18+)',
            author: oembedAuthor,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            error: `O vídeo ${displayTitle} possui restrição de idade (18+) no YouTube e não permite reprodução direta sem login.`,
            suggestion:
              'O YouTube restringe a extração de vídeos para maiores. Você pode: 1) Usar a aba "Upload PC" enviando o arquivo MP4 diretamente, ou 2) Testar um link sem restrição 18+ (como trailers oficiais, podcasts ou gameplays livres).',
          },
          { status: 422 }
        );
      }

      if (isPlayerSolve) {
        return NextResponse.json(
          {
            success: false,
            videoId,
            title: oembedTitle,
            error: `O decodificador encontrou proteção no player do YouTube para ${displayTitle} (o vídeo pode conter restrição de idade ou proteção de assinatura).`,
            suggestion:
              'Para cortar este vídeo com máxima velocidade, envie o arquivo MP4 diretamente pela aba "Upload PC", ou teste com outro link público.',
          },
          { status: 422 }
        );
      }

      if (isBotCheck) {
        return NextResponse.json(
          {
            success: false,
            videoId,
            title: oembedTitle,
            error: `O YouTube bloqueou temporariamente a requisição para ${displayTitle} por verificação de segurança (Bot Check).`,
            suggestion:
              'Aguarde alguns minutos ou utilize a aba "Upload PC" para importar o arquivo diretamente do seu computador.',
          },
          { status: 429 }
        );
      }

      if (isPrivate || isNotFound) {
        return NextResponse.json(
          {
            success: false,
            error: `O vídeo ${displayTitle} está privado ou não está disponível no YouTube.`,
          },
          { status: 404 }
        );
      }

      const cleanReason = errMsg
        .replace(/^Could not play [^:]+:\s*/i, '')
        .replace(/This video needs a signed-in.*$/i, 'Este vídeo exige conta logada no YouTube.')
        .trim();

      return NextResponse.json(
        {
          success: false,
          error: `Não foi possível carregar o vídeo ${displayTitle}: ${cleanReason || 'Erro na extração de mídia'}`,
          suggestion:
            'Tente outro vídeo do YouTube ou envie o arquivo diretamente pela aba "Upload PC".',
        },
        { status: 422 }
      );
    }
  } catch (err: any) {
    console.error('[YouTube Info Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Não foi possível carregar este vídeo do YouTube.' },
      { status: 500 }
    );
  }
}
