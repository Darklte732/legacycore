const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to copy a directory recursively
function copyFolderSync(from, to) {
  // Create the target folder if it doesn't exist
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  // Read the source directory
  const files = fs.readdirSync(from);

  // Process each file/folder
  files.forEach(file => {
    const sourceFile = path.join(from, file);
    const targetFile = path.join(to, file);
    
    // Get file stats
    const stats = fs.statSync(sourceFile);
    
    if (stats.isDirectory()) {
      // Recursively copy subdirectories
      copyFolderSync(sourceFile, targetFile);
    } else {
      // Copy the file
      fs.copyFileSync(sourceFile, targetFile);
    }
  });
}

// Build the Next.js application
console.log('Building Next.js application...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Copy public directory to standalone
console.log('Copying public directory to standalone...');
const publicSource = path.join(__dirname, 'public');
const publicTarget = path.join(__dirname, '.next/standalone/public');
try {
  copyFolderSync(publicSource, publicTarget);
  console.log(`Successfully copied public directory to ${publicTarget}`);
} catch (error) {
  console.error('Error copying public directory:', error);
}

// Copy static directory to standalone
console.log('Copying static directory to standalone...');
const staticSource = path.join(__dirname, '.next/static');
const staticTarget = path.join(__dirname, '.next/standalone/.next/static');
try {
  copyFolderSync(staticSource, staticTarget);
  console.log(`Successfully copied static directory to ${staticTarget}`);
} catch (error) {
  console.error('Error copying static directory:', error);
}

// Start the production server
console.log('Starting production server...');
try {
  execSync('node .next/standalone/server.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Server failed:', error);
  process.exit(1);
} 