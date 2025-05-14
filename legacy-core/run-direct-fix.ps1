# run-direct-fix.ps1
# Simplified direct approach to fix the script display issues

# Set environment variables
$env:NODE_ENV = "production"
$env:NEXT_PUBLIC_SUPABASE_URL = "https://iufyuzmigirugcufrtvt.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQxMjcsImV4cCI6MjA2MDYxMDEyN30.V38OGEX1Oy3gFfu5ClGWRk3xYAhb_DVr-5ojOQZ1UfU"
$env:SUPABASE_URL = "https://iufyuzmigirugcufrtvt.supabase.co"
$env:SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Znl1em1pZ2lydWdjdWZydHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQxMjcsImV4cCI6MjA2MDYxMDEyN30.V38OGEX1Oy3gFfu5ClGWRk3xYAhb_DVr-5ojOQZ1UfU"
$env:SUPABASE_COOKIE_SECURE = "false"
$env:COOKIE_NAME = "legacycore-auth-token"
$env:COOKIE_MAX_AGE = "86400"

# Kill any existing Node processes
Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "      LEGACYCORE DIRECT FIX" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Creating image variants
Write-Host "Step 1: Creating image variants..." -ForegroundColor Yellow
Write-Host ""

# Check for public directory, create if missing
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" -Force | Out-Null
    Write-Host "  Created public directory" -ForegroundColor Green
}

# Create placeholder files for common images if they don't exist
$placeholderImages = @(
    "public/aig-logo.png",
    "public/americo-logo.png",
    "public/gerber-logo.png",
    "public/aetna-logo.png",
    "public/logo.png",
    "public/video-thumbnail.jpg"
)

foreach ($image in $placeholderImages) {
    if (-not (Test-Path $image)) {
        # Create a very simple 1x1 pixel image
        $data = [byte[]]@(
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
            0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        )
        [System.IO.File]::WriteAllBytes($image, $data)
        Write-Host "  Created placeholder image: $image" -ForegroundColor Green
    }
}

# Step 2: Create copy of script-assistant directory if missing
Write-Host ""
Write-Host "Step 2: Ensuring script-assistant directory is set up..." -ForegroundColor Yellow
Write-Host ""

# Ensure manager/script-assistant directory exists
$scriptAssistantDir = "src/app/manager/script-assistant"
if (-not (Test-Path $scriptAssistantDir)) {
    New-Item -ItemType Directory -Path $scriptAssistantDir -Force | Out-Null
    Write-Host "  Created $scriptAssistantDir directory" -ForegroundColor Green
}

# Copy direct-fix-script.js to script-assistant directory
Copy-Item -Path "direct-fix-script.js" -Destination "$scriptAssistantDir/script-inject.js" -Force
Write-Host "  Copied direct-fix-script.js to $scriptAssistantDir/script-inject.js" -ForegroundColor Green

# Step 3: Generate server-direct.js
Write-Host ""
Write-Host "Step 3: Creating server-direct.js with script injection..." -ForegroundColor Yellow
Write-Host ""

# Get script content from direct-fix-script.js
$scriptContent = Get-Content -Path "direct-fix-script.js" -Raw

# Create a properly formatted server-direct.js file
$serverJs = @'
// server-direct.js - Simple server that injects our script fix
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Define environment
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// Direct script fix to inject
const SCRIPT_FIX = `SCRIPT_CONTENT_PLACEHOLDER`;

// Prepare the server
app.prepare().then(() => {
  console.log('Server ready with direct script injection');

  // Custom server that injects our script in the response
  createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;
      
      // Log all requests for debugging
      console.log(`Request: ${pathname}`);
      
      // Special handling for script assistant pages
      if (pathname.includes('/manager/script-assistant')) {
        console.log('Manager script assistant page detected, handling specially');
        
        // Capture response to modify it
        const originalWrite = res.write;
        const originalEnd = res.end;
        
        let responseBody = '';
        
        // Capture all chunks
        res.write = function(chunk) {
          responseBody += chunk.toString();
          return originalWrite.apply(this, arguments);
        };
        
        // Inject script before sending response
        res.end = function(chunk) {
          if (chunk) {
            responseBody += chunk.toString();
          }
          
          // Inject our direct fix script
          if (responseBody.includes('</body>')) {
            const modified = responseBody.replace(
              '</body>',
              `<script>${SCRIPT_FIX}</script></body>`
            );
            
            // Set content and send
            return originalEnd.call(this, modified);
          } else {
            return originalEnd.call(this, responseBody);
          }
        };
      }
      
      // Handle images (simplified version)
      if (pathname.match(/\.(png|jpg|jpeg|gif)$/i)) {
        // Try both with and without hyphens
        const cleanPath = pathname.replace(/^\//, '');
        const hyphenPath = cleanPath.replace(/\s+/g, '-');
        const spacePath = cleanPath.replace(/-/g, ' ');
        
        const possiblePaths = [
          path.join(__dirname, 'public', cleanPath),
          path.join(__dirname, 'public', hyphenPath),
          path.join(__dirname, 'public', spacePath)
        ];
        
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            const ext = path.extname(p).toLowerCase();
            const contentType = ext === '.jpg' || ext === '.jpeg' 
              ? 'image/jpeg' 
              : 'image/png';
            
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(p).pipe(res);
            console.log('Served image:', p);
            return;
          }
        }
        
        // If image not found, return a 1x1 pixel placeholder
        console.log('Image not found, serving placeholder:', pathname);
        const placeholderImage = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
          0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
          0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
          0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(placeholderImage);
        return;
      }
      
      // Let Next.js handle everything else
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error serving request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> Navigate to http://localhost:${PORT}/manager/script-assistant to test the fix`);
    console.log('> Press Ctrl+C to stop the server');
  });
});
'@

# Replace the script content placeholder with the actual script content
# Need to escape any backticks in the script content
$escapedScript = $scriptContent.Replace('`', '\`')
$serverJs = $serverJs.Replace('SCRIPT_CONTENT_PLACEHOLDER', $escapedScript)

# Write the server file
Set-Content -Path "server-direct.js" -Value $serverJs -Encoding UTF8
Write-Host "  Created server-direct.js with script injection" -ForegroundColor Green

# Step 4: Build the application
Write-Host ""
Write-Host "Step 4: Building the application..." -ForegroundColor Yellow
Write-Host ""

npx next build

# Check if the build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 5: Start the server
Write-Host ""
Write-Host "Step 5: Starting the server with direct fix..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3000/manager/script-assistant" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Start the server with the direct fix
node server-direct.js 