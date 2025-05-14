@echo off
echo ===================================================
echo LEGACYCORE EMERGENCY RECOVERY MODE
echo ===================================================
echo.

REM Kill any running processes on port 3000
echo Killing any processes on port 3000...
npx kill-port 3000

REM Run the emergency server
echo.
echo Starting emergency recovery mode...
node emergency-serve.js

pause 