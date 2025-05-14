const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { createReadStream } = require('fs');
const { parse } = require('url');

console.log('=== LEGACYCORE STATIC PRODUCTION BUILD & SERVE ===');

// Step 1: Build the application in static export mode
console.log('\n1. Building the application in static export mode...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Verify the output directory exists
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ The "out" directory was not created. Build may have failed.');
  process.exit(1);
}

// Step 3: Create a simple static file server
console.log('\n2. Starting static file server...');
const PORT = 3000;

const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // If path ends with '/' or is empty, serve index.html
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (!pathname.includes('.')) {
    // If there's no file extension, assume it's a route and try to serve the HTML file
    pathname = `${pathname}.html`;
    // Check if HTML exists, if not fall back to index.html (for client-side routing)
    if (!fs.existsSync(path.join(outDir, pathname.slice(1)))) {
      pathname = '/index.html';
    }
  }
  
  // Create a full path to the file
  const filePath = path.join(outDir, pathname.slice(1));
  
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file doesn't exist, serve 404 page or index for SPA routing
      console.log(`File not found: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404 Not Found');
      return;
    }
    
    // Get the content type based on file extension
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (ext) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpeg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    // Stream the file to the response
    res.writeHead(200, { 'Content-Type': contentType });
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error(`Error streaming file: ${error}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    });
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server\n');
}); 