@echo off
title Servidor Python Local
setlocal enabledelayedexpansion

:: 1. Intentar obtener la IP local (IPv4)
echo Buscando la direccion IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address" /C:"Dirección IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
)

:: 2. Definir el puerto (puedes cambiarlo si el 8000 esta ocupado)
set PORT=8000

echo.
echo ======================================================
echo   SERVIDOR ACTIVO
echo ======================================================
echo   Acceso local:     http://localhost:%PORT%
echo   Acceso en la red:  http://%IP%:%PORT%
echo ======================================================
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.

:: 3. Ejecutar el servidor de Python
python -m http.server %PORT%

pause