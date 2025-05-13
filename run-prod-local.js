#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Detect platform (Windows or non-Windows)
const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

// Ensure production mode
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

console.log('🚀 Starting LegacyCore in production mode');

// Run the next start command
const server = spawn(npxCmd, ['next', 'start'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max_old_space_size=4096'
  }
});

console.log('💻 Server running at http://localhost:3000');

// Handle server termination
server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down server...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down server...');
  server.kill();
  process.exit(0);
}); 