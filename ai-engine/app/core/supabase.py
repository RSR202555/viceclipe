import logging
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("ai_engine.supabase")

_supabase_client: Optional[Client] = None

def get_supabase() -> Optional[Client]:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("Supabase credentials not configured. DB persistence disabled.")
        return None

    try:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        logger.info("Supabase Admin Client initialized successfully.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

# Database Helpers
def update_job_status(
    job_id: str,
    status: str,
    progress: int,
    current_stage: str,
    error_message: Optional[str] = None,
    metadata_patch: Optional[Dict[str, Any]] = None,
    duration: Optional[float] = None
) -> bool:
    client = get_supabase()
    if not client:
        return False
    try:
        payload: Dict[str, Any] = {
            "status": status,
            "progress": progress,
            "current_stage": current_stage,
        }
        if error_message is not None:
            payload["error_message"] = error_message
        if duration is not None:
            payload["duration"] = duration
        if status == "completed":
            from datetime import datetime, timezone
            payload["processing_finished_at"] = datetime.now(timezone.utc).isoformat()
        elif status == "downloading" or status == "extracting_audio":
            from datetime import datetime, timezone
            payload["processing_started_at"] = datetime.now(timezone.utc).isoformat()

        res = client.table("clip_jobs").update(payload).eq("id", job_id).execute()
        return bool(res.data)
    except Exception as e:
        logger.error(f"Error updating job {job_id}: {e}")
        return False

def save_job_segments(job_id: str, user_id: str, segments: List[Dict[str, Any]]) -> bool:
    client = get_supabase()
    if not client or not segments:
        return False
    try:
        to_insert = []
        for s in segments:
            to_insert.append({
                "job_id": job_id,
                "user_id": user_id,
                "title": s.get("title", "Corte Inteligente"),
                "description": s.get("description", ""),
                "start_time": s.get("start_time", 0.0),
                "end_time": s.get("end_time", 15.0),
                "duration": s.get("duration", 15.0),
                "transcript": s.get("transcript", ""),
                "category": s.get("category", "Geral"),
                "viral_score": s.get("viral_score", 0),
                "score_breakdown": s.get("score_breakdown", {}),
                "score_explanation": s.get("score_explanation", ""),
                "suggested_caption": s.get("suggested_caption", ""),
                "tags": s.get("tags", []),
                "cues": s.get("cues", []),
                "status": "detected"
            })
        res = client.table("clip_segments").insert(to_insert).execute()
        return bool(res.data)
    except Exception as e:
        logger.error(f"Error saving segments for job {job_id}: {e}")
        return False

def record_export(
    job_id: str,
    user_id: str,
    segment_id: Optional[str],
    output_url: str,
    resolution: str,
    aspect_ratio: str,
    framing_mode: str,
    subtitle_style: str,
    subtitle_position: str,
    file_size_bytes: int,
    status: str = "ready"
) -> Optional[str]:
    client = get_supabase()
    if not client:
        return None
    try:
        data = {
            "job_id": job_id,
            "user_id": user_id,
            "segment_id": segment_id,
            "output_url": output_url,
            "resolution": resolution,
            "aspect_ratio": aspect_ratio,
            "framing_mode": framing_mode,
            "subtitle_style": subtitle_style,
            "subtitle_position": subtitle_position,
            "file_size_bytes": file_size_bytes,
            "status": status
        }
        res = client.table("clip_exports").insert(data).execute()
        if res.data and len(res.data) > 0:
            return res.data[0].get("id")
        return None
    except Exception as e:
        logger.error(f"Error recording export: {e}")
        return None
