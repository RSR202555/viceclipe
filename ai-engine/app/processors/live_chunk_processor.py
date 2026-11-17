import logging
import math
from typing import List, Dict, Any
from app.services.audio_extractor import extract_audio_wav
from app.services.transcription_service import transcribe_audio
from app.analyzers.semantic_analyzer import analyze_and_rank_moments

logger = logging.getLogger("ai_engine.live_chunks")

class LongVideoChunkProcessor:
    """
    Processes long videos and live streams in memory-safe sequential chunks
    while preserving continuous global timestamps.
    """

    def __init__(self, chunk_duration_sec: float = 600.0): # 10 minute chunks default
        self.chunk_duration = chunk_duration_sec

    def process_long_video(
        self,
        video_source: str,
        total_duration: float,
        target_duration: str = 'auto',
        progress_callback = None
    ) -> List[Dict[str, Any]]:
        """
        Chunks the broadcast, transcribes in batches, offsets timestamps to live timeline,
        and aggregates the top viral moments.
        """
        num_chunks = max(1, math.ceil(total_duration / self.chunk_duration))
        all_segments = []

        logger.info(f"Processing long video ({total_duration}s) across {num_chunks} chunks...")

        for idx in range(num_chunks):
            chunk_start = idx * self.chunk_duration
            chunk_len = min(self.chunk_duration, total_duration - chunk_start)
            if chunk_len < 10.0:
                continue

            # Update progress
            if progress_callback:
                pct = int(15 + (idx / num_chunks) * 50)
                progress_callback(pct, f"Transcrevendo bloco {idx+1}/{num_chunks} ({int(chunk_start)}s - {int(chunk_start+chunk_len)}s)...")

            # Extract chunk audio
            from app.core.config import settings
            chunk_wav = str(settings.AUDIO_DIR / f"chunk_{idx}_{int(chunk_start)}.wav")
            try:
                extract_audio_wav(
                    video_source_path_or_url=video_source,
                    output_wav_path=chunk_wav,
                    start_time=chunk_start,
                    duration=chunk_len
                )

                # Transcribe chunk
                tx_data = transcribe_audio(chunk_wav)

                # Offset chunk timestamps to absolute live timeline
                for seg in tx_data.get("segments", []):
                    seg["start"] = round(seg["start"] + chunk_start, 2)
                    seg["end"] = round(seg["end"] + chunk_start, 2)
                    for c in seg.get("cues", []):
                        c["start"] = round(c["start"] + chunk_start, 2)
                        c["end"] = round(c["end"] + chunk_start, 2)
                    all_segments.append(seg)

            except Exception as e:
                logger.error(f"Error in chunk {idx}: {e}")
            finally:
                import os
                if os.path.exists(chunk_wav):
                    try:
                        os.remove(chunk_wav)
                    except:
                        pass

        # Global analysis of all chunks aggregated
        if progress_callback:
            progress_callback(75, "Analisando contexto semântico global da live...")

        aggregated_tx = {
            "duration": total_duration,
            "full_text": " ".join([s["text"] for s in all_segments]),
            "segments": all_segments
        }

        top_moments = analyze_and_rank_moments(
            transcription_data=aggregated_tx,
            video_metadata={"title": "Live Stream", "duration": total_duration},
            target_duration=target_duration
        )

        return top_moments

live_chunk_processor = LongVideoChunkProcessor()
