@echo off
title WillyFastSolutions - Local Dev Launcher
color 0A

echo =================================================================
echo        WILLYFASTSOLUTIONS - LOCAL DEVELOPMENT LAUNCHER
echo =================================================================
echo.

set BASE_DIR=%~dp0
cd /d "%BASE_DIR%"

echo [1/3] Starting FastAPI Backend (Port 8000)...
start "WFS Backend - FastAPI (Port 8000)" cmd /k "cd /d "%BASE_DIR%backend" && "%BASE_DIR%backend\venv\Scripts\python.exe" run.py"

echo [2/3] Starting Next.js Frontend (Port 3000)...
start "WFS Frontend - Next.js (Port 3000)" cmd /k "cd /d "%BASE_DIR%frontend" && npm run dev"

echo [3/3] Opening browser at http://localhost:3000...
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo.
echo =================================================================
echo Services launched successfully!
echo.
echo - Frontend:  http://localhost:3000
echo - Backend:   http://localhost:8000
echo - API Docs:  http://localhost:8000/docs
echo.
echo Superadmin Credentials:
echo   Email:    admin@willyfastsolutions.com
echo   Password: admin1234
echo =================================================================
echo Keep the two opened terminal windows running while working locally.
pause
