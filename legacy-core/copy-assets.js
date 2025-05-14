const fs = require('fs');
const path = require('path');

// Ensure necessary directories exist
const sourceDir = path.join(__dirname, 'src', 'app', 'manager', 'script-assistant');
const targetDir = path.join(__dirname, '.next', 'standalone', 'src', 'app', 'manager', 'script-assistant');

// Create target directory if it doesn't exist
function ensureDirectoryExists(directory) {
  const parts = directory.split(path.sep);
  let currentPath = '';
  
  for (const part of parts) {
    currentPath = path.join(currentPath, part);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  }
}

// Copy fix-script-display.js to standalone directory
function copyScriptFix() {
  console.log('Copying fix-script-display.js to standalone directory...');
  
  const sourceFile = path.join(sourceDir, 'fix-script-display.js');
  const targetFile = path.join(targetDir, 'fix-script-display.js');
  
  if (fs.existsSync(sourceFile)) {
    ensureDirectoryExists(targetDir);
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`Copied ${sourceFile} to ${targetFile}`);
  } else {
    console.error(`Source file ${sourceFile} not found`);
  }
}

// Copy server.js to standalone directory if needed
function copyServerJs() {
  console.log('Ensuring server.js is in standalone directory...');
  
  const sourceFile = path.join(__dirname, 'server.js');
  const targetFile = path.join(__dirname, '.next', 'standalone', 'server.js');
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`Copied ${sourceFile} to ${targetFile}`);
  } else {
    console.error(`Source file ${sourceFile} not found`);
  }
}

// Execute copy operations
copyScriptFix();
copyServerJs();

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