@echo off
echo Preparing Next.js standalone deployment...

:: Copy static files to the standalone directory
echo Copying static files to standalone directory...
xcopy /E /I /Y .next\static .next\standalone\.next\static

:: Create a public directory if it doesn't exist
echo Creating public directory...
mkdir -Force .next\standalone\public 2>nul

:: Copy any public files if they exist
echo Copying public files...
if exist public\* (
  xcopy /E /I /Y public .next\standalone\public
)

echo Standalone deployment prepared successfully!
echo To run the server, navigate to .next\standalone and run: node server.js 