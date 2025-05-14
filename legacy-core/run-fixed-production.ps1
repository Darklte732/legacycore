# Set environment variables
$env:NODE_ENV = "production"
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
Write-Host "      STARTING LEGACYCORE IN FIXED PRODUCTION MODE" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Step 1: Building the application..." -ForegroundColor Yellow
Write-Host ""

# Run the Next.js build
npx next build

# Check if the build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Step 2: Copying public directory and chunks to standalone..." -ForegroundColor Yellow
Write-Host ""

# Copy the images and static files to the correct location
node copy-public-to-standalone.js
node copy-chunks.js

Write-Host ""
Write-Host "Step 3: Verifying images exist..." -ForegroundColor Yellow
Write-Host ""

# Check if the images have been copied
$imageFiles = @(
    "logo.png",
    "americo-logo.png",
    "aig-logo.png",
    "aetna-logo.png",
    "gerber-logo.png",
    "video-thumbnail.jpg"
)

foreach ($file in $imageFiles) {
    $filepath = Join-Path -Path ".next/standalone/public" -ChildPath $file
    if (Test-Path $filepath) {
        Write-Host "✅ $file exists in standalone/public" -ForegroundColor Green
    } else {
        Write-Host "❌ $file does NOT exist in standalone/public" -ForegroundColor Red
        
        # Create a copy of the file with a hyphen if the space version exists
        $spaceVersion = $file -replace "-", " "
        $spacePath = Join-Path -Path "public" -ChildPath $spaceVersion
        if (Test-Path $spacePath) {
            $targetDir = Join-Path -Path ".next/standalone/public" -ChildPath (Split-Path -Path $file -Parent)
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
            }
            Copy-Item -Path $spacePath -Destination $filepath -Force
            Write-Host "   Created from space version: $spaceVersion" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Step 4: Starting the production server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# Run the standalone server with our custom server.js
$env:NODE_ENV = "production" 
node server.js 