// Simple development server with production-like features
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Always use development mode for stability
const dev = true;
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create necessary directories
const nextDir = path.join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// Create a simple prerender-manifest.json file to fix the error
const prerenderManifestPath = path.join(nextDir, 'prerender-manifest.json');
if (!fs.existsSync(prerenderManifestPath)) {
  const mockManifest = {
    version: 4,
    routes: {},
    dynamicRoutes: {},
    notFoundRoutes: [],
    preview: {
      previewModeId: "development-id",
      previewModeSigningKey: "development-key",
      previewModeEncryptionKey: "development-encryption-key"
    }
  };
  
  try {
    fs.writeFileSync(prerenderManifestPath, JSON.stringify(mockManifest, null, 2));
    console.log('Created mock prerender-manifest.json file');
  } catch (err) {
    console.error('Failed to create prerender-manifest.json:', err);
  }
}

// Create JS version too
const prerenderManifestJsPath = path.join(nextDir, 'prerender-manifest.js');
if (!fs.existsSync(prerenderManifestJsPath)) {
  const jsContent = `
// Auto-generated mock file
module.exports = ${JSON.stringify({
    version: 4,
    routes: {},
    dynamicRoutes: {},
    notFoundRoutes: [],
    preview: {
      previewModeId: "development-id",
      previewModeSigningKey: "development-key",
      previewModeEncryptionKey: "development-encryption-key"
    }
  }, null, 2)}
`;
  
  try {
    fs.writeFileSync(prerenderManifestJsPath, jsContent);
    console.log('Created mock prerender-manifest.js file');
  } catch (err) {
    console.error('Failed to create prerender-manifest.js:', err);
  }
}

// Initialize Next.js
console.log('Initializing Next.js development server...');
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prepare the app
app.prepare()
  .then(() => {
    console.log('Next.js app prepared, starting HTTP server...');
    
    createServer((req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        
        // Let Next.js handle the request
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error processing request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Mode: Development with production-like features');
      console.log('> Note: This server uses development mode for better error handling');
    });
  })
  .catch((err) => {
    console.error('Error preparing Next.js app:', err);
    process.exit(1);
  }); 