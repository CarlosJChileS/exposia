from fastapi import APIRouter, UploadFile, File

try:
    from .. import database
except ImportError:  # allow running from backend folder
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).resolve().parent.parent))
    import database
import base64
import fitz  # PyMuPDF

router = APIRouter(prefix="/presentations", tags=["presentations"])


@router.post("/upload")
async def upload_presentation(file: UploadFile = File(...)):
    """Recibe un PDF, lo almacena y devuelve las páginas como imágenes base64."""
    pdf_bytes = await file.read()

    user_id = 1  # TODO: reemplazar con autenticación real
    pres_id = database.create_presentation(user_id, file.filename, pdf_bytes)

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    slides = []
    for page in doc:
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        b64 = base64.b64encode(img_bytes).decode()
        text = page.get_text().strip()
        slides.append(
            {
                "image": f"data:image/png;base64,{b64}",
                "number": page.number + 1,
                "text": text,
            }
        )
        database.add_slide(pres_id, page.number + 1, img_bytes, text)
    doc.close()

    return {"presentation_id": pres_id, "slides": slides}


@router.get("")
def list_presentations():
    """Return presentations for the current user."""
    user_id = 1  # TODO: replace with real auth
    return {"presentations": database.list_presentations(user_id, include_cover=True)}


@router.get("/{presentation_id}/slides")
def get_presentation_slides(presentation_id: int):
    """Return slides for a stored presentation."""
    return {"slides": database.get_slides(presentation_id)}


@router.delete("/{presentation_id}")
def remove_presentation(presentation_id: int):
    """Delete a presentation and its slides."""
    database.delete_presentation(presentation_id)
    return {"status": "ok"}
