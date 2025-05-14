@echo off
echo ===================================================
echo LEGACYCORE PRODUCTION MODE START
echo ===================================================
echo.

REM Check if Node.js is installed
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    exit /b 1
)

echo 1. Building the application...
echo.
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ===================================================
echo BUILD COMPLETED SUCCESSFULLY!
echo ===================================================
echo.
echo 2. Starting the production server...
echo    Server URL: http://localhost:3000
echo ===================================================
echo.

REM Check if .next/standalone/server.js exists (standalone mode)
IF EXIST .next\standalone\server.js (
    echo Starting in standalone mode...
    node .next\standalone\server.js
) ELSE (
    echo Starting with Next.js start...
    call npm run start
)

IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Server failed to start!
    pause
    exit /b 1
)

pause 