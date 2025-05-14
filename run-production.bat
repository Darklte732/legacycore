@echo off
echo === LEGACYCORE PRODUCTION MODE ===
echo.
echo 1. Installing dependencies...
call npm install --silent

echo.
echo 2. Building the application...
call npx cross-env NODE_ENV=production next build

echo.
echo 3. Starting production server...
echo Serving at: http://localhost:3001
echo ===================================================
call npx cross-env NODE_ENV=production next start -p 3001 