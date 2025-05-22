const fs = require('fs');
const path = require('path');

console.log('Copying essential JS chunks to standalone directory...');

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

// Copy chunks for specific pages that need them
function copyPageChunks() {
  // Key page paths to ensure their chunks are copied
  const pagePaths = [
    'manager/script-assistant',
    'agent/script-assistant',
    'static/chunks'
  ];
  
  pagePaths.forEach(pagePath => {
    const sourceDir = path.join(__dirname, '.next', 'static', 'chunks', pagePath);
    const targetDir = path.join(__dirname, '.next', 'standalone', '.next', 'static', 'chunks', pagePath);
    
    if (fs.existsSync(sourceDir)) {
      ensureDirectoryExists(targetDir);
      copyDirectoryContents(sourceDir, targetDir);
      console.log(\Copied chunks for \\);
    } else {
      console.log(\Source chunks directory not found for \\);
    }
  });
}

// Copy critical shared chunks
function copyCriticalSharedChunks() {
  const sourceStaticDir = path.join(__dirname, '.next', 'static');
  const targetStaticDir = path.join(__dirname, '.next', 'standalone', '.next', 'static');
  
  ensureDirectoryExists(targetStaticDir);
  
  // Copy specific files from static/chunks directory
  const chunksDir = path.join(sourceStaticDir, 'chunks');
  const targetChunksDir = path.join(targetStaticDir, 'chunks');
  
  ensureDirectoryExists(targetChunksDir);
  
  if (fs.existsSync(chunksDir)) {
    const entries = fs.readdirSync(chunksDir);
    
    // Copy only .js files in the root chunks directory
    entries.forEach(entry => {
      const sourcePath = path.join(chunksDir, entry);
      const targetPath = path.join(targetChunksDir, entry);
      
      if (fs.statSync(sourcePath).isFile() && entry.endsWith('.js')) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(\Copied shared chunk: \\);
      }
    });
  }
  
  // Copy CSS files if they exist
  const cssDir = path.join(sourceStaticDir, 'css');
  const targetCssDir = path.join(targetStaticDir, 'css');
  
  if (fs.existsSync(cssDir)) {
    ensureDirectoryExists(targetCssDir);
    copyDirectoryContents(cssDir, targetCssDir);
    console.log('Copied CSS files');
  }
}

// Helper function to copy directory contents
function copyDirectoryContents(source, target) {
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      ensureDirectoryExists(targetPath);
      copyDirectoryContents(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Execute
copyPageChunks();
copyCriticalSharedChunks();

console.log('Chunk copying completed.');
