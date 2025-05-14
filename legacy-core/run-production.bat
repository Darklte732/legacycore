@echo off
echo Starting Next.js standalone server in production mode...

:: Copy static files to the correct location (only needed once, but we'll do it every time to be safe)
xcopy /E /I /Y .next\static .next\standalone\.next\static

:: Start the server
cd .next\standalone
node server.js 