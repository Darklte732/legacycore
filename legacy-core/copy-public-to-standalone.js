const fs = require('fs');
const path = require('path');

console.log('Copying public assets to standalone directory...');

// Function to ensure directory exists
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

// Copy all files from public to standalone/public
function copyPublicDirectory() {
  const sourceDir = path.join(__dirname, 'public');
  const targetDir = path.join(__dirname, '.next', 'standalone', 'public');
  
  ensureDirectoryExists(targetDir);
  
  // Copy all files 
  copyFiles(sourceDir, targetDir);
  
  console.log('Public directory copied successfully');
}

// Create alternate versions of image files (with and without hyphens)
function createAlternateVersions() {
  const targetDir = path.join(__dirname, '.next', 'standalone', 'public');
  
  // Create both hyphenated and space versions of logo files
  const logoMappings = [
    { source: 'aig logo.png', target: 'aig-logo.png' },
    { source: 'aig-logo.png', target: 'aig logo.png' },
    { source: 'americo logo.png', target: 'americo-logo.png' },
    { source: 'americo-logo.png', target: 'americo logo.png' },
    { source: 'gerber logo.png', target: 'gerber-logo.png' },
    { source: 'gerber-logo.png', target: 'gerber logo.png' },
    { source: 'aetna logo.png', target: 'aetna-logo.png' },
    { source: 'aetna-logo.png', target: 'aetna logo.png' }
  ];
  
  console.log('Creating alternate versions of image files...');
  
  logoMappings.forEach(mapping => {
    const sourcePath = path.join(targetDir, mapping.source);
    const targetPath = path.join(targetDir, mapping.target);
    
    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`  Created ${mapping.target} from ${mapping.source}`);
      } catch (err) {
        console.error(`  Failed to create ${mapping.target}: ${err.message}`);
      }
    }
  });
  
  // Ensure video thumbnail exists
  const thumbnailPath = path.join(targetDir, 'video-thumbnail.jpg');
  if (!fs.existsSync(thumbnailPath)) {
    // Create a 1x1 pixel placeholder image if the thumbnail doesn't exist
    console.log('Creating placeholder video-thumbnail.jpg');
    const placeholderData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 
      0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 0xff, 0xd9
    ]);
    fs.writeFileSync(thumbnailPath, placeholderData);
  }
}

// Recursive function to copy files
function copyFiles(source, target) {
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      ensureDirectoryExists(targetPath);
      copyFiles(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`  Copied ${sourcePath} to ${targetPath}`);
    }
  });
}

// Execute
copyPublicDirectory();
createAlternateVersions();

console.log('Copy completed.'); 