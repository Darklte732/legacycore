const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting LegacyCore production build and server...');

// Helper function to handle spawned processes
function spawnProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Running: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    childProcess.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    childProcess.on('error', err => {
      reject(err);
    });
  });
}

// Ensure standalone directory exists
const nextStandalonePath = path.join(__dirname, '.next/standalone');
if (!fs.existsSync(nextStandalonePath)) {
  console.log('Creating .next/standalone directory...');
  fs.mkdirSync(nextStandalonePath, { recursive: true });
}

// First step: Build the application
console.log('📦 Step 1: Building application...');
spawnProcess('npm', ['run', 'build'])
  .then(() => {
    console.log('\n✅ Build completed successfully!');
    console.log('📝 Verifying build outputs...');
    
    // Check if the standalone directory exists after build
    const hasStandalone = fs.existsSync(nextStandalonePath);
    
    if (hasStandalone) {
      console.log('✅ Standalone build detected.');
      
      // Start the server from the standalone build
      console.log('\n🚀 Step 2: Starting production server from standalone build...');
      return spawnProcess('node', ['.next/standalone/server.js']);
    } else {
      console.log('⚠️ No standalone build detected, starting with Next.js start...');
      
      // Fallback to regular Next.js start
      console.log('\n🚀 Step 2: Starting production server with next start...');
      return spawnProcess('npm', ['run', 'start']);
    }
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message || 'Unknown error occurred');
  process.exit(1);
  }); 