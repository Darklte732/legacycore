# LegacyCore Production Deployment Script
# This script handles the nested directory structure and builds/deploys the project properly

# Set environment variables (replace these with your actual values if needed)
$env:NODE_ENV = "production"
$env:NEXT_PUBLIC_SUPABASE_URL = "https://iufyuzmigirugcufrtvt.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQxMjcsImV4cCI6MjA2MDYxMDEyN30.V38OGEX1Oy3gFfu5ClGWRk3xYAhb_DVr-5ojOQZ1UfU"
$env:SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$env:SUPABASE_ANON_KEY = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$env:SUPABASE_COOKIE_SECURE = "false"
$env:COOKIE_NAME = "legacycore-auth-token"
$env:COOKIE_MAX_AGE = "86400"

# Set script root directory
$rootDir = $PSScriptRoot
$legacyCoreDir = Join-Path -Path $rootDir -ChildPath "legacy-core"

Write-Host "======================================================" -ForegroundColor Green
Write-Host "      DEPLOYING LEGACYCORE PROJECT" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

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

# Step 1: Create helper scripts in legacy-core directory if they don't exist
Write-Host "Step 1: Setting up helper scripts in legacy-core directory..." -ForegroundColor Yellow

# Create copy-public-to-standalone.js if it doesn't exist
$copyPublicScript = Join-Path -Path $legacyCoreDir -ChildPath "copy-public-to-standalone.js"
if (-not (Test-Path $copyPublicScript)) {
    Write-Host "Creating copy-public-to-standalone.js..." -ForegroundColor Yellow
    @"
const fs = require('fs');
const path = require('path');

console.log('Copying public assets to standalone directory...');

// Function to ensure directory exists
function ensureDirectoryExists(directory) {
  const parts = directory.split(path.sep);
  let currentPath = '';
  
  for (const part of parts) {
    currentPath = path.join(currentPath, part);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  }
}

// Copy all files from public to standalone/public
function copyPublicDirectory() {
  const sourceDir = path.join(__dirname, 'public');
  const targetDir = path.join(__dirname, '.next', 'standalone', 'public');
  
  ensureDirectoryExists(targetDir);
  
  // Copy all files 
  copyFiles(sourceDir, targetDir);
  
  console.log('Public directory copied successfully');
}

// Create alternate versions of image files (with and without hyphens)
function createAlternateVersions() {
  const targetDir = path.join(__dirname, '.next', 'standalone', 'public');
  
  // Create both hyphenated and space versions of logo files
  const logoMappings = [
    { source: 'aig logo.png', target: 'aig-logo.png' },
    { source: 'aig-logo.png', target: 'aig logo.png' },
    { source: 'americo logo.png', target: 'americo-logo.png' },
    { source: 'americo-logo.png', target: 'americo logo.png' },
    { source: 'gerber logo.png', target: 'gerber-logo.png' },
    { source: 'gerber-logo.png', target: 'gerber logo.png' },
    { source: 'aetna logo.png', target: 'aetna-logo.png' },
    { source: 'aetna-logo.png', target: 'aetna logo.png' }
  ];
  
  console.log('Creating alternate versions of image files...');
  
  logoMappings.forEach(mapping => {
    const sourcePath = path.join(targetDir, mapping.source);
    const targetPath = path.join(targetDir, mapping.target);
    
    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(\`  Created \${mapping.target} from \${mapping.source}\`);
      } catch (err) {
        console.error(\`  Failed to create \${mapping.target}: \${err.message}\`);
      }
    }
  });
  
  // Ensure video thumbnail exists
  const thumbnailPath = path.join(targetDir, 'video-thumbnail.jpg');
  if (!fs.existsSync(thumbnailPath)) {
    // Create a 1x1 pixel placeholder image if the thumbnail doesn't exist
    console.log('Creating placeholder video-thumbnail.jpg');
    const placeholderData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 
      0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 0xff, 0xd9
    ]);
    fs.writeFileSync(thumbnailPath, placeholderData);
  }
}

// Recursive function to copy files
function copyFiles(source, target) {
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      ensureDirectoryExists(targetPath);
      copyFiles(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(\`  Copied \${sourcePath} to \${targetPath}\`);
    }
  });
}

// Execute
copyPublicDirectory();
createAlternateVersions();

console.log('Copy completed.');
"@ | Out-File -FilePath $copyPublicScript -Encoding utf8
}

# Create copy-chunks.js if it doesn't exist
$copyChunksScript = Join-Path -Path $legacyCoreDir -ChildPath "copy-chunks.js"
if (-not (Test-Path $copyChunksScript)) {
    Write-Host "Creating copy-chunks.js..." -ForegroundColor Yellow
    @"
const fs = require('fs');
const path = require('path');

console.log('Copying essential JS chunks to standalone directory...');

// Function to ensure directory exists
function ensureDirectoryExists(directory) {
  const parts = directory.split(path.sep);
  let currentPath = '';
  
  for (const part of parts) {
    currentPath = path.join(currentPath, part);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  }
}

// Copy chunks for specific pages that need them
function copyPageChunks() {
  // Key page paths to ensure their chunks are copied
  const pagePaths = [
    'manager/script-assistant',
    'agent/script-assistant',
    'static/chunks'
  ];
  
  pagePaths.forEach(pagePath => {
    const sourceDir = path.join(__dirname, '.next', 'static', 'chunks', pagePath);
    const targetDir = path.join(__dirname, '.next', 'standalone', '.next', 'static', 'chunks', pagePath);
    
    if (fs.existsSync(sourceDir)) {
      ensureDirectoryExists(targetDir);
      copyDirectoryContents(sourceDir, targetDir);
      console.log(\`Copied chunks for \${pagePath}\`);
    } else {
      console.log(\`Source chunks directory not found for \${pagePath}\`);
    }
  });
}

// Copy critical shared chunks
function copyCriticalSharedChunks() {
  const sourceStaticDir = path.join(__dirname, '.next', 'static');
  const targetStaticDir = path.join(__dirname, '.next', 'standalone', '.next', 'static');
  
  ensureDirectoryExists(targetStaticDir);
  
  // Copy specific files from static/chunks directory
  const chunksDir = path.join(sourceStaticDir, 'chunks');
  const targetChunksDir = path.join(targetStaticDir, 'chunks');
  
  ensureDirectoryExists(targetChunksDir);
  
  if (fs.existsSync(chunksDir)) {
    const entries = fs.readdirSync(chunksDir);
    
    // Copy only .js files in the root chunks directory
    entries.forEach(entry => {
      const sourcePath = path.join(chunksDir, entry);
      const targetPath = path.join(targetChunksDir, entry);
      
      if (fs.statSync(sourcePath).isFile() && entry.endsWith('.js')) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(\`Copied shared chunk: \${entry}\`);
      }
    });
  }
  
  // Copy CSS files if they exist
  const cssDir = path.join(sourceStaticDir, 'css');
  const targetCssDir = path.join(targetStaticDir, 'css');
  
  if (fs.existsSync(cssDir)) {
    ensureDirectoryExists(targetCssDir);
    copyDirectoryContents(cssDir, targetCssDir);
    console.log('Copied CSS files');
  }
}

// Helper function to copy directory contents
function copyDirectoryContents(source, target) {
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      ensureDirectoryExists(targetPath);
      copyDirectoryContents(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Execute
copyPageChunks();
copyCriticalSharedChunks();

console.log('Chunk copying completed.');
"@ | Out-File -FilePath $copyChunksScript -Encoding utf8
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "Step 2: Installing dependencies in legacy-core directory..." -ForegroundColor Yellow
Set-Location -Path $legacyCoreDir
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies. Exiting." -ForegroundColor Red
    exit 1
}

# Step 3: Build the Next.js application 
Write-Host ""
Write-Host "Step 3: Building the Next.js application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Exiting." -ForegroundColor Red
    exit 1
}

# Step 4: Copy public directory and static assets to standalone
Write-Host ""
Write-Host "Step 4: Copying public directory and static assets to standalone..." -ForegroundColor Yellow
node copy-public-to-standalone.js
node copy-chunks.js

# Step 5: Verify images exist
Write-Host ""
Write-Host "Step 5: Verifying images exist..." -ForegroundColor Yellow
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

# Step 6: Start the server
Write-Host ""
Write-Host "Step 6: Starting the production server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# Run the server
if (Test-Path ".next/standalone/server.js") {
    node .next/standalone/server.js
} else {
    Write-Host "Standalone server.js not found. Starting with Next.js start..." -ForegroundColor Yellow
    npm run start
} 