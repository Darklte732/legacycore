@echo off
echo ===================================================
echo LEGACYCORE SIMPLIFIED RUN
echo ===================================================
echo.

REM Check if Node.js is installed
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    exit /b 1
)

REM Kill any running processes on port 3000
echo Killing any processes on port 3000...
npx kill-port 3000

REM Run the simplified server
echo.
echo Starting simplified production mode...
node simple-start.js

pause 