export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { getOrFetchStreamUrls, streamCache } from '@/lib/youtubeStream';

// Fallback local streamer with robust Range request support using standard Readable.toWeb
function streamLocalFile(filePath: string, request: NextRequest, contentType = 'video/mp4') {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get('range');

  const commonHeaders: Record<string, string> = {
    'Accept-Ranges': 'bytes',
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  };

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || start >= fileSize) {
      return new Response(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${fileSize}`,
          ...commonHeaders,
        },
      });
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const webStream = Readable.toWeb(file);

    return new Response(webStream as any, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': String(chunksize),
        ...commonHeaders,
      },
    });
  } else {
    const file = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(file);

    return new Response(webStream as any, {
      status: 200,
      headers: {
        'Content-Length': String(fileSize),
        ...commonHeaders,
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('v');
    const type = searchParams.get('type') || 'video'; // 'video' | 'audio'
    const lang = searchParams.get('lang') || '';

    if (!videoId) {
      return new Response('Parâmetro v (ID do vídeo) ausente.', { status: 400 });
    }

    const cacheKey = `${videoId}:${lang || 'default'}`;
    let cached = await getOrFetchStreamUrls(videoId, lang);
    let targetUrl = type === 'audio' ? cached.audioUrl : cached.videoUrl;

    // If ytdl provided a valid GoogleVideo direct stream URL, proxy it with range support
    if (targetUrl) {
      const clientRange = request.headers.get('range');
      const upstreamHeaders: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      };

      if (clientRange) {
        upstreamHeaders['Range'] = clientRange;
      }

      let upstreamRes: Response | null = null;
      try {
        upstreamRes = await fetch(targetUrl, {
          headers: upstreamHeaders,
        });
      } catch (fErr) {
        console.warn('[YouTube Stream initial fetch error]:', fErr);
      }

      // If GoogleVideo URL expired or returned 403 / 410, purge cache, fetch fresh URL and retry immediately
      if (!upstreamRes || upstreamRes.status === 403 || upstreamRes.status === 410) {
        console.warn(`[YouTube Stream] URL expired or forbidden (${upstreamRes?.status}), refetching fresh stream URLs...`);
        streamCache.delete(cacheKey);
        cached = await getOrFetchStreamUrls(videoId, lang, true);
        targetUrl = type === 'audio' ? cached.audioUrl : cached.videoUrl;
        if (targetUrl) {
          try {
            upstreamRes = await fetch(targetUrl, {
              headers: upstreamHeaders,
            });
          } catch (rErr) {
            console.warn('[YouTube Stream retry fetch error]:', rErr);
          }
        }
      }

      // If upstream is healthy (200 or 206 Partial Content)
      if (upstreamRes && (upstreamRes.ok || upstreamRes.status === 206)) {
        const responseHeaders = new Headers();
        responseHeaders.set('Accept-Ranges', 'bytes');
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        responseHeaders.set('Pragma', 'no-cache');
        responseHeaders.set('Expires', '0');

        const contentRange = upstreamRes.headers.get('content-range');
        if (contentRange) {
          responseHeaders.set('Content-Range', contentRange);
        }

        const contentLength = upstreamRes.headers.get('content-length');
        if (contentLength) {
          responseHeaders.set('Content-Length', contentLength);
        }

        const mime = type === 'audio' ? cached.audioMime : cached.videoMime;
        responseHeaders.set('Content-Type', mime || (type === 'audio' ? 'audio/mp4' : 'video/mp4'));

        return new Response(upstreamRes.body, {
          status: upstreamRes.status,
          headers: responseHeaders,
        });
      }

      console.warn(`[YouTube Stream] Upstream stream unavailable (status ${upstreamRes?.status}). Falling back to local playable gameplay.`);
    }

    // High performance local fallback if bot detection or expired token blocked direct streams
    const fallbackPath = path.join(process.cwd(), 'public', 'videos', 'gta_oceandrive.mp4');
    if (fs.existsSync(fallbackPath)) {
      return streamLocalFile(fallbackPath, request, type === 'audio' ? 'audio/mp4' : 'video/mp4');
    }

    return new Response(`Formato ${type} não disponível para este vídeo.`, { status: 404 });
  } catch (err: any) {
    console.error('[YouTube Stream Error]:', err);
    return new Response(err.message || 'Erro ao transmitir vídeo do YouTube', { status: 500 });
  }
}
