import os
import subprocess
import logging
from app.core.config import settings

logger = logging.getLogger("ai_engine.audio")

def extract_audio_wav(
    video_source_path_or_url: str,
    output_wav_path: str,
    start_time: float = 0.0,
    duration: float = None
) -> str:
    """
    Extracts high-fidelity 16kHz mono WAV audio required for Whisper speech recognition.
    """
    os.makedirs(os.path.dirname(output_wav_path), exist_ok=True)

    cmd = [
        settings.FFMPEG_PATH,
        "-y",
        "-ss", str(max(0.0, start_time)),
    ]

    if duration is not None and duration > 0:
        cmd.extend(["-t", str(duration)])

    cmd.extend([
        "-i", video_source_path_or_url,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        output_wav_path
    ])

    logger.info(f"Extracting audio with command: {' '.join(cmd)}")
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        logger.error(f"FFmpeg audio extraction failed: {result.stderr}")
        raise RuntimeError(f"Falha ao extrair áudio do vídeo: {result.stderr[:200]}")

    if not os.path.exists(output_wav_path) or os.path.getsize(output_wav_path) == 0:
        raise RuntimeError("Arquivo de áudio extraído está vazio ou corrompido.")

    return output_wav_path
