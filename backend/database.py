from __future__ import annotations

import sqlite3
import os
import datetime
import json
import base64
from pathlib import Path
from typing import Iterable, Any

DB_PATH = Path(__file__).resolve().parent / "local.db"
LOCAL_DIR = Path(__file__).resolve().parent / "local_db"
LOCAL_DIR.mkdir(exist_ok=True)

_conn: sqlite3.Connection | None = None

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS presentations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    presentation_id INTEGER NOT NULL,
    number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    text TEXT,
    FOREIGN KEY(presentation_id) REFERENCES presentations(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    presentation_id INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(presentation_id) REFERENCES presentations(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS audio_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    clarity REAL,
    speed_wpm INTEGER,
    pauses INTEGER,
    sentiment TEXT,
    transcript TEXT,
    ai_feedback TEXT,
    full_analysis TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS navigation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    slide_number INTEGER NOT NULL,
    time_seconds INTEGER NOT NULL,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
"""


def get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
    return _conn


def init_db() -> None:
    conn = get_conn()
    conn.executescript(SCHEMA_SQL)


def _upload_file(bucket: str, path: str, data: bytes) -> str:
    bucket_dir = LOCAL_DIR / bucket
    file_path = bucket_dir / path
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(data)
    return str(file_path)


# User operations -----------------------------------------------------


def add_user(email: str, password: str) -> None:
    conn = get_conn()
    conn.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, password))
    conn.commit()


def get_user(email: str) -> dict | None:
    conn = get_conn()
    row = conn.execute(
        "SELECT id, email, password FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    return dict(row) if row else None


# Presentations -------------------------------------------------------


def create_presentation(user_id: int, title: str, pdf_data: bytes) -> int:
    pdf_path = _upload_file("presentations", f"{user_id}/{title}", pdf_data)
    uploaded_at = datetime.datetime.utcnow().isoformat()
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO presentations (user_id, title, pdf_url, uploaded_at) VALUES (?, ?, ?, ?)",
        (user_id, title, pdf_path, uploaded_at),
    )
    conn.commit()
    return cur.lastrowid


def list_presentations(
    user_id: int | None = None, include_cover: bool = False
) -> list[dict]:
    conn = get_conn()
    query = "SELECT id, user_id, title, pdf_url, uploaded_at FROM presentations"
    params: list[Any] = []
    if user_id is not None:
        query += " WHERE user_id = ?"
        params.append(user_id)
    rows = conn.execute(query, params).fetchall()
    presentations = [dict(r) for r in rows]
    if include_cover:
        for p in presentations:
            row = conn.execute(
                "SELECT image_url FROM slides WHERE presentation_id = ? AND number = 1",
                (p["id"],),
            ).fetchone()
            if row:
                p["cover_url"] = row["image_url"]
    return presentations


def get_slides(presentation_id: int) -> list[dict]:
    conn = get_conn()
    rows = conn.execute(
        "SELECT number, image_url, text FROM slides WHERE presentation_id = ? ORDER BY number",
        (presentation_id,),
    ).fetchall()
    result = []
    for r in rows:
        with open(r["image_url"], "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        result.append(
            {
                "number": r["number"],
                "image": f"data:image/png;base64,{b64}",
                "text": r["text"] or "",
            }
        )
    return result


def delete_presentation(presentation_id: int) -> None:
    conn = get_conn()
    conn.execute("DELETE FROM presentations WHERE id = ?", (presentation_id,))
    conn.commit()


def add_slide(presentation_id: int, number: int, image: bytes, text: str) -> None:
    path = f"{presentation_id}/slide_{number}.png"
    url = _upload_file("slides", path, image)
    conn = get_conn()
    conn.execute(
        "INSERT INTO slides (presentation_id, number, image_url, text) VALUES (?, ?, ?, ?)",
        (presentation_id, number, url, text),
    )
    conn.commit()


# Sessions ------------------------------------------------------------


def create_session(user_id: int, presentation_id: int | None) -> int:
    created_at = datetime.datetime.utcnow().isoformat()
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO sessions (user_id, presentation_id, created_at) VALUES (?, ?, ?)",
        (user_id, presentation_id, created_at),
    )
    conn.commit()
    return cur.lastrowid


def add_audio_record(session_id: int, filename: str, data: bytes) -> str:
    path = f"{session_id}/{filename}"
    url = _upload_file("audio", path, data)
    conn = get_conn()
    conn.execute(
        "INSERT INTO audio_records (session_id, file_url) VALUES (?, ?)",
        (session_id, url),
    )
    conn.commit()
    return url


def add_analysis_result(session_id: int, analysis: dict) -> None:
    conn = get_conn()
    data = {
        "session_id": session_id,
        "clarity": analysis.get("clarity"),
        "speed_wpm": analysis.get("speed_wpm"),
        "pauses": analysis.get("pauses"),
        "sentiment": analysis.get("sentiment"),
        "transcript": analysis.get("transcript"),
        "ai_feedback": analysis.get("ai_feedback"),
        "full_analysis": json.dumps(analysis),
    }
    conn.execute(
        """
        INSERT INTO analysis_results
            (session_id, clarity, speed_wpm, pauses, sentiment, transcript, ai_feedback, full_analysis)
        VALUES (:session_id, :clarity, :speed_wpm, :pauses, :sentiment, :transcript, :ai_feedback, :full_analysis)
        """,
        data,
    )
    conn.commit()


def add_navigation_events(session_id: int, events: Iterable[dict]) -> None:
    rows = [
        (
            session_id,
            e.get("slide") or e.get("slide_number"),
            e.get("second") or e.get("time_seconds"),
        )
        for e in events
    ]
    if not rows:
        return
    conn = get_conn()
    conn.executemany(
        "INSERT INTO navigation (session_id, slide_number, time_seconds) VALUES (?, ?, ?)",
        rows,
    )
    conn.commit()


def list_sessions(user_id: int, limit: int | None = None) -> list[dict]:
    conn = get_conn()
    query = (
        "SELECT s.id, s.created_at, ar.clarity, ar.speed_wpm, ar.pauses, ar.created_at AS analysis_created_at "
        "FROM sessions s LEFT JOIN analysis_results ar ON ar.session_id = s.id WHERE s.user_id = ? "
        "ORDER BY s.created_at DESC"
    )
    params: list[Any] = [user_id]
    if limit:
        query += " LIMIT ?"
        params.append(limit)
    rows = conn.execute(query, params).fetchall()
    result = []
    for r in rows:
        entry = {"id": r["id"], "created_at": r["created_at"]}
        if r["clarity"] is not None:
            entry["analysis"] = {
                "clarity": r["clarity"],
                "speed_wpm": r["speed_wpm"],
                "pauses": r["pauses"],
                "created_at": r["analysis_created_at"],
            }
        result.append(entry)
    return result


def get_session(user_id: int, session_id: int) -> dict | None:
    conn = get_conn()
    session_row = conn.execute(
        "SELECT id, user_id, created_at, presentation_id FROM sessions WHERE id = ? AND user_id = ?",
        (session_id, user_id),
    ).fetchone()
    if not session_row:
        return None
    analysis_row = conn.execute(
        "SELECT full_analysis, clarity, speed_wpm, pauses, transcript FROM analysis_results WHERE session_id = ? ORDER BY id DESC LIMIT 1",
        (session_id,),
    ).fetchone()
    analysis: dict | None = None
    if analysis_row:
        analysis = dict(analysis_row)
        if analysis.get("full_analysis"):
            try:
                analysis["full_analysis"] = json.loads(analysis["full_analysis"])
            except Exception:
                pass
    return {**dict(session_row), "analysis": analysis}
