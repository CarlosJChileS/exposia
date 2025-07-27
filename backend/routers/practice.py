from fastapi import APIRouter, UploadFile, File, HTTPException
import aiofiles
from pydantic import BaseModel

import json
import time
from pathlib import Path
import tempfile
import os

import fitz

try:  # try package imports
    from ..ia_analysis.audio_analysis import analyze_audio
    from ..ia_analysis.ai_feedback import get_ai_feedback
    from ..audio_utils import convert_to_flac
    from .. import database
except ImportError:  # allow running from the backend folder
    import sys
    from pathlib import Path as _Path
    base = _Path(__file__).resolve().parent.parent
    sys.path.append(str(base))
    from ia_analysis.audio_analysis import analyze_audio
    from ia_analysis.ai_feedback import get_ai_feedback
    from audio_utils import convert_to_flac
    import database

router = APIRouter(prefix="/practice", tags=["practice"])

class Navigation(BaseModel):
    timestamps: list  # [{"slide": 1, "second": 0}, ...]

@router.post("/upload-audio")
async def upload_audio(audio: UploadFile = File(...)):
    """Save an uploaded audio file asynchronously and compress it."""
    os.makedirs("./audios", exist_ok=True)
    temp_path = Path("./audios") / audio.filename
    async with aiofiles.open(temp_path, "wb") as out_file:
        while chunk := await audio.read(1024 * 1024):
            await out_file.write(chunk)

    flac_path = convert_to_flac(temp_path)
    compressed = temp_path.with_suffix(".flac")
    os.replace(flac_path, compressed)
    os.unlink(temp_path)
    return {"filename": compressed.name}

@router.post("/navigation")
def save_navigation(nav: Navigation):
    # Guardar navegación
    return {"msg": "Navegación registrada", "data": nav}


def extract_slides_bytes(pdf_bytes: bytes) -> list:
    """Return slide images and text from a PDF in memory."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    slides = []
    for page in doc:
        pix = page.get_pixmap(dpi=150)
        slides.append(
            {
                "number": page.number + 1,
                "image": pix.tobytes("png"),
                "text": page.get_text().strip(),
            }
        )
    doc.close()
    return slides


def process_audio(audio_path: Path, navigation: list | None = None) -> dict:
    """Run audio analysis and attach AI feedback."""
    segments = None
    if navigation:
        navigation = sorted(navigation, key=lambda x: x.get("second") or x.get("time_seconds", 0))
        segments = []
        for i, ev in enumerate(navigation):
            start = ev.get("second") or ev.get("time_seconds") or 0
            end = None
            if i + 1 < len(navigation):
                end = navigation[i + 1].get("second") or navigation[i + 1].get("time_seconds")
            segments.append((ev.get("slide") or ev.get("slide_number"), start, end))
    results = analyze_audio(str(audio_path), slide_segments=segments)
    results["feedback_ia"] = get_ai_feedback(results)
    return results


@router.post("/archive-session")
async def archive_session(
    pdf: UploadFile = File(...),
    audio: UploadFile = File(...),
    navigation: UploadFile | None = File(None),
):
    """Process a practice session and store its artifacts in the local database."""

    pdf_bytes = await pdf.read()
    tmp_audio_path = None
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(audio.filename).suffix) as tmp:
        tmp_audio_path = Path(tmp.name)
    async with aiofiles.open(tmp_audio_path, "wb") as tmp_file:
        while chunk := await audio.read(1024 * 1024):
            await tmp_file.write(chunk)
    flac_path = convert_to_flac(tmp_audio_path)
    with open(flac_path, "rb") as f:
        audio_bytes = f.read()
    os.unlink(tmp_audio_path)
    nav_data = None
    if navigation:
        nav_data = json.loads((await navigation.read()).decode())

    # TODO: replace with real user management
    user_id = 1

    pres_id = database.create_presentation(user_id, pdf.filename, pdf_bytes)

    slides = extract_slides_bytes(pdf_bytes)
    for s in slides:
        database.add_slide(pres_id, s["number"], s["image"], s["text"])

    session_id = database.create_session(user_id, pres_id)

    compressed_name = Path(audio.filename).stem + ".flac"
    database.add_audio_record(session_id, compressed_name, audio_bytes)

    analysis = process_audio(flac_path, nav_data.get("timestamps", nav_data) if nav_data else None)
    database.add_analysis_result(session_id, analysis)
    os.unlink(flac_path)

    if nav_data:
        database.add_navigation_events(session_id, nav_data.get("timestamps", nav_data))

    return {"session_id": session_id, "presentation_id": pres_id}


@router.post("/save-session")
async def save_session(
    audio: UploadFile = File(...),
    analysis: UploadFile = File(...),
    navigation: UploadFile | None = File(None),
):
    """Persist a practice session with audio and analysis only."""
    tmp_audio = None
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(audio.filename).suffix) as tmp:
        tmp_audio = Path(tmp.name)
        tmp.write(await audio.read())
    flac_path = convert_to_flac(tmp_audio)
    with open(flac_path, "rb") as f:
        audio_data = f.read()
    os.unlink(tmp_audio)
    analysis_data = json.loads(await analysis.read())

    # TODO: replace with real user management
    user_id = 1

    session_id = database.create_session(user_id, None)
    compressed_name = Path(audio.filename).stem + ".flac"
    database.add_audio_record(session_id, compressed_name, audio_data)
    database.add_analysis_result(session_id, analysis_data)
    os.unlink(flac_path)

    if navigation:
        nav_data = json.loads((await navigation.read()).decode())
        database.add_navigation_events(session_id, nav_data.get("timestamps", nav_data))

    return {"session_id": session_id}


@router.get("/sessions")
def list_sessions(limit: int = 5):
    """Return recent practice sessions for the current user."""
    user_id = 1  # TODO: replace with real auth
    return {"sessions": database.list_sessions(user_id, limit)}

@router.get("/sessions/{session_id}")
def get_session(session_id: int):
    """Return a practice session with full analysis."""
    user_id = 1  # TODO: replace with real auth
    session = database.get_session(user_id, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session": session}
