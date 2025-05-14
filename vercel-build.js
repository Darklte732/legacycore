const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Vercel deployment build...');

// Ensure we're in the correct directory
const legacyCorePath = path.join(__dirname, 'legacy-core');
if (!fs.existsSync(legacyCorePath)) {
  console.error('❌ legacy-core directory not found!');
  process.exit(1);
}

// Change to the legacy-core directory
process.chdir(legacyCorePath);
console.log(`📁 Changed working directory to: ${process.cwd()}`);

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Build the application
console.log('🔨 Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Create needed directories
console.log('📁 Setting up output directories...');

// Copy public folder to the output directory
console.log('📂 Copying public directory...');
try {
  const publicSrc = path.join(legacyCorePath, 'public');
  const publicDest = path.join(legacyCorePath, '.next', 'standalone', 'public');
  
  if (!fs.existsSync(path.dirname(publicDest))) {
    fs.mkdirSync(path.dirname(publicDest), { recursive: true });
  }
  
  copyDirectory(publicSrc, publicDest);
  console.log('✅ Public directory copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy public directory:', error.message);
}

// Copy static assets to the output directory
console.log('📂 Copying static assets...');
try {
  const staticSrc = path.join(legacyCorePath, '.next', 'static');
  const staticDest = path.join(legacyCorePath, '.next', 'standalone', '.next', 'static');
  
  if (!fs.existsSync(path.dirname(staticDest))) {
    fs.mkdirSync(path.dirname(staticDest), { recursive: true });
  }
  
  if (fs.existsSync(staticSrc)) {
    copyDirectory(staticSrc, staticDest);
    console.log('✅ Static assets copied successfully!');
  } else {
    console.warn('⚠️ Static directory not found, skipping...');
  }
} catch (error) {
  console.error('❌ Failed to copy static assets:', error.message);
}

console.log('🎉 Vercel build completed!');

// Helper function to copy a directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
} 