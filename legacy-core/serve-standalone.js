// serve-standalone.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Get the absolute path to the Next.js standalone server
const dir = path.join(__dirname, '.next/standalone');
const staticDir = path.join(__dirname, '.next/static');
const publicDir = path.join(__dirname, 'public');

// Check if the directories exist
console.log(`Standalone directory: ${dir} (exists: ${fs.existsSync(dir)})`);
console.log(`Static directory: ${staticDir} (exists: ${fs.existsSync(staticDir)})`);
console.log(`Public directory: ${publicDir} (exists: ${fs.existsSync(publicDir)})`);

// Create a standalone server instance
const app = next({ 
  dev: false,
  dir,
  conf: {
    distDir: './.next',
    outDir: './.next/standalone',
  }
});

const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Handle static files directly
    if (pathname.startsWith('/_next/static')) {
      console.log(`Serving static file: ${pathname}`);
      const filePath = path.join(__dirname, '.next', pathname);
      
      // Check if the file exists
      if (fs.existsSync(filePath)) {
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        return;
      }
    }

    // Handle public files directly
    if (!pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const filePath = path.join(publicDir, pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        console.log(`Serving public file: ${pathname}`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        return;
      }
    }

    // Default handler
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}); 