@echo off
cd /d "%~dp0"

:: Intentar activar entorno virtual si existe
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

:: Iniciar servidor
:: Si no usas venv, asegúrate que python y uvicorn estén en el PATH
uvicorn main:app --host 0.0.0.0 --port 8000
