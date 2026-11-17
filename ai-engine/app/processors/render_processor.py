import os
import subprocess
import logging
import uuid
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.processors.reframe_processor import smart_reframe

logger = logging.getLogger("ai_engine.render")

def format_ass_time(seconds: float) -> str:
    s = max(0.0, float(seconds))
    hrs = int(s // 3600)
    mins = int((s % 3600) // 60)
    secs = int(s % 60)
    cs = int(round((s - int(s)) * 100))
    if cs >= 100:
        secs += 1
        cs = 0
    return f"{hrs}:{mins:02d}:{secs:02d}.{cs:02d}"

def generate_ass_subtitles(
    cues: List[Dict[str, Any]],
    output_ass_path: str,
    clip_start_sec: float,
    clip_duration_sec: float,
    subtitle_style: str = "neon_pink",
    subtitle_position: str = "bottom",
    subtitle_size: str = "medium",
    aspect_ratio: str = "9:16"
) -> bool:
    """
    Generates an Advanced SubStation Alpha (.ass) file with pixel-perfect
    resolution scaling and positioning.
    """
    if not cues:
        return False

    play_res_x = 1080 if aspect_ratio == "9:16" else 1920
    play_res_y = 1920 if aspect_ratio == "9:16" else 1080

    # Font sizes proportional to canvas
    size_map = {
        "small": 36 if aspect_ratio == "9:16" else 26,
        "medium": 46 if aspect_ratio == "9:16" else 34,
        "large": 56 if aspect_ratio == "9:16" else 42
    }
    font_size = size_map.get(subtitle_size, 46)

    # Style colors in ASS format (&HAABBGGRR)
    # Styles: viral_classic, podcast_premium, neon_pink, minimalist, dynamic
    if subtitle_style == "neon_pink":
        primary_color = "&H009314FF" # Hot Neon Pink
        outline_color = "&H00000000" # Black outline
        back_color = "&H90000000"
        border_style = 1
        outline_w = 3.5
        shadow_w = 1.5
    elif subtitle_style == "podcast_premium":
        primary_color = "&H00FFFF00" # Cyan Blue
        outline_color = "&H00000000"
        back_color = "&HB0100B1D"
        border_style = 1
        outline_w = 3.0
        shadow_w = 2.0
    elif subtitle_style == "dynamic":
        primary_color = "&H0000D7FF" # Gold VIP
        outline_color = "&H00000000"
        back_color = "&H90000000"
        border_style = 1
        outline_w = 4.0
        shadow_w = 2.0
    elif subtitle_style == "viral_classic":
        primary_color = "&H0000FFFF" # High-retention Yellow
        outline_color = "&H00000000"
        back_color = "&HA0000000"
        border_style = 1
        outline_w = 4.5
        shadow_w = 2.0
    else: # minimalist
        primary_color = "&H00FFFFFF" # Crisp White
        outline_color = "&H00101010"
        back_color = "&H80000000"
        border_style = 1
        outline_w = 2.5
        shadow_w = 1.0

    # Subtitle Alignment: 2 = Bottom center, 5 = Center middle, 8 = Top center
    alignment = 2
    margin_v = 240 if aspect_ratio == "9:16" else 80
    if subtitle_position == "top":
        alignment = 8
        margin_v = 160 if aspect_ratio == "9:16" else 70
    elif subtitle_position == "middle":
        alignment = 5
        margin_v = 0

    events = []
    for c in cues:
        c_start = float(c.get("start", 0.0))
        c_end = float(c.get("end", 0.0))
        text = str(c.get("text", "")).strip().replace("\n", " ")

        if c_end <= clip_start_sec or c_start >= (clip_start_sec + clip_duration_sec) or not text:
            continue

        rel_start = max(0.0, c_start - clip_start_sec)
        rel_end = min(clip_duration_sec, c_end - clip_start_sec)
        if rel_end > rel_start:
            events.append(
                f"Dialogue: 0,{format_ass_time(rel_start)},{format_ass_time(rel_end)},Style1,,0,0,0,,{text}"
            )

    if not events:
        return False

    ass_content = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {play_res_x}
PlayResY: {play_res_y}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Style1,Arial,{font_size},{primary_color},&H000000FF,{outline_color},{back_color},1,0,0,0,100,100,0,0,{border_style},{outline_w},{shadow_w},{alignment},40,40,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(events) + "\n"

    os.makedirs(os.path.dirname(output_ass_path), exist_ok=True)
    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(ass_content)

    return True

def render_clip(
    video_source: str,
    start_time: float,
    end_time: float,
    aspect_ratio: str = "9:16",
    framing_mode: str = "cover",
    subtitle_style: str = "neon_pink",
    subtitle_position: str = "bottom",
    subtitle_size: str = "medium",
    cues: List[Dict[str, Any]] = None,
    caption_text: Optional[str] = None
) -> Dict[str, Any]:
    """
    Renders professional Full HD 1080p MP4 clip with AAC audio,
    smart 9:16 framing and synchronized styled subtitles.
    """
    duration = max(1.0, round(end_time - start_time, 2))
    clip_uid = f"vice_clip_{int(uuid.uuid4().hex[:8], 16)}"
    out_filename = f"{clip_uid}.mp4"
    output_path = str(settings.PUBLIC_RENDERS_DIR / out_filename)

    temp_ass_path = str(settings.RENDERS_DIR / f"{clip_uid}.ass")
    has_ass = False

    if cues and len(cues) > 0:
        has_ass = generate_ass_subtitles(
            cues=cues,
            output_ass_path=temp_ass_path,
            clip_start_sec=start_time,
            clip_duration_sec=duration,
            subtitle_style=subtitle_style,
            subtitle_position=subtitle_position,
            subtitle_size=subtitle_size,
            aspect_ratio=aspect_ratio
        )

    # Subtitle Filter arg
    sub_filter = ""
    if has_ass and os.path.exists(temp_ass_path):
        clean_ass = temp_ass_path.replace("\\", "/").replace(":", "\\:")
        sub_filter = f"subtitles={clean_ass}"
    elif caption_text and caption_text.strip():
        esc = caption_text.strip().replace(":", "\\:").replace("'", "\\'")
        y = "h-text_h-240" if subtitle_position == "bottom" else "160" if subtitle_position == "top" else "(h-text_h)/2"
        sub_filter = f"drawtext=text='{esc}':fontcolor=white:fontsize=46:box=1:boxcolor=black@0.8:boxborderw=14:x=(w-text_w)/2:y={y}"

    cmd = [
        settings.FFMPEG_PATH,
        "-y",
        "-ss", str(max(0.0, start_time)),
        "-t", str(duration),
        "-i", video_source,
    ]

    # Video Framing & Scale Filters
    if aspect_ratio == "9:16":
        if framing_mode == "blur":
            # Ambient Synthwave blurred background + crisp foreground
            fc = "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"
            if sub_filter:
                fc += f"[merged];[merged]{sub_filter}[outv]"
            else:
                fc += "[outv]"
            cmd.extend(["-filter_complex", fc, "-map", "[outv]", "-map", "0:a?"])
        elif framing_mode == "smart_track":
            reframe_vf = smart_reframe.get_ffmpeg_crop_filter(video_source, start_time, duration, "smart_track")
            filters = [reframe_vf, sub_filter]
            vf = ",".join([f for f in filters if f])
            cmd.extend(["-vf", vf, "-map", "0:v", "-map", "0:a?"])
        elif framing_mode == "black-bars":
            filters = [
                "scale=1080:1920:force_original_aspect_ratio=decrease",
                "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
                sub_filter
            ]
            vf = ",".join([f for f in filters if f])
            cmd.extend(["-vf", vf, "-map", "0:v", "-map", "0:a?"])
        else: # 'cover' (default)
            filters = ["crop=ih*(9/16):ih:(iw-ow)/2:0", "scale=1080:1920", sub_filter]
            vf = ",".join([f for f in filters if f])
            cmd.extend(["-vf", vf, "-map", "0:v", "-map", "0:a?"])
    else: # 16:9
        filters = ["scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black", sub_filter]
        vf = ",".join([f for f in filters if f])
        cmd.extend(["-vf", vf, "-map", "0:v", "-map", "0:a?"])

    # Encoding Parameters: H.264 High Profile, AAC Stereo 192k, faststart for instant streaming
    cmd.extend([
        "-c:v", "libx264",
        "-preset", "faster",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ac", "2",
        "-ar", "44100",
        "-movflags", "+faststart",
        output_path
    ])

    logger.info(f"Rendering clip to {output_path}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    # Cleanup temp ASS
    if os.path.exists(temp_ass_path):
        try:
            os.remove(temp_ass_path)
        except:
            pass

    if res.returncode != 0:
        logger.error(f"FFmpeg render error: {res.stderr}")
        raise RuntimeError(f"Erro na renderização FFmpeg: {res.stderr[:200]}")

    file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0

    return {
        "success": True,
        "output_url": f"/renders/{out_filename}",
        "file_path": output_path,
        "file_size_bytes": file_size,
        "duration": duration,
        "resolution": "1080x1920" if aspect_ratio == "9:16" else "1920x1080",
        "framing_mode": framing_mode
    }
