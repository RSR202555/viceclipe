import os
import uuid
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, status
from app.core.config import settings
from app.models.schemas import (
    CreateJobRequest,
    JobResponse,
    DetectedSegment,
    RenderJobRequest,
    RenderJobResponse
)
from app.utils.security import verify_api_key, validate_url_security
from app.services.url_resolver import resolve_video_source
from app.services.video_metadata import get_video_technical_info
from app.services.audio_extractor import extract_audio_wav
from app.services.transcription_service import transcribe_audio
from app.analyzers.semantic_analyzer import analyze_and_rank_moments
from app.processors.render_processor import render_clip
from app.processors.live_chunk_processor import live_chunk_processor
from app.core.supabase import update_job_status, save_job_segments, record_export, get_supabase

logger = logging.getLogger("ai_engine.api")
router = APIRouter(prefix="/api", tags=["AI Clipper Engine"])

# In-memory active jobs store for instant status reporting
active_jobs_memory: Dict[str, Dict[str, Any]] = {}

def execute_video_analysis_pipeline(job_id: str, req_data: Dict[str, Any]):
    """
    Background worker pipeline executing Stages 1 through 5:
    1. Resolve & Ingest -> 2. Audio Extraction -> 3. Whisper Transcription ->
    4. Semantic Analysis & Boundary Fitting -> 5. Vice Viral Scoring (0-100) -> Save DB.
    """
    try:
        user_id = req_data["user_id"]
        source_url = req_data["source_video_url"]
        source_type = req_data.get("source_type", "url")
        target_duration = req_data.get("target_duration", "auto")
        is_live = req_data.get("is_live", False)
        keywords = req_data.get("keywords", [])

        # STAGE 1: Resolving & Validating
        active_jobs_memory[job_id]["status"] = "downloading"
        active_jobs_memory[job_id]["progress"] = 10
        active_jobs_memory[job_id]["current_stage"] = "Validando URL e obtendo fluxo de mídia autorizado..."
        update_job_status(job_id, "downloading", 10, active_jobs_memory[job_id]["current_stage"])

        resolved = resolve_video_source(source_url)
        stream_url = resolved.get("stream_url", source_url)
        duration = float(resolved.get("duration") or 60.0)

        active_jobs_memory[job_id]["metadata"] = resolved
        active_jobs_memory[job_id]["duration"] = duration

        if active_jobs_memory.get(job_id, {}).get("status") == "cancelled":
            logger.info(f"Job {job_id} cancelado pelo usuário.")
            return

        # STAGE 2: Extracting Audio
        active_jobs_memory[job_id]["status"] = "extracting_audio"
        active_jobs_memory[job_id]["progress"] = 25
        active_jobs_memory[job_id]["current_stage"] = "Extraindo áudio de alta fidelidade para o modelo neural..."
        update_job_status(job_id, "extracting_audio", 25, active_jobs_memory[job_id]["current_stage"], duration=duration)

        job_audio_wav = str(settings.AUDIO_DIR / f"{job_id}.wav")

        # Check if video is a long live stream (> 20 mins)
        if duration > 1200 or is_live:
            # Chunk-based Live Pipeline
            active_jobs_memory[job_id]["status"] = "transcribing"
            active_jobs_memory[job_id]["current_stage"] = "Processando gravação de live em blocos contínuos..."

            def update_progress_cb(pct: int, msg: str):
                active_jobs_memory[job_id]["progress"] = pct
                active_jobs_memory[job_id]["current_stage"] = msg
                update_job_status(job_id, "transcribing", pct, msg)

            moments = live_chunk_processor.process_long_video(
                video_source=stream_url,
                total_duration=duration,
                target_duration=target_duration,
                progress_callback=update_progress_cb
            )

        else:
            # Standard Video Pipeline
            extract_audio_wav(
                video_source_path_or_url=stream_url,
                output_wav_path=job_audio_wav,
                start_time=0.0,
                duration=duration if duration > 0 else None
            )

            if active_jobs_memory.get(job_id, {}).get("status") == "cancelled":
                if os.path.exists(job_audio_wav):
                    try: os.remove(job_audio_wav)
                    except: pass
                return

            # STAGE 3: Whisper Transcription
            active_jobs_memory[job_id]["status"] = "transcribing"
            active_jobs_memory[job_id]["progress"] = 45
            active_jobs_memory[job_id]["current_stage"] = "Transcrevendo falas e pausas com Whisper AI..."
            update_job_status(job_id, "transcribing", 45, active_jobs_memory[job_id]["current_stage"])

            transcription = transcribe_audio(job_audio_wav)

            if active_jobs_memory.get(job_id, {}).get("status") == "cancelled":
                if os.path.exists(job_audio_wav):
                    try: os.remove(job_audio_wav)
                    except: pass
                return

            # STAGE 4 & 5: Semantic Analysis & Viral Scoring
            active_jobs_memory[job_id]["status"] = "analyzing_context"
            active_jobs_memory[job_id]["progress"] = 70
            active_jobs_memory[job_id]["current_stage"] = "Analisando contexto semântico e calculando Vice Viral Score (0-100)..."
            update_job_status(job_id, "analyzing_context", 70, active_jobs_memory[job_id]["current_stage"])

            moments = analyze_and_rank_moments(
                transcription_data=transcription,
                video_metadata=resolved,
                target_duration=target_duration,
                keywords=keywords
            )

        # Cleanup wav
        if os.path.exists(job_audio_wav):
            try:
                os.remove(job_audio_wav)
            except:
                pass

        # Format and save moments
        for m in moments:
            m["job_id"] = job_id
            m["user_id"] = user_id
            m["id"] = str(uuid.uuid4())

        active_jobs_memory[job_id]["segments"] = moments
        active_jobs_memory[job_id]["status"] = "completed"
        active_jobs_memory[job_id]["progress"] = 100
        active_jobs_memory[job_id]["current_stage"] = f"Análise concluída com sucesso! {len(moments)} cortes selecionados."

        # Save to Supabase
        save_job_segments(job_id, user_id, moments)
        update_job_status(job_id, "completed", 100, active_jobs_memory[job_id]["current_stage"])
        logger.info(f"Job {job_id} completed successfully with {len(moments)} segments.")

    except Exception as e:
        logger.error(f"Error in pipeline for job {job_id}: {e}", exc_info=True)
        active_jobs_memory[job_id]["status"] = "failed"
        active_jobs_memory[job_id]["error_message"] = str(e)
        active_jobs_memory[job_id]["current_stage"] = f"Falha no processamento: {str(e)[:150]}"
        update_job_status(job_id, "failed", active_jobs_memory[job_id]["progress"], active_jobs_memory[job_id]["current_stage"], error_message=str(e))

