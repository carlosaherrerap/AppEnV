# EnLearn Backend

API de reconocimiento de voz para práctica de pronunciación en inglés.

## Requisitos

- Python 3.9+
- CUDA (opcional, para GPU acceleration)

## Instalación

```bash
cd backend
pip install -r requirements.txt
```

## Ejecución

```bash
# Desarrollo
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Producción
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Endpoints

- `GET /` - Health check
- `GET /phrases` - Obtener todas las frases de práctica
- `POST /transcribe` - Transcribir audio y comparar con texto original

## Ejemplo de uso

```bash
curl -X POST "http://localhost:8000/transcribe" \
  -F "audio=@recording.wav" \
  -F "original_text=Hello, how are you?"
```

## Respuesta

```json
{
  "original_text": "Hello, how are you?",
  "transcribed_text": "hello how are you",
  "word_scores": [
    {"word": "Hello,", "score": 100.0, "color": "green"},
    {"word": "how", "score": 100.0, "color": "green"},
    {"word": "are", "score": 85.0, "color": "yellow"},
    {"word": "you?", "score": 100.0, "color": "green"}
  ],
  "overall_score": 96.25
}
```
