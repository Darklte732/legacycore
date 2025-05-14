const fs = require('fs');
const path = require('path');

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

console.log('Starting to copy public directory to standalone...');

// Define source and destination paths
const sourceDirPublic = path.join(__dirname, 'public');
const targetDirPublic = path.join(__dirname, '.next/standalone/public');

try {
  // Copy the public directory
  copyFolderSync(sourceDirPublic, targetDirPublic);
  console.log(`Successfully copied public directory from ${sourceDirPublic} to ${targetDirPublic}`);
} catch (error) {
  console.error('Error copying public directory:', error);
} 