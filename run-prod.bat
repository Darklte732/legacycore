@echo off
echo === LEGACYCORE PRODUCTION MODE ===
echo.
echo 1. Building the application...
call npm run build

echo.
echo 2. Starting production server...
echo Serving at: http://localhost:3000
echo ===================================================
call npm run start 