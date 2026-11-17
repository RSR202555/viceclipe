import os
import logging
from typing import List, Dict, Any, Optional
from faster_whisper import WhisperModel
from app.core.config import settings

logger = logging.getLogger("ai_engine.transcription")

_whisper_instance: Optional[WhisperModel] = None

def get_whisper_model() -> WhisperModel:
    global _whisper_instance
    if _whisper_instance is None:
        logger.info(f"Loading Whisper model '{settings.WHISPER_MODEL_SIZE}' on {settings.WHISPER_DEVICE}...")
        _whisper_instance = WhisperModel(
            model_size_or_path=settings.WHISPER_MODEL_SIZE,
            device=settings.WHISPER_DEVICE,
            compute_type=settings.WHISPER_COMPUTE_TYPE,
            download_root=str(settings.STORAGE_DIR / "models")
        )
        logger.info("Whisper model loaded successfully.")
    return _whisper_instance

def transcribe_audio(
    wav_path: str,
    language: str = "pt",
    word_timestamps: bool = True
) -> Dict[str, Any]:
    """
    Transcribes audio with word-level timestamps, pause detection and speech density.
    """
    if not os.path.exists(wav_path):
        raise FileNotFoundError(f"Áudio não encontrado em {wav_path}")

    model = get_whisper_model()
    segments_raw, info = model.transcribe(
        wav_path,
        language=language,
        beam_size=5,
        word_timestamps=word_timestamps,
        vad_filter=True, # Voice Activity Detection filter
        vad_parameters=dict(min_silence_duration_ms=400)
    )

    segments_list: List[Dict[str, Any]] = []
    full_text_pieces: List[str] = []

    prev_end = 0.0

    for seg in segments_raw:
        text = seg.text.strip()
        if not text:
            continue

        full_text_pieces.append(text)
        pause_before = max(0.0, round(seg.start - prev_end, 2)) if prev_end > 0 else 0.0
        duration = max(0.1, round(seg.end - seg.start, 2))
        word_count = len(text.split())
        words_per_sec = round(word_count / duration, 2)
        # Speech intensity: higher words per second + confidence indicates excitement / intense moment
        intensity = min(100, int(words_per_sec * 22))

        cues: List[Dict[str, Any]] = []
        if hasattr(seg, 'words') and seg.words:
            for w in seg.words:
                cues.append({
                    "start": round(w.start, 2),
                    "end": round(w.end, 2),
                    "word": w.word.strip(),
                    "probability": round(w.probability, 2)
                })

        segments_list.append({
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
            "duration": duration,
            "text": text,
            "pause_before": pause_before,
            "intensity": intensity,
            "words_per_sec": words_per_sec,
            "cues": cues
        })

        prev_end = seg.end

    full_transcript = " ".join(full_text_pieces)

    return {
        "language": info.language,
        "language_probability": round(info.language_probability, 2),
        "duration": round(info.duration, 2),
        "full_text": full_transcript,
        "segments": segments_list
    }
