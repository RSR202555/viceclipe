import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Base Directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOADS_DIR: Path = STORAGE_DIR / "uploads"
    AUDIO_DIR: Path = STORAGE_DIR / "audio"
    RENDERS_DIR: Path = STORAGE_DIR / "renders"
    PUBLIC_RENDERS_DIR: Path = BASE_DIR.parent / "public" / "renders"

    # API & Security
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    AI_ENGINE_API_KEY: str = "vice_ai_secret_engine_key_2026"
    MAX_VIDEO_DURATION_SECONDS: int = 4 * 60 * 60  # 4 hours max for lives
    MAX_UPLOAD_SIZE_MB: int = 1500  # 1.5GB

    # Supabase Connection
    SUPABASE_URL: str = "https://kerkwjhuneardiexhnek.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Google Gemini API
    GEMINI_API_KEY: str = ""

    # Whisper Settings
    WHISPER_MODEL_SIZE: str = "tiny"  # 'tiny', 'base', 'small', 'medium'
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "int8"

    # FFmpeg Binary Path
    FFMPEG_PATH: str = str(BASE_DIR.parent / "node_modules" / "ffmpeg-static" / "ffmpeg.exe")

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent.parent / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
for directory in [settings.STORAGE_DIR, settings.UPLOADS_DIR, settings.AUDIO_DIR, settings.RENDERS_DIR, settings.PUBLIC_RENDERS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)