@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_clip_job(
    req: CreateJobRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(verify_api_key)
):
    """
    Submits a new video URL or file for AI clipping analysis.
    Starts asynchronous pipeline without blocking the HTTP server.
    """
    validate_url_security(req.source_video_url, is_file=(req.source_type == 'file'))
    job_id = str(uuid.uuid4())

    from datetime import datetime, timezone
    created_at = datetime.now(timezone.utc).isoformat()

    job_data = {
        "id": job_id,
        "user_id": req.user_id,
        "source_video_url": req.source_video_url,
        "source_type": req.source_type,
        "platform": "youtube" if "youtu" in req.source_video_url else "web",
        "is_live": req.is_live,
        "status": "pending",
        "progress": 0,
        "duration": 0.0,
        "current_stage": "Na fila de processamento...",
        "error_message": None,
        "metadata": {},
        "segments": [],
        "created_at": created_at
    }

    active_jobs_memory[job_id] = job_data

    # Register in Supabase if configured
    client = get_supabase()
    if client:
        try:
            client.table("clip_jobs").insert({
                "id": job_id,
                "user_id": req.user_id,
                "source_video_url": req.source_video_url,
                "source_type": req.source_type,
                "is_live": req.is_live,
                "status": "pending",
                "progress": 0,
                "target_duration": req.target_duration,
                "current_stage": "Na fila de processamento..."
            }).execute()
        except Exception as e:
            logger.warning(f"Could not persist initial job to Supabase: {e}")

    background_tasks.add_task(execute_video_analysis_pipeline, job_id, req.dict())

    return JobResponse(**job_data)

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job_status(job_id: str, _: bool = Depends(verify_api_key)):
    """
    Fetches real-time status and stage of a processing job.
    """
    if job_id in active_jobs_memory:
        return JobResponse(**active_jobs_memory[job_id])

    # Check Supabase
    client = get_supabase()
    if client:
        res = client.table("clip_jobs").select("*").eq("id", job_id).execute()
        if res.data and len(res.data) > 0:
            row = res.data[0]
            return JobResponse(
                id=row["id"],
                user_id=row["user_id"],
                source_video_url=row["source_video_url"],
                source_type=row.get("source_type", "url"),
                platform=row.get("platform", "youtube"),
                is_live=row.get("is_live", False),
                status=row["status"],
                progress=row.get("progress", 0),
                duration=float(row.get("duration") or 0.0),
                current_stage=row.get("current_stage", ""),
                error_message=row.get("error_message"),
                metadata=row.get("metadata", {}),
                created_at=row.get("created_at", "")
            )

    raise HTTPException(status_code=404, detail="Job de clipping não encontrado.")

