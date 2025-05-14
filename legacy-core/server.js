// server.js - Custom server for LegacyCore standalone deployment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Define the port
const PORT = process.env.PORT || 3000;

// Set up environment variables correctly
process.env.NODE_ENV = 'production';

// Initialize Next.js app
const app = next({ 
  dev: false,
  dir: __dirname,
  conf: { 
    distDir: '.next'
  } 
});

const handle = app.getRequestHandler();

// Custom script fix content to inject
const SCRIPT_FIX_CONTENT = `
(function() {
  console.log('[Fix Script Display] Direct injection loaded');
  
  // Add required styles for script display
  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = \`
      .script-preview {
        font-family: 'Courier New', monospace !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        background-color: #f9f9f9 !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 6px !important;
        padding: 1.5rem !important;
        max-height: 100% !important;
        overflow-y: auto !important;
        white-space: pre-wrap !important;
        color: #333 !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    \`;
    
    document.head.appendChild(styleEl);
  }
  
  // Find script preview and fix display
  function fixScriptPreview() {
    const scriptPreview = document.querySelector('.script-preview');
    if (scriptPreview) {
      console.log('[Fix Script Display] Found script preview');
      
      // Force visibility
      scriptPreview.style.display = 'block';
      scriptPreview.style.visibility = 'visible';
      scriptPreview.style.opacity = '1';
      scriptPreview.style.color = '#333';
      scriptPreview.style.backgroundColor = '#f9f9f9';
      scriptPreview.style.whiteSpace = 'pre-wrap';
      
      return true;
    }
    return false;
  }
  
  // Initialize fixes
  function init() {
    injectStyles();
    fixScriptPreview();
    
    // Set up periodic checks
    setInterval(fixScriptPreview, 2000);
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also try a few times immediately
  setTimeout(fixScriptPreview, 500);
  setTimeout(fixScriptPreview, 1500);
  setTimeout(fixScriptPreview, 3000);
})();
`;

// Prepare the server
console.log('Starting LegacyCore standalone server...');
app.prepare().then(() => {
  console.log('Next.js app prepared for production serving...');
  
  // Create a custom server that can handle both Next.js and static files
  createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;
      
      // Handle image files with better path resolution
      if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
        // Remove leading slash and try multiple path possibilities
        const cleanPath = pathname.replace(/^\//, '');
        
        // Try both with and without hyphens
        const hyphenPath = cleanPath.replace(/\s+/g, '-');
        const spacePath = cleanPath.replace(/-/g, ' ');
        
        const possiblePaths = [
          // Exact match
          path.join(__dirname, 'public', cleanPath),
          path.join(__dirname, cleanPath),
          
          // Check for hyphenated version
          path.join(__dirname, 'public', hyphenPath),
          path.join(__dirname, hyphenPath),
          
          // Check for space version
          path.join(__dirname, 'public', spacePath),
          path.join(__dirname, spacePath),
          
          // Check other locations
          path.join(__dirname, '.next/static', cleanPath),
          path.join(__dirname, '.next/static/media', path.basename(cleanPath))
        ];
        
        // Try to find the file in any of the possible paths
        let filePath = null;
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            filePath = p;
            break;
          }
        }
        
        if (filePath && fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            // Determine content type based on file extension
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            
            const mimeTypes = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg', 
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.ico': 'image/x-icon'
            };
            
            contentType = mimeTypes[ext] || contentType;
            
            // Set caching headers for better performance
            res.writeHead(200, { 
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400'
            });
            
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        } else {
          // Generate a placeholder for certain known images
          if (pathname.includes('logo') || pathname.includes('thumbnail')) {
            // Create a simple 1x1 transparent pixel PNG
            const placeholderImage = Buffer.from([
              0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
              0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
              0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
              0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
              0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
              0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
            ]);
            
            const ext = path.extname(pathname).toLowerCase();
            const contentType = ext === '.jpg' || ext === '.jpeg' 
              ? 'image/jpeg' 
              : 'image/png';
              
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(placeholderImage);
            return;
          }
        }
      }
      
      // Handle HTML responses - inject our script fix
      const originalEnd = res.end;
      res.end = function(data) {
        if (data && res.getHeader('Content-Type') && 
            res.getHeader('Content-Type').includes('text/html')) {
          
          let html = data.toString();
          
          // Only inject our script if it's an HTML response
          const scriptTag = `<script>${SCRIPT_FIX_CONTENT}</script>`;
          
          // Inject before closing body tag
          if (html.includes('</body>')) {
            html = html.replace('</body>', `${scriptTag}</body>`);
          } else {
            html = html + scriptTag;
          }
          
          // Call the original end with our modified content
          originalEnd.call(res, Buffer.from(html));
        } else {
          // Call the original end with unmodified content
          originalEnd.apply(res, arguments);
        }
      };
      
      // Handle all other requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error processing request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Server running on http://localhost:${PORT}`);
  });
}); 