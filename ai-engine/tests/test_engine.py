import sys
import os
from pathlib import Path

# Add app to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings
from app.services.video_metadata import get_video_technical_info
from app.analyzers.semantic_analyzer import analyze_and_rank_moments
from app.processors.reframe_processor import smart_reframe
from app.processors.render_processor import format_ass_time, generate_ass_subtitles

def test_config_paths():
    assert settings.STORAGE_DIR.exists()
    assert settings.RENDERS_DIR.exists()
    print(" [OK] Config and storage directories exist")

def test_ass_time_format():
    assert format_ass_time(0.0) == "0:00:00.00"
    assert format_ass_time(65.5) == "0:01:05.50"
    assert format_ass_time(3605.12) == "1:00:05.12"
    print(" [OK] format_ass_time formats correctly")

def test_viral_score_calculation():
    mock_transcription = {
        "duration": 60.0,
        "full_text": "Olha isso cara! O segredo que ninguém imaginava foi revelado agora no jogo. Surreal demais!",
        "segments": [
            {
                "start": 0.0,
                "end": 4.5,
                "text": "Olha isso cara! O segredo que ninguém imaginava!",
                "intensity": 85,
                "pause_before": 0.0
            },
            {
                "start": 4.6,
                "end": 28.0,
                "text": "Foi revelado agora no jogo com detalhes que mudam tudo. Surreal demais!",
                "intensity": 75,
                "pause_before": 0.1
            }
        ]
    }
    moments = analyze_and_rank_moments(mock_transcription, {"title": "Segredo Revelado", "duration": 60.0})
    assert len(moments) > 0
    m1 = moments[0]
    score = m1["viral_score"]
    assert 0 <= score <= 100
    bd = m1["score_breakdown"]
    assert "hook" in bd and bd["hook"] <= 25
    assert "retention" in bd and bd["retention"] <= 20
    assert "emotion" in bd and bd["emotion"] <= 20
    assert "clarity" in bd and bd["clarity"] <= 20
    assert "shareability" in bd and bd["shareability"] <= 15
    print(f" [OK] Vice Viral Score calculated: {score}/100 with documented criteria: {bd}")

def test_smart_reframe_filter():
    vf_cover = smart_reframe.get_ffmpeg_crop_filter("dummy.mp4", 0.0, 10.0, "cover")
    assert "crop=ih*(9/16):ih" in vf_cover
    vf_black = smart_reframe.get_ffmpeg_crop_filter("dummy.mp4", 0.0, 10.0, "black-bars")
    assert "pad=1080:1920" in vf_black
    print(" [OK] Smart Reframe generated valid FFmpeg filters")

def test_ass_subtitles_generation():
    cues = [
        {"start": 0.5, "end": 2.5, "text": "Bem-vindo ao Vice City!"},
        {"start": 3.0, "end": 5.0, "text": "O gráfico mais realista de todos."}
    ]
    test_ass = str(settings.RENDERS_DIR / "test_out.ass")
    ok = generate_ass_subtitles(
        cues=cues,
        output_ass_path=test_ass,
        clip_start_sec=0.0,
        clip_duration_sec=10.0,
        subtitle_style="neon_pink",
        subtitle_position="bottom"
    )
    assert ok is True
    assert os.path.exists(test_ass)
    with open(test_ass, "r", encoding="utf-8") as f:
        content = f.read()
    assert "PlayResX: 1080" in content
    assert "PlayResY: 1920" in content
    assert "Bem-vindo ao Vice City!" in content
    os.remove(test_ass)
    print(" [OK] ASS Subtitle generation with PlayRes coordinates validated")

if __name__ == "__main__":
    print("Running AI Engine Unit Tests...")
    test_config_paths()
    test_ass_time_format()
    test_viral_score_calculation()
    test_smart_reframe_filter()
    test_ass_subtitles_generation()
    print("\nALL 5 AI ENGINE TESTS PASSED WITH 100% SUCCESS!")
