import openai
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

client = openai.OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url=os.getenv("GROQ_BASE_URL")
)

def get_ai_feedback(result):
    # Procesa muletillas (errores orales)
    muletillas = result.get("muletillas", {})
    muletillas_uso = ", ".join(
        f'"{k}": {v} veces' for k, v in muletillas.items() if v > 0
    ) or "ninguna"

    prompt = f"""
Eres un coach de oratoria. Un usuario obtuvo estos resultados en su análisis de exposición:

- Claridad de voz: {result['clarity']}
- Velocidad: {result['speed_wpm']} palabras/minuto
- Pausas: {result['pauses']}
- Sentimiento: {result['sentiment']}
- Muletillas detectadas: {muletillas_uso}
- Transcripción: {result['transcript']}

Genera una retroalimentación personalizada, clara y motivadora para mejorar su exposición oral. 
Incluye consejos prácticos, señala las fortalezas y debilidades encontradas, y sugiere cómo corregir el uso de muletillas o errores de oratoria presentes.
"""

    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "Eres un experto en comunicación oral y oratoria."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
    )
    return completion.choices[0].message.content.strip()
