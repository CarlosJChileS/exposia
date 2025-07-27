import os
import tempfile
from pathlib import Path
from subprocess import run, PIPE


def convert_to_flac(input_path: Path) -> Path:
    """Convert audio file to 16 kHz mono FLAC using ffmpeg and return new path."""
    output = tempfile.NamedTemporaryFile(delete=False, suffix=".flac")
    output.close()
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-ac",
        "1",
        "-ar",
        "16000",
        "-sample_fmt",
        "s16",
        output.name,
    ]
    run(cmd, stdout=PIPE, stderr=PIPE, check=True)
    return Path(output.name)
