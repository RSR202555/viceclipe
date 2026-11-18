export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';

function streamLocalFile(filePath: string, request: NextRequest, contentType = 'video/mp4') {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get('range');

  const commonHeaders: Record<string, string> = {
    'Accept-Ranges': 'bytes',
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=3600',
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
    const fileName = searchParams.get('name');

    if (!fileName) {
      return new Response('Nome do arquivo ausente.', { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(fileName);

    // Check possible locations: /tmp/vice_renders (serverless) or public/renders (local)
    const possiblePaths = [
      path.join(os.tmpdir(), 'vice_renders', safeName),
      path.join(process.cwd(), 'public', 'renders', safeName),
      path.join(os.tmpdir(), safeName),
    ];

    const targetPath = possiblePaths.find((p) => fs.existsSync(p));

    if (!targetPath) {
      return new Response(`Arquivo "${safeName}" não encontrado ou expirado.`, { status: 404 });
    }

    return streamLocalFile(targetPath, request, 'video/mp4');
  } catch (err: any) {
    console.error('[Render File Stream Error]:', err);
    return new Response(err?.message || 'Erro ao transmitir arquivo de corte renderizado.', { status: 500 });
  }
}
