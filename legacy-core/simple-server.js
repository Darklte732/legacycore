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
const SCRIPT_FIX = `
(function() {
  console.log('[Direct Fix] Simple script display fix loaded');
  
  function fixScriptDisplay() {
    const scriptPreview = document.querySelector('.script-preview');
    if (!scriptPreview) {
      console.log('[Direct Fix] No script preview element found');
      return;
    }
    
    // Apply styles
    scriptPreview.style.display = 'block';
    scriptPreview.style.visibility = 'visible';
    scriptPreview.style.opacity = '1';
    scriptPreview.style.fontFamily = 'Courier New, monospace';
    scriptPreview.style.fontSize = '14px';
    scriptPreview.style.lineHeight = '1.6';
    scriptPreview.style.backgroundColor = '#f9f9f9';
    scriptPreview.style.border = '1px solid #e0e0e0';
    scriptPreview.style.borderRadius = '6px';
    scriptPreview.style.padding = '1.5rem';
    scriptPreview.style.maxHeight = '100%';
    scriptPreview.style.overflowY = 'auto';
    scriptPreview.style.whiteSpace = 'pre-wrap';
    scriptPreview.style.color = '#333';
    
    console.log('[Direct Fix] Script display fixed');
  }
  
  // Run immediately and at intervals
  setInterval(fixScriptDisplay, 1000);
  setTimeout(fixScriptDisplay, 500);
  setTimeout(fixScriptDisplay, 1500);
  setTimeout(fixScriptDisplay, 3000);
})();
`;

// Prepare the server
app.prepare().then(() => {
  console.log('Server ready with direct script injection');

  // Custom server that injects our script in the response
  createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;
      
      // Special handling for script assistant pages
      if (pathname.includes('/manager/script-assistant')) {
        console.log('Manager script assistant page detected');
        
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
  });
}); 