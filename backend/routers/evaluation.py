from fastapi import APIRouter, UploadFile, File
import aiofiles
import os
from pathlib import Path

try:  # try package imports
    from ..ia_analysis.audio_analysis import analyze_audio
    from ..ia_analysis.ai_feedback import get_ai_feedback
    from ..audio_utils import convert_to_flac
    from .. import database
except ImportError:  # allow running from the backend folder
    import sys
    from pathlib import Path
    base = Path(__file__).resolve().parent.parent
    sys.path.append(str(base))
    from ia_analysis.audio_analysis import analyze_audio
    from ia_analysis.ai_feedback import get_ai_feedback
    from audio_utils import convert_to_flac
    import database

router = APIRouter(prefix="/evaluation", tags=["evaluation"])

@router.post("/analyze")
async def analyze(audio: UploadFile = File(...)):
    """Analiza el audio y almacena tanto el archivo como el resultado."""
    path = f"temp_{audio.filename}"
    async with aiofiles.open(path, "wb") as f:
        while chunk := await audio.read(1024 * 1024):
            await f.write(chunk)

    flac_path = convert_to_flac(Path(path))
    with open(flac_path, "rb") as flac_file:
        compressed_bytes = flac_file.read()

    user_id = 1  # TODO: autenticación real
    session_id = database.create_session(user_id, None)
    compressed_name = Path(audio.filename).stem + ".flac"
    database.add_audio_record(session_id, compressed_name, compressed_bytes)

    results = analyze_audio(str(flac_path))
    feedback_ia = get_ai_feedback(results)
    results["feedback_ia"] = feedback_ia

    database.add_analysis_result(session_id, results)
    os.unlink(path)
    os.unlink(flac_path)

    return {"session_id": session_id, **results}
