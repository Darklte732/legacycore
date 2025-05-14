// force-script-server.js - Server that injects our script fix
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

// Load script content directly from file
let scriptContent = '';
try {
  scriptContent = fs.readFileSync(path.join(__dirname, 'direct-script-fix.js'), 'utf8');
  console.log('Successfully loaded script fix content');
} catch (error) {
  console.error('Error loading script fix:', error);
  process.exit(1);
}

// Prepare the server
app.prepare().then(() => {
  console.log('Force Script Server ready');
  console.log('This server will forcefully inject the script content into all pages at /manager/script-assistant');

  // Custom server that injects our script in the response
  createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;
      
      // Log requests for debugging
      console.log(`Request: ${pathname}`);
      
      // Special handling for script assistant pages
      if (pathname.includes('/manager/script-assistant') || pathname.includes('/agent/script-assistant')) {
        console.log('Script assistant page detected, handling specially');
        
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
          
          // Inject our direct fix script in two places for maximum reliability
          
          // 1. At the end of body
          if (responseBody.includes('</body>')) {
            responseBody = responseBody.replace(
              '</body>',
              `<script>${scriptContent}</script></body>`
            );
          }
          
          // 2. Also in the head for early execution
          if (responseBody.includes('</head>')) {
            responseBody = responseBody.replace(
              '</head>',
              `<script>(function(){console.log('[Force Script] Head injection started');})();</script></head>`
            );
          }
          
          // Set content and send
          return originalEnd.call(this, responseBody);
        };
      }
      
      // Handle image paths with flexibility
      if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
        // Try both with and without hyphens, and different name variations
        const cleanPath = pathname.replace(/^\//, '').trim();
        
        // Generate variations of the path
        const possiblePaths = [
          path.join(__dirname, cleanPath),
          path.join(__dirname, 'public', cleanPath),
          path.join(__dirname, cleanPath.replace(/\s+/g, '-')),
          path.join(__dirname, 'public', cleanPath.replace(/\s+/g, '-')),
          path.join(__dirname, cleanPath.replace(/-/g, ' ')),
          path.join(__dirname, 'public', cleanPath.replace(/-/g, ' ')),
        ];
        
        // Try to find the file
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            console.log(`Serving image: ${p}`);
            
            // Get file extension and set content type
            const ext = path.extname(p).toLowerCase();
            let contentType = 'image/png'; // default
            
            // Set appropriate content type based on extension
            if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.webp') contentType = 'image/webp';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            
            // Serve the file
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(p).pipe(res);
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
    console.log(`> Server ready on http://localhost:${PORT}`);
    console.log(`> For testing, visit http://localhost:${PORT}/manager/script-assistant`);
    console.log('> Press Ctrl+C to stop the server');
  });
}); 