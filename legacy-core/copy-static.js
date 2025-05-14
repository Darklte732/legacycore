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

console.log('Starting to copy static directory to standalone...');

// Define source and destination paths
const sourceDirStatic = path.join(__dirname, '.next/static');
const targetDirStatic = path.join(__dirname, '.next/standalone/.next/static');

try {
  // Copy the static directory
  copyFolderSync(sourceDirStatic, targetDirStatic);
  console.log(`Successfully copied static directory from ${sourceDirStatic} to ${targetDirStatic}`);
} catch (error) {
  console.error('Error copying static directory:', error);
} 