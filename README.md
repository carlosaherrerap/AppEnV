# EnLearn 🎤

App de práctica de pronunciación en inglés con feedback visual.

## 🚀 Setup Rápido

### Requisitos Previos
- **Servidor**: Python 3.11/3.12 y **FFmpeg instalado**.
- **Desarrollo**: Node.js 18+ y Git.

---

## 1️⃣ Backend (Servidor)

```bash
# 1. Clonar repo y entrar al backend
cd backend

# 2. Crear entorno virtual
python -m venv venv
# Windows: venv\Scripts\activate
# Linux: source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Iniciar servidor
uvicorn main:app --host 0.0.0.0 --port 8000
```

> ⚠️ **Importante**: Asegúrate de tener `ffmpeg` instalado en el servidor o el audio no procesará error 500.

### Exponer a Internet (ngrok)
Si no tienes IP pública, usa ngrok en el servidor:
```bash
ngrok http 8000
# Copia la URL (ej: https://abc.ngrok-free.app)
```

---

## 2️⃣ Frontend (Cliente)

El frontend corre en tu PC (web) o Celular (Android), **no en el servidor**.

```bash
# 1. Entrar al frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar conexión al servidor
# Abre: frontend/api/config.js
# Busca: const NGROK_URL = ...
# Pon la URL de tu servidor/ngrok:
# const NGROK_URL = 'https://abc.ngrok-free.app';

# 4. Ejecutar
npm run web       # Para probar en navegador
npm run android   # Para probar en celular (Expo Go)
```

---

## 📱 Cómo probar en Android

1. Descarga **Expo Go** desde Google Play en tu celular.
2. PC y Celular deben estar preferiblemente en la misma WiFi (o usar `--tunnel`).
3. En la terminal del frontend ejecuta:
   ```bash
   npx expo start --clear --tunnel
   ```
4. Escanea el código QR con la app Expo Go.

---

## 📦 Generar APK (Ejecutable)

Para crear un archivo `.apk` instalable:

1. **Instalar EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Iniciar sesión en Expo**:
   ```bash
   eas login
   ```

3. **Configurar proyecto** (solo la primera vez):
   ```bash
   cd frontend
   eas build:configure
   ```

4. **Generar el APK**:
   ```bash
   eas build -p android --profile preview
   ```
   *Esto subirá tu código a los servidores de Expo, compilará la app y te dará un link de descarga.*

---

## 🎨 Feedback Visual

| Color | Precisión | Significado |
|-------|-----------|-------------|
| 🟢 Verde | 90-100% | Excelente |
| 🟡 Amarillo | 70-89% | Bien |
| 🟠 Naranja | 50-69% | Mejorar |
| 🔴 Rojo | <50% | Revisar |
