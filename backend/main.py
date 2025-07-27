from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

try:  # try relative imports when running as a package
    from .routers import users, presentations, practice, evaluation, health
    from . import database
except ImportError:  # fallback to absolute imports when executed from "backend" folder
    import sys
    sys.path.append(str(Path(__file__).resolve().parent))
    from routers import users, presentations, practice, evaluation, health
    import database

app = FastAPI(title="ExposIA")


@app.on_event("startup")
def startup_event():
    database.init_db()

# --- Habilita CORS para permitir requests desde tu frontend (React) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia a ["http://localhost:3000"] si prefieres solo tu frontend local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------------------------------------

# Incluye todos los routers de la app
app.include_router(users.router)
app.include_router(presentations.router)
app.include_router(practice.router)
app.include_router(evaluation.router)
app.include_router(health.router)

# Serve React static files if present (expects the compiled app under frontend/build)
static_dir = Path(__file__).resolve().parent.parent / "frontend" / "build"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
