import { Ytdl } from '@distube/ytdl-core';

export function getYtdlInstance(): Ytdl {
  const cookie = process.env.YOUTUBE_COOKIE?.trim();
  if (cookie) {
    try {
      return new Ytdl({ cookie });
    } catch (err: any) {
      console.warn('[ytdl] Could not initialize with YOUTUBE_COOKIE:', err?.message);
    }
  }
  return new Ytdl();
}

// In-memory cache for direct GoogleVideo stream URLs with TTL
export interface CachedStream {
  videoUrl: string;
  audioUrl: string;
  videoMime: string;
  audioMime: string;
  expiresAt: number;
}

export const streamCache = new Map<string, CachedStream>();

export async function getOrFetchStreamUrls(
  videoId: string,
  lang?: string,
  forceFresh = false
): Promise<CachedStream> {
  const cacheKey = `${videoId}:${lang || 'default'}`;
  const cached = streamCache.get(cacheKey);
  if (!forceFresh && cached && Date.now() < cached.expiresAt && cached.videoUrl) {
    return cached;
  }

  const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const ytdl = getYtdlInstance();
    const info = await ytdl.getInfo(fullUrl);

    // Prioritize H.264 (AVC1) MP4 formats for universal browser hardware acceleration (1080p60, 720p60)
    // Avoid AV1 (av01) which causes black screens on Windows/Chrome without Microsoft Store extension
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

    // Extract all audio formats that have a direct playable URL
    const audioFormats = info.formats.filter((f) => f.hasAudio && Boolean(f.url));

    // If a specific language is requested, try to find matching track
    let audioFormat = lang
      ? audioFormats.find(
          (f) =>
            f.audioTrack?.id?.toLowerCase() === lang.toLowerCase() ||
            f.audioTrack?.id?.toLowerCase().startsWith(lang.toLowerCase()) ||
            f.audioTrack?.displayName?.toLowerCase().includes(lang.toLowerCase())
        )
      : null;

    // Prioritize Portuguese > Original Track > Default Track > Highest Bitrate
    if (!audioFormat) {
      const scoredAudioFormats = audioFormats
        .map((f) => {
          let score = 0;
          const trackId = f.audioTrack?.id?.toLowerCase() || '';
          const trackName = f.audioTrack?.displayName?.toLowerCase() || '';
          const isDefault = Boolean(f.audioTrack?.audioIsDefault);

          // 1. Prefer Portuguese if available (PT-BR, Portuguese original, etc.)
          if (trackId.startsWith('pt') || trackName.includes('portuguese') || trackName.includes('português')) {
            score += 2000;
          }

          // 2. Prefer the original video audio track
          if (trackName.includes('original')) {
            score += 1000;
          }

          // 3. Prefer track explicitly marked as default by YouTube
          if (isDefault) {
            score += 500;
          }

          // 4. Prefer MP4 / M4A containers for maximum HTML5 browser playback compatibility
          if (f.container === 'mp4' || f.container === 'm4a') {
            score += 100;
          }

          // 5. Higher audio bitrate (e.g. 129kbps > 49kbps)
          score += f.audioBitrate || 0;

          return { format: f, score };
        })
        .sort((a, b) => b.score - a.score);

      audioFormat = scoredAudioFormats[0]?.format || audioFormats[0];
    }

    const entry: CachedStream = {
      videoUrl: videoFormat?.url || '',
      audioUrl: audioFormat?.url || '',
      videoMime: videoFormat?.mimeType || 'video/mp4; codecs="avc1.64002A"',
      audioMime: audioFormat?.mimeType || 'audio/mp4; codecs="mp4a.40.2"',
      expiresAt: Date.now() + 1000 * 60 * 15, // 15-minute TTL to prevent stale/expired GoogleVideo tokens
    };

    streamCache.set(cacheKey, entry);
    return entry;
  } catch (err: any) {
    console.warn('[ytdl stream fallback triggered]:', err.message);
    const fallbackEntry: CachedStream = {
      videoUrl: '',
      audioUrl: '',
      videoMime: 'video/mp4',
      audioMime: 'audio/mp4',
      expiresAt: Date.now() + 5000,
    };
    streamCache.set(cacheKey, fallbackEntry);
    return fallbackEntry;
  }
}
