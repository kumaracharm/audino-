@echo off
title HealthGuard PS-03: 3 Isolated Local Portals
cls
echo ======================================================================
echo   HEALTHGUARD PS-03: 3 ISOLATED ZERO-COLLISION LOCAL PORTALS
echo ======================================================================
echo.
echo   Port 3000: Clinical Command Hub      (http://localhost:3000)
echo   Port 3001: Patient Check-in Spatial   (http://localhost:3001)
echo   Port 3002: Chaos Monkey Hacker GUI   (http://localhost:3002)
echo.
echo   Each portal is strictly isolated on its own port so heavy loads,
echo   speech recognition, or chaos packet attacks NEVER crash other portals.
echo.
echo   Starting multi-threaded portal server...
python serve_portals.py
pause

