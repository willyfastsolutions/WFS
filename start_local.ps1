# WillyFastSolutions - Local Dev Launcher (PowerShell)
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "       WILLYFASTSOLUTIONS - LOCAL DEVELOPMENT LAUNCHER           " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in new process
Write-Host "[1/3] Starting FastAPI Backend on Port 8000..." -ForegroundColor Yellow
$backendPython = Join-Path $baseDir "backend\venv\Scripts\python.exe"
$backendDir = Join-Path $baseDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; & '$backendPython' run.py"

# 2. Start Frontend in new process
Write-Host "[2/3] Starting Next.js Frontend on Port 3000..." -ForegroundColor Yellow
$frontendDir = Join-Path $baseDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev"

# 3. Open Browser
Write-Host "[3/3] Opening browser at http://localhost:3000..." -ForegroundColor Green
Start-Sleep -Seconds 4
Start-Process "http://localhost:3000"

Write-Host "`nLocal development environment is running!" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:3000"
Write-Host "Backend:   http://localhost:8000"
Write-Host "Swagger:   http://localhost:8000/docs"
Write-Host "`nLogin Credentials:"
Write-Host "  Email:    admin@willyfastsolutions.com"
Write-Host "  Password: admin1234"
