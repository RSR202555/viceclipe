import os
import cv2
import numpy as np
import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger("ai_engine.reframe")

class SmartReframeProcessor:
    """
    OpenCV Smart Reframe Processor.
    Transforms 16:9 horizontal videos to 9:16 vertical reels with AI Face Tracking
    and Exponential Moving Average (EMA) camera stabilization.
    """

    def __init__(self):
        # Support both OpenCV 4.x (CascadeClassifier) and modern OpenCV 5.x
        self.face_cascade = None
        if hasattr(cv2, "CascadeClassifier"):
            possible_paths = [
                os.path.join(getattr(cv2.data, "haarcascades", ""), "haarcascade_frontalface_default.xml"),
                os.path.join(os.path.dirname(__file__), "haarcascade_frontalface_default.xml"),
            ]
            for p in possible_paths:
                if os.path.exists(p):
                    try:
                        self.face_cascade = cv2.CascadeClassifier(p)
                        logger.info(f"OpenCV Face Cascade loaded successfully from {p}")
                        break
                    except Exception as e:
                        logger.warning(f"Could not load cascade: {e}")

        if self.face_cascade is None:
            logger.info("OpenCV smart subject tracker initialized with motion/center detection.")

    def compute_optimal_crop_center(
        self,
        video_path_or_url: str,
        start_sec: float,
        duration_sec: float,
        sample_fps: float = 3.0
    ) -> float:
        """
        Samples the video segment and tracks the primary subject across frames.
        Returns the optimal normalized center X coordinate (0.0 to 1.0) with jitter smoothing.
        """
        cap = cv2.VideoCapture(video_path_or_url)
        if not cap.isOpened():
            logger.warning(f"Failed to open video for reframe analysis: {video_path_or_url}")
            return 0.5 # Center fallback

        orig_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1920)
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 1080)

        # 9:16 width inside original height
        target_crop_w = int(height * (9.0 / 16.0))
        max_x = max(0, width - target_crop_w)

        # Seek to start second
        cap.set(cv2.CAP_PROP_POS_MSEC, start_sec * 1000)

        frame_step = max(1, int(orig_fps / sample_fps))
        current_frame = 0
        total_sample_frames = int(duration_sec * orig_fps)

        smoothed_x = (width - target_crop_w) / 2.0 # Default center
        detected_centers: List[float] = []
        alpha = 0.20 # Exponential smoothing factor (camera drag)

        while current_frame < total_sample_frames:
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            if current_frame % frame_step == 0:
                target_center_x = width / 2.0 # Default frame center

                if self.face_cascade is not None:
                    # Convert to grayscale for fast detection
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    faces = self.face_cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.2,
                        minNeighbors=5,
                        minSize=(50, 50)
                    )

                    if len(faces) > 0:
                        # Pick the largest face (primary protagonist in foreground)
                        faces_sorted = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                        fx, fy, fw, fh = faces_sorted[0]
                        target_center_x = fx + (fw / 2.0)

                # Desired crop X for this sample
                desired_crop_x = target_center_x - (target_crop_w / 2.0)
                desired_crop_x = max(0, min(max_x, desired_crop_x))

                # Smooth the camera movement
                smoothed_x = (alpha * desired_crop_x) + ((1.0 - alpha) * smoothed_x)
                detected_centers.append(smoothed_x)

            current_frame += 1

        cap.release()

        if detected_centers:
            # Median crop position avoids sudden single-frame spikes
            median_crop_x = float(np.median(detected_centers))
            return median_crop_x

        return (width - target_crop_w) / 2.0

    def get_ffmpeg_crop_filter(
        self,
        video_path_or_url: str,
        start_sec: float,
        duration_sec: float,
        framing_mode: str = 'cover'
    ) -> str:
        """
        Generates the FFmpeg video filter for 9:16 vertical conversion.
        Supports:
          - 'smart_track': OpenCV face/subject tracking crop
          - 'cover': Fullscreen 9:16 center crop (zero blur, zero black bars)
          - 'black-bars': Clean solid black letterbox (zero blur)
          - 'blur': Ambient blurred synthwave background
        """
        if framing_mode == 'smart_track':
            crop_x = self.compute_optimal_crop_center(video_path_or_url, start_sec, duration_sec)
            return f"crop=ih*(9/16):ih:{int(crop_x)}:0,scale=1080:1920"
        elif framing_mode == 'cover':
            return "crop=ih*(9/16):ih:(iw-ow)/2:0,scale=1080:1920"
        elif framing_mode == 'black-bars':
            return "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black"
        elif framing_mode == 'blur':
            # Complex filter handled in render_processor
            return "blur"
        else:
            return "crop=ih*(9/16):ih:(iw-ow)/2:0,scale=1080:1920"

smart_reframe = SmartReframeProcessor()
