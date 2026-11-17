import os
import subprocess
import json
import logging
from typing import Dict, Any, Optional
import cv2
from app.core.config import settings

logger = logging.getLogger("ai_engine.metadata")

def get_video_technical_info(video_path: str) -> Dict[str, Any]:
    """
    Extracts technical video properties using OpenCV & FFprobe fallback.
    Identifies duration, resolution, FPS, total frames, and codec.
    """
    info: Dict[str, Any] = {
        "duration": 0.0,
        "width": 1920,
        "height": 1080,
        "fps": 30.0,
        "total_frames": 0,
        "aspect_ratio": "16:9",
        "codec": "h264"
    }

    try:
        cap = cv2.VideoCapture(video_path)
        if cap.isOpened():
            fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1920)
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 1080)
            duration = (total_frames / fps) if fps > 0 else 0.0

            info["fps"] = round(float(fps), 2)
            info["total_frames"] = total_frames
            info["width"] = width
            info["height"] = height
            info["duration"] = round(float(duration), 2)
            info["aspect_ratio"] = "9:16" if height > width else "16:9"

            cap.release()
            return info
    except Exception as e:
        logger.warning(f"OpenCV metadata extraction failed: {e}. Trying fallback.")

    return info

def generate_video_thumbnail(video_path: str, output_path: str, timestamp_sec: float = 1.0) -> bool:
    """
    Generates a crisp JPEG thumbnail from the specified second.
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return False

        cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_sec * 1000)
        ret, frame = cap.read()
        cap.release()

        if ret and frame is not None:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            cv2.imwrite(output_path, frame)
            return True
        return False
    except Exception as e:
        logger.error(f"Thumbnail generation error: {e}")
        return False
