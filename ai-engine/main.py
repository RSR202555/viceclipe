import logging
import os
import shutil
import cv2
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.supabase import get_supabase
from app.api.routes import router as api_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("ai_engine.main")

app = FastAPI(
    title="VICE CLIPPER — AI Engine",
    description="Motor Independente de Processamento Audiovisual, Transcrição Whisper, Análise Semântica e Clipping Inteligente.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("🚀 VICE CLIPPER — AI ENGINE INICIADO COM SUCESSO!")
    logger.info(f"Porta: {settings.PORT} | Host: {settings.HOST}")
    logger.info(f"FFmpeg Path: {settings.FFMPEG_PATH} (Existe: {os.path.exists(settings.FFMPEG_PATH)})")
    logger.info(f"OpenCV Version: {cv2.__version__}")
    logger.info(f"Whisper Model: {settings.WHISPER_MODEL_SIZE} no device {settings.WHISPER_DEVICE}")
    logger.info(f"Supabase URL: {settings.SUPABASE_URL}")
    logger.info("=" * 60)

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """
    Diagnostic health check for the Python AI Engine.
    """
    ffmpeg_ok = os.path.exists(settings.FFMPEG_PATH)
    supabase_client = get_supabase()
    supabase_ok = supabase_client is not None

    return {
        "status": "healthy" if ffmpeg_ok else "degraded",
        "service": "vice-clipper-ai-engine",
        "version": "1.0.0",
        "ffmpeg": {
            "path": settings.FFMPEG_PATH,
            "available": ffmpeg_ok
        },
        "opencv": {
            "version": cv2.__version__,
            "available": True
        },
        "whisper": {
            "model_size": settings.WHISPER_MODEL_SIZE,
            "device": settings.WHISPER_DEVICE,
            "compute_type": settings.WHISPER_COMPUTE_TYPE
        },
        "supabase": {
            "connected": supabase_ok,
            "url": settings.SUPABASE_URL
        },
        "gemini": {
            "configured": bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 5)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=False)
