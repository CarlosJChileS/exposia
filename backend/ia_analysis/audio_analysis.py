import re

# Heavy libraries are imported lazily to speed up startup time
whisper = None
librosa = None
np = None
spacy = None
create_analyzer = None

# --- Configuración de modelos (carga diferida) ---
whisper_model = None
nlp = None
sentiment_analyzer = None


def get_whisper_model():
    """Carga el modelo de Whisper solo la primera vez."""
    global whisper_model
    if whisper_model is None:
        global whisper
        if whisper is None:
            import whisper as _whisper
            whisper = _whisper
        whisper_model = whisper.load_model("large")  # Cambia a "base" o "small" si necesitas menos recursos
    return whisper_model


def get_nlp():
    """Carga el modelo de SpaCy solo cuando se necesite."""
    global nlp
    if nlp is None:
        global spacy
        if spacy is None:
            import spacy as _spacy
            spacy = _spacy
        nlp = spacy.load("es_core_news_md")
    return nlp


def get_sentiment_analyzer():
    """Carga el analizador de sentimiento de forma perezosa."""
    global sentiment_analyzer
    if sentiment_analyzer is None:
        global create_analyzer
        if create_analyzer is None:
            from pysentimiento import create_analyzer as _create_analyzer
            create_analyzer = _create_analyzer
        sentiment_analyzer = create_analyzer(task="sentiment", lang="es")
    return sentiment_analyzer

# --- Lista de muletillas comunes en español ---
MULETILLAS = [
    "eh", "mm", "este", "pues", "o sea", "bueno", "entonces", "a ver", "vale", "ok"
]

def contar_muletillas(transcript):
    transcript = transcript.lower()
    errores = {}
    for palabra in MULETILLAS:
        errores[palabra] = len(re.findall(r"\b" + re.escape(palabra) + r"\b", transcript))
    return errores

def analyze_audio(file_path, slide_segments=None):
    # 1. Transcribe audio
    global librosa, np
    if librosa is None or np is None:
        import librosa as _librosa
        import numpy as _np
        librosa = _librosa
        np = _np
    model = get_whisper_model()
    result = model.transcribe(file_path, language='es')
    transcript = result['text']

    # 1.1 Muletillas (errores de oratoria)
    muletillas = contar_muletillas(transcript)

    # 2. Analiza texto con SpaCy
    doc = get_nlp()(transcript)
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    num_sentences = len(list(doc.sents))

    # 3. Análisis acústico con Librosa
    y, sr = librosa.load(file_path, sr=16000, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    rms = np.mean(librosa.feature.rms(y=y))
    volume = float(round(np.mean(np.abs(y)), 3))
    # Escala el volumen de 0-1 a una puntuación del 1 al 10
    volume_score = int(np.clip(round(volume * 100), 1, 10))

    # Pausas: cuenta frames con energía muy baja
    frames = librosa.util.frame(y, frame_length=2048, hop_length=512)
    silences = np.sum(np.mean(np.abs(frames), axis=0) < 0.01)
    pauses = int(silences * 512 / sr / 1.5)

    # 4. Velocidad: palabras por minuto
    word_count = len(transcript.split())
    wpm = (word_count / duration) * 60 if duration > 0 else 0

    # 5. Pitch/intonación (opcional, básico)
    pitches, _ = librosa.piptrack(y=y, sr=sr)
    mean_pitch = float(np.mean(pitches[pitches > 0])) if np.any(pitches > 0) else None

    # 6. Análisis de sentimiento (pysentimiento)
    sentiment = get_sentiment_analyzer().predict(transcript)
    sentiment_label = sentiment.output  # "POS", "NEU", "NEG"
    sentiment_prob = float(sentiment.probas[sentiment_label])  # Confianza

    # Califica la claridad en una escala del 1 al 10 (entero)
    # El factor 30 resultaba en valores siempre cercanos a 1 para audio real,
    # por lo que se ajusta la escala para reflejar mejor la variabilidad.
    clarity_score = int(np.clip(round(rms * 200), 1, 10))

    results = {
        "transcript": transcript,
        "entities": entities,
        "num_sentences": int(num_sentences),
        "duration_sec": float(round(duration, 2)),
        "clarity": clarity_score,
        "volume": volume_score,
        "pauses": int(pauses),
        "speed_wpm": max(1, int(round(wpm))),
        "mean_pitch": float(round(mean_pitch, 2)) if mean_pitch is not None else None,
        "sentiment": sentiment_label,
        "sentiment_prob": sentiment_prob,
        "muletillas": muletillas
    }

    if slide_segments:
        details = []
        fail_slides = []
        for i, seg in enumerate(slide_segments):
            start = seg[1]
            end = seg[2] if seg[2] is not None else duration
            slide_y = y[int(start * sr): int(end * sr)]
            if len(slide_y) == 0:
                details.append({
                    "slide_number": seg[0],
                    "duration_sec": 0,
                    "clarity": 0,
                    "speed_wpm": 0,
                    "pauses": 0,
                    "fail": True,
                })
                fail_slides.append(seg[0])
                continue

            seg_rms = np.mean(librosa.feature.rms(y=slide_y))
            seg_pauses = int(
                np.sum(
                    np.mean(
                        np.abs(
                            librosa.util.frame(
                                slide_y, frame_length=2048, hop_length=512
                            )
                        ),
                        axis=0,
                    )
                    < 0.01
                )
                * 512
                / sr
                / 1.5
            )
            seg_words = len(transcript.split()) * (len(slide_y) / len(y))
            seg_wpm = (seg_words / (end - start)) * 60 if end > start else 0
            seg_clarity = int(np.clip(round(seg_rms * 30), 1, 10))
            fail = seg_clarity < 5 or seg_wpm < 110 or seg_wpm > 160 or seg_pauses > 10
            if fail:
                fail_slides.append(seg[0])
            details.append(
                {
                    "slide_number": seg[0],
                    "duration_sec": round(end - start, 2),
                    "clarity": seg_clarity,
                    "speed_wpm": max(1, int(round(seg_wpm))),
                    "pauses": int(seg_pauses),
                    "fail": fail,
                }
            )

        results["slide_details"] = details
        results["fail_slides"] = fail_slides

    return results
