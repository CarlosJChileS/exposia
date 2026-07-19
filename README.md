# ExposIA

![AI](https://img.shields.io/badge/AI-Speech_Analysis-8E44AD)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

**AI-powered presentation-skills coach.** Upload your slides, record yourself presenting, and get detailed AI feedback on voice clarity, pronunciation and delivery — like having a public-speaking trainer on demand.

## How it works

1. 📎 **Upload a PDF presentation** — automatically converted into navigable slides
2. 🎤 **Record your talk** while stepping through the slides
3. 🤖 **Get AI analysis** of your delivery:
   - Voice clarity and pronunciation
   - Pacing and delivery patterns
   - Actionable feedback per practice session

## Why it matters

Presentation skills improve with feedback, but human coaching is expensive and infrequent. ExposIA gives students unlimited practice reps with objective, repeatable AI evaluation — built as a university outreach (vinculación) project.

## Features

- PDF → slide deck conversion
- In-browser audio recording synced to slide navigation
- AI audio analysis pipeline
- Practice history per user
- Dockerized backend for easy deployment

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python (FastAPI), AI audio analysis |
| Frontend | React |
| Infra | Docker (`Dockerfile.backend`) |

## Getting Started

```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm start
```

---

## 🇪🇸 Español

**Entrenador de presentaciones orales con IA.** Sube tus diapositivas en PDF, graba tu exposición mientras las navegas, y recibe análisis detallado de claridad de voz, pronunciación y ritmo — práctica ilimitada con evaluación objetiva y repetible.

Proyecto de vinculación universitaria: acerca el entrenamiento de oratoria a estudiantes sin costo de coaching humano.

**Stack:** FastAPI + análisis de audio con IA en el backend, React en el frontend, Docker para despliegue.
