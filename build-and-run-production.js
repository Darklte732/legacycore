const fs = require('fs-extra');
const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Whether to continue even if build has errors
const IGNORE_BUILD_ERRORS = true;

// Detect platform (Windows or non-Windows)
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.log('🔧 Starting build process');

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📝 Running command: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      shell: true,
      stdio: 'inherit',
      ...options
    });
    
    child.on('close', (code) => {
      if (code !== 0 && !IGNORE_BUILD_ERRORS) {
        reject(new Error(`Command failed with code ${code}`));
      } else if (code !== 0) {
        console.warn(`⚠️ Command exited with code ${code}, but continuing due to IGNORE_BUILD_ERRORS=true`);
        resolve();
      } else {
        resolve();
      }
    });
  });
}

async function buildAndRun() {
  try {
    // Clear the .next directory
    console.log('🧹 Cleaning Next.js cache');
    await fs.remove(path.join(__dirname, '.next'));
    
    // Install dependencies if node_modules doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      console.log('📦 Installing dependencies');
      await runCommand(npmCmd, ['install']);
    }
    
    // Set environment for building
    process.env.NODE_ENV = 'production';
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    process.env.NODE_OPTIONS = '--max_old_space_size=4096';
    
    // Build the application
    console.log('🏗️ Building application');
    await runCommand(npxCmd, ['next', 'build'], {
      env: {
        ...process.env,
        NODE_OPTIONS: '--max_old_space_size=4096',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    });
    
    // Start the application
    console.log('🚀 Starting production server');
    await runCommand(npxCmd, ['next', 'start']);
  } catch (error) {
    console.error('❌ Build process failed:', error);
    process.exit(1);
  }
}

buildAndRun(); 