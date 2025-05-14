# Set environment variables
$env:NODE_ENV = "development"
$env:NEXT_PUBLIC_SUPABASE_URL = "https://iufyuzmigirugcufrtvt.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQxMjcsImV4cCI6MjA2MDYxMDEyN30.V38OGEX1Oy3gFfu5ClGWRk3xYAhb_DVr-5ojOQZ1UfU"
$env:SUPABASE_URL = "https://iufyuzmigirugcufrtvt.supabase.co"
$env:SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQxMjcsImV4cCI6MjA2MDYxMDEyN30.V38OGEX1Oy3gFfu5ClGWRk3xYAhb_DVr-5ojOQZ1UfU"
$env:SUPABASE_COOKIE_SECURE = "false"
$env:COOKIE_NAME = "legacycore-auth-token"
$env:COOKIE_MAX_AGE = "86400"

# Check if port 3000 is already in use, and stop any node process if needed
try {
    $portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Host "Port 3000 is already in use. Attempting to stop existing processes..." -ForegroundColor Yellow
        Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Host "Processes stopped." -ForegroundColor Green
    }
} catch {
    Write-Host "Unable to check port usage. Continuing..." -ForegroundColor Yellow
}

Write-Host "======================================================" -ForegroundColor Green
Write-Host "      STARTING DEBUG SERVER FOR LEGACYCORE" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "This server runs in development mode to show full React errors" -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# Run the debug server
node debug-dev-server.js 