# EnLearn 🎤

App de práctica de pronunciación en inglés con feedback visual.

---

## 🚀 Setup Rápido

### Requisitos
- **Backend**: Python 3.11 o 3.12 (no 3.14)
- **Frontend**: Node.js 18+
- **Opcional**: ngrok (para exponer el backend)

---

## 1️⃣ Backend (Servidor)

```bash
# Navegar al backend
cd backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Exponer con ngrok (opcional)
```bash
ngrok http 8000
# Copia la URL (ej: https://abc123.ngrok.io)
```

---

## 2️⃣ Frontend (Local)

```bash
# Navegar al frontend
cd frontend

# Instalar dependencias
npm install

# Configurar URL del backend (si usas ngrok)
# Edita: frontend/api/config.js
# Cambia: const NGROK_URL = 'https://TU-URL.ngrok.io';

# Iniciar app
npm run web      # Navegador
npm run android  # Android (necesita Expo Go)
```

---

## 📱 Probar en Android

1. Instala **Expo Go** desde Play Store
2. Ejecuta `npm run android` en el frontend
3. Escanea el QR con Expo Go

---

## 🎨 Colores de Feedback

| Color | Score | Significado |
|-------|-------|-------------|
| 🟢 Verde | 90-100% | Excelente |
| 🟡 Amarillo | 70-89% | Bien |
| 🟠 Naranja | 50-69% | Mejorar |
| 🔴 Rojo | <50% | Revisar |

---

## 📁 Estructura

```
EnLearn/
├── backend/           # Python + FastAPI + Whisper
│   ├── main.py
│   └── requirements.txt
└── frontend/          # Expo React Native
    ├── App.js
    ├── components/
    ├── api/
    └── data/
```
