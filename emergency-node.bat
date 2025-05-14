@echo off
echo ===================================================
echo LEGACYCORE PURE NODE EMERGENCY MODE
echo ===================================================
echo.

REM Kill any running processes on port 3000
echo Killing any processes on port 3000...
npx kill-port 3000

REM Run the emergency server
echo.
echo Starting pure Node.js emergency server...
node emergency-node.js

pause 