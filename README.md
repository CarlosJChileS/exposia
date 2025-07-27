# ExposIA

**ExposIA** es una plataforma inteligente para mejorar habilidades de presentación oral mediante análisis de audio con inteligencia artificial. 

## ¿Qué hace ExposIA?

ExposIA permite a los usuarios:
- 📎 **Subir presentaciones PDF** y convertirlas automáticamente en diapositivas
- 🎤 **Grabar exposiciones orales** mientras navegan por las diapositivas
- 🤖 **Obtener análisis detallado con IA** que evalúa:
  - Claridad de voz y pronunciación
  - Velocidad de habla (palabras por minuto)
  - Uso de muletillas y errores comunes
  - Análisis de sentimientos y tono
  - Pausas y fluidez del discurso
- 📊 **Recibir retroalimentación personalizada** con consejos para mejorar
- 📈 **Seguir el progreso** a través de un historial de prácticas

## Tecnologías utilizadas

- **Backend**: FastAPI (Python) con análisis de audio usando Whisper, spaCy y análisis de sentimientos
- **Frontend**: React.js con interfaz moderna y responsiva
- **IA**: OpenAI Whisper para transcripción y Groq API para retroalimentación inteligente
- **Base de datos**: SQLite local para almacenamiento de sesiones y resultados

## Requisitos
- Python 3.10 o superior
- Node.js 18 y npm
- Una API key de Groq (para el análisis de IA)

## Configuración inicial

### 1. Variables de entorno
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# URL del backend para el frontend
REACT_APP_API_URL=http://localhost:8080

# API Keys (obtén tu clave gratuita en https://console.groq.com/)
GROQ_API_KEY=tu_api_key_de_groq_aqui

# Base URLs
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

