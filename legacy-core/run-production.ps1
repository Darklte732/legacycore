# LegacyCore Production Runner
# This script builds the Next.js app, copies all necessary assets, and runs the production server

# Function to copy a directory recursively
function Copy-FolderRecursively {
    param (
        [string]$Source,
        [string]$Destination
    )
    
    # Create destination directory if it doesn't exist
    if (!(Test-Path $Destination)) {
        New-Item -Path $Destination -ItemType Directory -Force | Out-Null
    }
    
    # Copy all items from source to destination
    Get-ChildItem -Path $Source -Recurse | ForEach-Object {
        $TargetPath = $_.FullName.Replace($Source, $Destination)
        
        if ($_.PSIsContainer) {
            # Create directory
            if (!(Test-Path $TargetPath)) {
                New-Item -Path $TargetPath -ItemType Directory -Force | Out-Null
            }
        } else {
            # Copy file
            Copy-Item -Path $_.FullName -Destination $TargetPath -Force
        }
    }
}

# Function to create alternate versions of logo files (with and without hyphens)
function Create-AlternateVersions {
    param (
        [string]$PublicDir
    )
    
    Write-Host "Creating alternate versions of image files..." -ForegroundColor Yellow
    
    # Define logo mappings (both hyphenated and space versions)
    $logoMappings = @(
        @{ source = "aig logo.png"; target = "aig-logo.png" },
        @{ source = "aig-logo.png"; target = "aig logo.png" },
        @{ source = "americo logo.png"; target = "americo-logo.png" },
        @{ source = "americo-logo.png"; target = "americo logo.png" },
        @{ source = "gerber logo.png"; target = "gerber-logo.png" },
        @{ source = "gerber-logo.png"; target = "gerber logo.png" },
        @{ source = "aetna logo.png"; target = "aetna-logo.png" },
        @{ source = "aetna-logo.png"; target = "aetna logo.png" }
    )
    
    # Create each alternate version
    foreach ($mapping in $logoMappings) {
        $sourcePath = Join-Path -Path $PublicDir -ChildPath $mapping.source
        $targetPath = Join-Path -Path $PublicDir -ChildPath $mapping.target
        
        if (Test-Path $sourcePath) {
            try {
                Copy-Item -Path $sourcePath -Destination $targetPath -Force
                Write-Host "  Created $($mapping.target) from $($mapping.source)" -ForegroundColor Gray
            } catch {
                Write-Host "  Failed to create $($mapping.target): $_" -ForegroundColor Red
            }
        }
    }
}

# Set working directory to script location
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptDir

# Build the Next.js application
Write-Host "Building Next.js application..." -ForegroundColor Green
npx next build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "Build completed successfully" -ForegroundColor Green

# Copy public directory to standalone
$PublicSource = Join-Path -Path $ScriptDir -ChildPath "public"
$PublicTarget = Join-Path -Path $ScriptDir -ChildPath ".next\standalone\public"
Write-Host "Copying public directory to standalone..." -ForegroundColor Yellow
Copy-FolderRecursively -Source $PublicSource -Destination $PublicTarget
Write-Host "Successfully copied public directory to $PublicTarget" -ForegroundColor Green

# Create alternate versions of logo files
Create-AlternateVersions -PublicDir $PublicTarget
Write-Host "Alternate versions created successfully" -ForegroundColor Green

# Copy static directory to standalone/.next/static
$StaticSource = Join-Path -Path $ScriptDir -ChildPath ".next\static"
$StaticTarget = Join-Path -Path $ScriptDir -ChildPath ".next\standalone\.next\static"
Write-Host "Copying static directory to standalone..." -ForegroundColor Yellow
Copy-FolderRecursively -Source $StaticSource -Destination $StaticTarget
Write-Host "Successfully copied static directory to $StaticTarget" -ForegroundColor Green

# Verify that critical directories exist
$criticalPaths = @(
    ".next\standalone\public",
    ".next\standalone\.next\static",
    ".next\standalone\.next\static\css",
    ".next\standalone\.next\static\chunks"
)

$allPathsExist = $true
foreach ($path in $criticalPaths) {
    $fullPath = Join-Path -Path $ScriptDir -ChildPath $path
    if (!(Test-Path $fullPath)) {
        Write-Host "ERROR: Critical path $path does not exist!" -ForegroundColor Red
        $allPathsExist = $false
    }
}

if (!$allPathsExist) {
    Write-Host "Asset verification failed. Please check the paths above." -ForegroundColor Red
    exit 1
}

# Start the production server
Write-Host "Starting production server..." -ForegroundColor Green
$ServerJsPath = Join-Path -Path $ScriptDir -ChildPath ".next\standalone\server.js"
node $ServerJsPath 