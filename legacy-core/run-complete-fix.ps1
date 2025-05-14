# run-complete-fix.ps1
# Comprehensive fix for LegacyCore production issues

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

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "      LEGACYCORE COMPREHENSIVE FIX" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Building the application
Write-Host "Step 1: Building the application..." -ForegroundColor Yellow
Write-Host ""

# Run the Next.js build
npx next build

# Check if the build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 2: Copy public assets to standalone
Write-Host ""
Write-Host "Step 2: Copying public assets to standalone..." -ForegroundColor Yellow
Write-Host ""

# Run the script to copy public files
node copy-public-to-standalone.js

# Step 3: Copy JS chunks to standalone
Write-Host ""
Write-Host "Step 3: Copying JS chunks to standalone..." -ForegroundColor Yellow
Write-Host ""

# Run the script to copy chunks
node copy-chunks.js

# Step 4: Ensure fix scripts are in place
Write-Host ""
Write-Host "Step 4: Ensuring fix scripts are in place..." -ForegroundColor Yellow
Write-Host ""

# Create necessary directories
$scriptTargetDir = ".next/standalone/src/app/manager/script-assistant"
if (-not (Test-Path $scriptTargetDir)) {
    New-Item -ItemType Directory -Path $scriptTargetDir -Force | Out-Null
    Write-Host "  Created directory $scriptTargetDir" -ForegroundColor Green
}

# Copy fix-script-display.js
$scriptSourcePath = "src/app/manager/script-assistant/fix-script-display.js"
$scriptDestPath = "$scriptTargetDir/fix-script-display.js"

if (Test-Path $scriptSourcePath) {
    Copy-Item -Path $scriptSourcePath -Destination $scriptDestPath -Force
    Write-Host "  Copied $scriptSourcePath to $scriptDestPath" -ForegroundColor Green
} else {
    Write-Host "  ERROR: $scriptSourcePath does not exist!" -ForegroundColor Red
}

# Copy enhanced server.js to standalone
Copy-Item -Path "server.js" -Destination ".next/standalone/server.js" -Force
Write-Host "  Copied server.js to .next/standalone/server.js" -ForegroundColor Green

# Step 5: Create any missing files
Write-Host ""
Write-Host "Step 5: Creating any missing files..." -ForegroundColor Yellow
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

# Ensure both versions exist in the standalone directory as well
foreach ($file in $imageFiles) {
    $standaloneSource = $file.source -replace "^public/", ".next/standalone/public/"
    $standaloneTarget = $file.target -replace "^public/", ".next/standalone/public/"
    
    # Ensure directory exists
    $targetDir = Split-Path -Path $standaloneTarget -Parent
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    # Only copy if source exists
    if (Test-Path $file.source -ErrorAction SilentlyContinue) {
        Copy-Item -Path $file.source -Destination $standaloneTarget -Force
        Write-Host "  Copied $($file.source) to $standaloneTarget" -ForegroundColor Green
    }
}

# Step 6: Start the server
Write-Host ""
Write-Host "Step 6: Starting the production server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Run the standalone server with our custom server.js
$env:NODE_ENV = "production"
node .next/standalone/server.js 