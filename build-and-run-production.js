const { spawn, execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Set environment variables for production
process.env.NODE_ENV = 'production';

console.log('=== LEGACYCORE PRODUCTION BUILD & RUN ===');

// Step 1: Create necessary directories if they don't exist
console.log('\n1. Creating necessary directories...');
const dirs = [
  'public',
  'public/images',
  'legacy-core/public',
  'legacy-core/public/images'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Step 2: Build the application
console.log('\n2. Building the application...');
try {
  execSync('cd legacy-core && npx next build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

// Step 3: Copy assets to ensure they're available
console.log('\n3. Copying assets to standalone directory...');

// Helper to copy directory recursively
function copyRecursive(src, dest) {
  try {
    if (!fs.existsSync(src)) {
      console.warn(`Source directory not found: ${src}`);
      return;
    }
    
    fs.ensureDirSync(dest);
    fs.copySync(src, dest, { overwrite: true });
    console.log(`Copied: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
  }
}

// Copy static assets
copyRecursive('legacy-core/.next/static', 'legacy-core/.next/standalone/.next/static');
copyRecursive('legacy-core/public', 'legacy-core/.next/standalone/public');
copyRecursive('public', 'legacy-core/.next/standalone/public');

// Ensure images directory exists in multiple locations for fallback
fs.ensureDirSync('legacy-core/.next/standalone/public/images');

// Create a dummy video-thumbnail.jpg if needed
const thumbnailPath = 'legacy-core/.next/standalone/public/images/video-thumbnail.jpg';
if (!fs.existsSync(thumbnailPath)) {
  fs.writeFileSync(thumbnailPath, 'DUMMY_IMAGE_PLACEHOLDER');
  console.log(`Created placeholder for missing image: ${thumbnailPath}`);
}

// Copy and create alternate versions of the logo files
const logoFiles = [
  { source: 'legacy logo.png', target: 'logo.png' },
  { source: 'legacy logo.png', target: 'legacy-logo.png' },
  { source: 'legacy-logo.png', target: 'legacy logo.png' }
];

logoFiles.forEach(mapping => {
  const sourcePath = path.join('legacy-core', 'public', 'images', mapping.source);
  const targetPaths = [
    path.join('legacy-core', '.next', 'standalone', 'public', 'images', mapping.target),
    path.join('legacy-core', '.next', 'standalone', 'public', mapping.target),
    path.join('public', 'images', mapping.target),
    path.join('public', mapping.target)
  ];
  
  if (fs.existsSync(sourcePath)) {
    targetPaths.forEach(targetPath => {
      try {
        fs.ensureDirSync(path.dirname(targetPath));
        fs.copySync(sourcePath, targetPath);
        console.log(`Copied logo: ${mapping.source} -> ${targetPath}`);
      } catch (error) {
        console.error(`Error copying logo ${mapping.source} to ${targetPath}:`, error.message);
      }
    });
  }
});

// Step 4: Modify the server.js file to properly serve static files
console.log('\n4. Configuring server for static file serving...');
const serverJsPath = 'legacy-core/.next/standalone/server.js';

if (fs.existsSync(serverJsPath)) {
  let serverContent = fs.readFileSync(serverJsPath, 'utf8');
  
  // Add path module if it doesn't exist
  if (!serverContent.includes('const path = require(\'path\')')) {
    serverContent = 'const path = require(\'path\');\n' + serverContent;
  }
  
  // Make sure we're serving static files properly
  if (!serverContent.includes('server.use(\'/static\', express.static')) {
    // Add static file serving before the handler
    serverContent = serverContent.replace(
      /server\.use\(handler\)/,
      'server.use(\'/static\', express.static(path.join(__dirname, \'.next/static\')));\n' +
      'server.use(express.static(path.join(__dirname, \'public\')));\n' +
      'server.use(express.static(path.join(__dirname, \'.next/static\')));\n' +
      'server.use(handler)'
    );
    
    // Save the modified server.js
    fs.writeFileSync(serverJsPath, serverContent);
    console.log('Server.js updated to serve static files');
  } else {
    console.log('Server.js already configured for static files');
  }
} else {
  console.error('server.js not found in standalone directory');
}

// Step 5: Start the production server
console.log('\n5. Starting production server (press Ctrl+C to stop)...');
console.log('Serving at: http://localhost:3000');
console.log('===================================================');

// Change to the standalone directory and run the server
process.chdir('legacy-core/.next/standalone');
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

// Handle server termination
server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
}); 