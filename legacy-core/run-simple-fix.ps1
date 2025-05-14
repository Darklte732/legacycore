# run-simple-fix.ps1
# Simple fix for LegacyCore production issues

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
        Write-Host "Port 3000 is already in use. Stopping existing processes..." -ForegroundColor Yellow
        Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Host "Processes stopped." -ForegroundColor Green
    }
} catch {
    Write-Host "Unable to check port usage. Continuing..." -ForegroundColor Yellow
}

Write-Host "======================================================" -ForegroundColor Blue
Write-Host "    LEGACYCORE SIMPLE PRODUCTION RUN" -ForegroundColor Blue
Write-Host "======================================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Create alternate image versions
Write-Host "Step 1: Creating alternate image versions..." -ForegroundColor Yellow
Write-Host ""

# Create image variants (with and without hyphens)
$imageFiles = @(
    @{ source = "public/aig logo.png"; target = "public/aig-logo.png" },
    @{ source = "public/aig-logo.png"; target = "public/aig logo.png" },
    @{ source = "public/americo logo.png"; target = "public/americo-logo.png" },
    @{ source = "public/americo-logo.png"; target = "public/americo logo.png" },
    @{ source = "public/gerber logo.png"; target = "public/gerber-logo.png" },
    @{ source = "public/gerber-logo.png"; target = "public/gerber logo.png" },
    @{ source = "public/aetna logo.png"; target = "public/aetna-logo.png" },
    @{ source = "public/aetna-logo.png"; target = "public/aetna logo.png" }
)

foreach ($file in $imageFiles) {
    if (Test-Path $file.source -ErrorAction SilentlyContinue) {
        if (-not (Test-Path $file.target -ErrorAction SilentlyContinue)) {
            Copy-Item -Path $file.source -Destination $file.target -Force
            Write-Host "  Created $($file.target) from $($file.source)" -ForegroundColor Green
        }
    } else {
        Write-Host "  Warning: Source file $($file.source) does not exist" -ForegroundColor Yellow
    }
}

# Step 2: Building the application
Write-Host ""
Write-Host "Step 2: Building the application..." -ForegroundColor Yellow
Write-Host ""

# Run the Next.js build
npx next build

# Check if the build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 3: Start the server
Write-Host ""
Write-Host "Step 3: Starting the production server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Blue
Write-Host ""

# Run the server.js directly, not using the standalone build
node server.js 