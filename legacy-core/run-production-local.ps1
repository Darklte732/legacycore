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

# Copy static directory to standalone/.next/static
$StaticSource = Join-Path -Path $ScriptDir -ChildPath ".next\static"
$StaticTarget = Join-Path -Path $ScriptDir -ChildPath ".next\standalone\.next\static"
Write-Host "Copying static directory to standalone..." -ForegroundColor Yellow
Copy-FolderRecursively -Source $StaticSource -Destination $StaticTarget
Write-Host "Successfully copied static directory to $StaticTarget" -ForegroundColor Green

# Start the production server
Write-Host "Starting production server..." -ForegroundColor Green
$ServerJsPath = Join-Path -Path $ScriptDir -ChildPath ".next\standalone\server.js"
node $ServerJsPath 