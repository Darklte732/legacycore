// debug-dev-server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Create development server to see detailed React errors
const app = next({ 
  dev: true, // Set to true for development mode with full error messages
  dir: __dirname,
  conf: { 
    distDir: '.next'
  } 
});

const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// Prepare the server
app.prepare().then(() => {
  console.log('Next.js debug server starting...');
  console.log('This server runs in development mode to show full React errors.');
  
  createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
      // Let Next.js handle all requests
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error serving request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Debug server ready on http://localhost:${PORT}`);
    console.log('> Look for detailed React errors in the console');
  });
}).catch(err => {
  console.error('Error preparing Next.js app:', err);
  process.exit(1);
}); 