@router.post("/jobs/{job_id}/cancel")
def cancel_clip_job(job_id: str, _: bool = Depends(verify_api_key)):
    """
    Cancels an active or pending clipping job and cleans up temporary files.
    """
    if job_id in active_jobs_memory:
        active_jobs_memory[job_id]["status"] = "cancelled"
        active_jobs_memory[job_id]["current_stage"] = "Análise cancelada pelo usuário."

    update_job_status(job_id, "cancelled", 0, "Análise cancelada pelo usuário.")

    temp_wav = settings.AUDIO_DIR / f"{job_id}.wav"
    if temp_wav.exists():
        try:
            os.remove(temp_wav)
        except Exception:
            pass

    return {"success": True, "job_id": job_id, "status": "cancelled"}

@router.get("/jobs/{job_id}/segments")
def get_job_segments(job_id: str, _: bool = Depends(verify_api_key)):
    """
    Returns identified moments, transcripts and Vice Viral Scores for a job.
    """
    if job_id in active_jobs_memory and active_jobs_memory[job_id].get("segments"):
        return {"job_id": job_id, "segments": active_jobs_memory[job_id]["segments"]}

    client = get_supabase()
    if client:
        res = client.table("clip_segments").select("*").eq("job_id", job_id).order("viral_score", desc=True).execute()
        if res.data:
            return {"job_id": job_id, "segments": res.data}

    return {"job_id": job_id, "segments": []}

@router.post("/render", response_model=RenderJobResponse)
def render_video_endpoint(
    req: RenderJobRequest,
    _: bool = Depends(verify_api_key)
):
    """
    Renders the final clip with chosen framing mode, ASS subtitles, and AAC stereo audio.
    """
    try:
        render_result = render_clip(
            video_source=req.video_source_url_or_path,
            start_time=req.start_time,
            end_time=req.end_time,
            aspect_ratio=req.aspect_ratio,
            framing_mode=req.framing_mode,
            subtitle_style=req.subtitle_style,
            subtitle_position=req.subtitle_position,
            subtitle_size=req.subtitle_size,
            cues=[c.dict() for c in req.cues] if req.cues else [],
            caption_text=req.caption_text
        )

        # Record export in Supabase
        export_id = record_export(
            job_id=req.job_id,
            user_id=req.user_id,
            segment_id=req.segment_id,
            output_url=render_result["output_url"],
            resolution=render_result["resolution"],
            aspect_ratio=req.aspect_ratio,
            framing_mode=req.framing_mode,
            subtitle_style=req.subtitle_style,
            subtitle_position=req.subtitle_position,
            file_size_bytes=render_result["file_size_bytes"]
        )

        return RenderJobResponse(
            success=True,
            export_id=export_id,
            output_url=render_result["output_url"],
            duration=render_result["duration"],
            resolution=render_result["resolution"],
            file_size_bytes=render_result["file_size_bytes"],
            framing_mode=render_result["framing_mode"]
        )
    except Exception as e:
        logger.error(f"Render endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
