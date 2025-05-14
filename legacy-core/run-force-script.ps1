# run-force-script.ps1
# Runs the force-script-server.js to inject the script content fix

# Set environment variables
$env:NODE_ENV = "production"
$env:NEXT_PUBLIC_SUPABASE_URL = "https://iufyuzmigirugcufrtvt.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQxMjcsImV4cCI6MjA2MDYxMDEyN30.V38OGEX1Oy3gFfu5ClGWRk3xYAhb_DVr-5ojOQZ1UfU"
$env:SUPABASE_URL = "https://iufyuzmigirugcufrtvt.supabase.co"
$env:SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQxMjcsImV4cCI6MjA2MDYxMDEyN30.V38OGEX1Oy3gFfu5ClGWRk3xYAhb_DVr-5ojOQZ1UfU"
$env:SUPABASE_COOKIE_SECURE = "false"
$env:COOKIE_NAME = "legacycore-auth-token"
$env:COOKIE_MAX_AGE = "86400"

Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "      LEGACYCORE FORCE SCRIPT FIX" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Ensure our script fix is ready
Write-Host "Step 1: Ensuring script fix is ready..." -ForegroundColor Yellow
if (-not (Test-Path "direct-script-fix.js")) {
    Write-Host "  ERROR: direct-script-fix.js not found!" -ForegroundColor Red
    Write-Host "  Please make sure this file exists in the current directory." -ForegroundColor Red
    exit 1
}
Write-Host "  Script fix found!" -ForegroundColor Green

# Step 2: Build the application
Write-Host ""
Write-Host "Step 2: Building the application..." -ForegroundColor Yellow

npx next build

# Check if the build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "  Build completed successfully!" -ForegroundColor Green

# Step 3: Start the force script server
Write-Host ""
Write-Host "Step 3: Starting the force script server..." -ForegroundColor Yellow
Write-Host "  Server will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Navigate to http://localhost:3000/manager/script-assistant to test" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Run the server directly without pushing to background
node force-script-server.js 