**⚠️ Importante**: 
- Nunca subas el archivo `.env` al repositorio (ya está incluido en `.gitignore`)
- Obtén tu API key gratuita en [Groq Console](https://console.groq.com/)
- Reemplaza `tu_api_key_de_groq_aqui` con tu clave real

## Puesta en marcha del backend

### 2. Configuración del backend
1. Entra en la carpeta `backend`:
   ```bash
   cd backend
   ```
2. (Recomendado) crea un entorno virtual y actívalo:
   ```bash
   python -m venv .venv
   
   # En Windows:
   .venv\Scripts\activate
   
   # En macOS/Linux:
   source .venv/bin/activate
   ```
3. Instala las dependencias del backend:
   ```bash
   pip install -r requirements.txt
   ```
   Las dependencias incluyen:
   - `fastapi` y `uvicorn` para el servidor web
   - `openai-whisper` para transcripción de audio
   - `spacy` y `pysentimiento` para análisis de texto
   - `python-dotenv` para cargar variables de entorno
   - `openai` para la integración con Groq API

4. **Base de datos**: Toda la información se almacena en SQLite (`backend/local.db`)
5. Inicializa la base de datos (solo la primera vez):
   ```bash
   python -c "from backend import database; database.init_db()"
   ```
   ℹ️ Este paso es opcional, el servidor creará automáticamente la base de datos si no existe.

6. **Ejecuta el servidor** (desde la carpeta `backend`):
   ```bash
   python -m uvicorn main:app --reload --port 8080
   ```
   ✅ La API estará disponible en `http://localhost:8080`
   
   📋 Puedes ver la documentación automática en `http://localhost:8080/docs`

## Puesta en marcha del frontend

### 3. Configuración del frontend
1. Abre una **nueva terminal** y entra en la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node.js:
   ```bash
   npm install
   ```
3. **Inicia la aplicación React**:
   ```bash
   npm start
   ```
   ✅ La aplicación se abrirá automáticamente en `http://localhost:3000`

4. (Opcional) Para crear una versión optimizada para producción:
   ```bash
   npm run build
   ```
   Los archivos se guardarán en `frontend/build` y el backend puede servirlos automáticamente.

## 🚀 ¡Listo para usar!

Con ambos servicios ejecutándose podrás:
1. Acceder a ExposIA en `http://localhost:3000`
2. Registrarte como usuario
3. Subir tus presentaciones PDF
4. Practicar y recibir retroalimentación inteligente

## 🐳 Docker (Alternativa)

También puedes usar Docker para ejecutar todo el proyecto:

```bash
# Construir la imagen
docker build -f Dockerfile.backend -t exposia .

# Ejecutar el contenedor
docker run -p 8080:8080 exposia
```

Esto levantará el backend en `http://localhost:8080` con el frontend ya compilado incluido.

## 📁 Estructura del proyecto

```
ExposiaVinculacion/
├── .env                    # Variables de entorno (crear según instrucciones)
├── .gitignore             # Archivos excluidos del control de versiones
├── backend/               # API en FastAPI
│   ├── main.py           # Punto de entrada del servidor
│   ├── requirements.txt  # Dependencias de Python
│   ├── local.db          # Base de datos SQLite (se crea automáticamente)
│   ├── routers/          # Endpoints organizados por módulos
│   ├── ia_analysis/      # Módulos de análisis con IA
│   └── local_db/         # Almacenamiento de archivos (audio, PDFs, etc.)
└── frontend/             # Aplicación React
    ├── src/
    ├── public/
    └── package.json
```

## 📡 API Endpoints

La API está organizada en módulos temáticos:

### 👥 Usuarios (`/users`)
- `POST /users/register` - Registro de nuevo usuario
- `POST /users/login` - Inicio de sesión

### 📎 Presentaciones (`/presentations`)
- `POST /presentations/upload` - Subir PDF y convertir a diapositivas

### 🎤 Práctica (`/practice`)
- `POST /practice/upload-audio` - Subir audio de práctica
- `POST /practice/navigation` - Registrar navegación entre diapositivas
- `POST /practice/archive-session` - Archivar sesión completa (PDF + audio + navegación)

### 🤖 Evaluación (`/evaluation`)
- `POST /evaluation/analyze` - Analizar audio y generar retroalimentación con IA

### ❤️ Salud (`/health`)
- `GET /health` - Verificar estado del servidor

📋 **Documentación completa**: Visita `http://localhost:8080/docs` con el servidor ejecutándose

## 🎯 Características principales

### Análisis inteligente de audio
- **Transcripción automática** usando OpenAI Whisper
- **Detección de muletillas** y palabras repetitivas
- **Análisis de velocidad** de habla (palabras por minuto)
- **Evaluación de sentimientos** y tono emocional
- **Medición de pausas** y fluidez del discurso

### Retroalimentación con IA
- **Consejos personalizados** generados por Groq API
- **Identificación de fortalezas** y áreas de mejora
- **Sugerencias prácticas** para mejorar la oratoria

### Gestión de presentaciones
- **Conversión automática** de PDF a diapositivas
- **Navegación sincronizada** entre audio y slides
- **Almacenamiento seguro** de sesiones y resultados

## 💾 Archivado de sesiones

El endpoint `POST /practice/archive-session` permite guardar sesiones completas de práctica:

**Entrada:**
- 📄 PDF con las diapositivas
- 🎵 Audio de la exposición  
- 📊 Archivo opcional con datos de navegación

**Procesamiento:**
- Se almacena toda la información en SQLite
- Los archivos se guardan en `backend/local_db/`
- Se genera análisis automático con IA
- Se crea registro completo de la sesión

**Resultado:**
- Presentación registrada en la base de datos
- Diapositivas extraídas y almacenadas
- Audio procesado y analizado
- Retroalimentación inteligente generada

## 🔧 Resolución de problemas

### Error: "No module named 'dotenv'"
```bash
pip install python-dotenv
```

### Error: "GROQ_API_KEY not found"
1. Verifica que existe el archivo `.env` en la raíz del proyecto
2. Confirma que has agregado tu API key de Groq
3. Reinicia el servidor backend

### El frontend no se conecta al backend
1. Verifica que `REACT_APP_API_URL=http://localhost:8080` esté en `.env`
2. Confirma que el backend está ejecutándose en el puerto 8080
3. Reinicia la aplicación React

### Problemas con el análisis de audio
1. Verifica que tu API key de Groq sea válida
2. Asegúrate de tener conexión a internet
3. Revisa los logs del backend para errores específicos

---

## 🤝 Contribuir

¿Quieres mejorar ExposIA? ¡Contribuciones son bienvenidas!

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ve el archivo `LICENSE` para más detalles.

---

**🎯 ¡Mejora tus habilidades de presentación con ExposIA!**

