from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

ClipJobStatusType = Literal[
    'pending',
    'downloading',
    'extracting_audio',
    'transcribing',
    'analyzing_context',
    'detecting_moments',
    'scoring',
    'completed',
    'failed',
    'canceled',
    'cancelled'
]

ClipSourceType = Literal['url', 'file', 'live', 'sample']

class ViralScoreBreakdown(BaseModel):
    hook: int = Field(ge=0, le=25, description="Gancho inicial (0-25)")
    retention: int = Field(ge=0, le=20, description="Potencial de retenção (0-20)")
    emotion: int = Field(ge=0, le=20, description="Emoção e impacto (0-20)")
    clarity: int = Field(ge=0, le=20, description="Clareza e contexto (0-20)")
    shareability: int = Field(ge=0, le=15, description="Potencial de compartilhamento (0-15)")

class SpeechCue(BaseModel):
    start: float
    end: float
    text: str

class CreateJobRequest(BaseModel):
    source_video_url: str
    source_type: ClipSourceType = 'url'
    user_id: str
    is_live: bool = False
    target_duration: Literal['15-30', '30-45', '45-60', '60-90', 'auto'] = 'auto'
    keywords: List[str] = Field(default_factory=list)
    custom_title: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    user_id: str
    source_video_url: str
    source_type: ClipSourceType
    platform: str
    is_live: bool
    status: ClipJobStatusType
    progress: int
    duration: float
    current_stage: str
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str

class DetectedSegment(BaseModel):
    id: Optional[str] = None
    job_id: str
    user_id: str
    title: str
    description: str
    start_time: float
    end_time: float
    duration: float
    transcript: str
    category: str
    viral_score: int
    score_breakdown: ViralScoreBreakdown
    score_explanation: str
    suggested_caption: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    cues: List[SpeechCue] = Field(default_factory=list)

class RenderJobRequest(BaseModel):
    job_id: str
    user_id: str
    segment_id: Optional[str] = None
    video_source_url_or_path: str
    start_time: float
    end_time: float
    aspect_ratio: Literal['9:16', '16:9'] = '9:16'
    framing_mode: Literal['cover', 'black-bars', 'blur', 'smart_track'] = 'cover'
    subtitle_style: Literal['viral_classic', 'podcast_premium', 'neon_pink', 'minimalist', 'dynamic'] = 'neon_pink'
    subtitle_position: Literal['bottom', 'middle', 'top'] = 'bottom'
    subtitle_size: Literal['small', 'medium', 'large'] = 'medium'
    cues: List[SpeechCue] = Field(default_factory=list)
    caption_text: Optional[str] = None

class RenderJobResponse(BaseModel):
    success: bool
    export_id: Optional[str] = None
    output_url: str
    duration: float
    resolution: str
    file_size_bytes: int
    framing_mode: str
    error_message: Optional[str] = None
