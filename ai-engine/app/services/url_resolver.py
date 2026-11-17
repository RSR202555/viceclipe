import os
import re
import logging
from typing import Dict, Any, Optional
import yt_dlp
from app.utils.security import validate_url_security
from app.services.video_metadata import get_video_technical_info

logger = logging.getLogger("ai_engine.url_resolver")

def identify_platform(url: str) -> str:
    url_lower = url.lower()
    if (len(url) > 2 and url[1] == ':') or url.startswith('/') or url.startswith('\\') or url.startswith('file://'):
        return "direct_upload"
    elif "youtube.com" in url_lower or "youtu.be" in url_lower:
        return "youtube"
    elif "twitch.tv" in url_lower:
        return "twitch"
    elif "kick.com" in url_lower:
        return "kick"
    elif re.search(r'\.(mp4|mkv|webm|mov)(\?.*)?$', url_lower):
        return "direct_upload"
    return "other"

def resolve_video_source(url: str) -> Dict[str, Any]:
    """
    Validates URL or local file path and extracts video stream, duration, title and metadata.
    """
    platform = identify_platform(url)
    is_file = (platform == "direct_upload" and not url.startswith("http"))

    validate_url_security(url, is_file=is_file)

    # Local file fast path
    if is_file or os.path.exists(url):
        tech_info = get_video_technical_info(url)
        filename = os.path.basename(url)
        return {
            "platform": "direct_upload",
            "title": filename or "Vídeo Local",
            "author": "Local",
            "duration": tech_info.get("duration", 0.0),
            "is_live": False,
            "thumbnail": "",
            "stream_url": url,
            "fps": tech_info.get("fps", 30.0),
            "resolution": f"{tech_info.get('width', 1920)}x{tech_info.get('height', 1080)}"
        }

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'noplaylist': True,
        'extract_flat': False
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                raise ValueError("Não foi possível extrair informações da URL fornecida.")

            duration = float(info.get('duration') or 0.0)
            is_live = bool(info.get('is_live') or info.get('was_live'))

            # Direct stream URL or media file URL
            stream_url = info.get('url')
            if not stream_url and info.get('formats'):
                # Pick the highest quality stream
                formats = info.get('formats', [])
                for f in reversed(formats):
                    if f.get('url'):
                        stream_url = f.get('url')
                        break

            return {
                "platform": platform,
                "title": info.get('title', 'Vídeo Importado'),
                "author": info.get('uploader') or info.get('channel') or 'Criador',
                "duration": duration,
                "is_live": is_live,
                "thumbnail": info.get('thumbnail') or '',
                "stream_url": stream_url or url,
                "fps": info.get('fps') or 30.0,
                "resolution": f"{info.get('width', 1920)}x{info.get('height', 1080)}"
            }
    except Exception as e:
        logger.warning(f"yt-dlp extraction note: {e}")
        # Graceful fallback for direct mp4 links
        if platform == "direct_upload":
            return {
                "platform": platform,
                "title": url.split('/')[-1].split('?')[0] or "Vídeo Direto",
                "author": "Upload",
                "duration": 0.0,
                "is_live": False,
                "thumbnail": "",
                "stream_url": url,
                "fps": 30.0,
                "resolution": "1920x1080"
            }
        raise RuntimeError(f"Erro ao acessar mídia da URL informada: {str(e)[:180]}")
