@echo off
title HealthGuard PS-03 Launcher
cls
echo ======================================================================
echo   HEALTHGUARD PS-03: CONTINUOUS REAL-TIME 10-PATIENT PORTAL
echo ======================================================================
echo.

cd /d "D:\gg\ppt"

echo [1/3] Clearing any existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
  taskkill /f /pid %%a >nul 2>&1
)

echo [2/3] Starting continuous 10-patient PhysioNet streaming feeder...
start /b python stream_service.py

echo [3/3] Launching HealthGuard Web Application on http://localhost:3000...
echo.
echo   Portals Ready:
echo   - Clinical Command Hub: http://localhost:3000
echo   - Patient Check-in:     http://localhost:3000/patient
echo   - Chaos Monkey Console: http://localhost:3000/chaos
echo.
pnpm start
pause

