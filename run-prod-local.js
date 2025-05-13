const { execSync } = require('child_process');

console.log('=== LEGACYCORE PRODUCTION MODE (LOCAL) ===');

// Step 1: Build the application
console.log('\n1. Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

// Step 2: Start the production server
console.log('\n2. Starting production server...');
console.log('Serving at: http://localhost:3000');
console.log('===================================================');

try {
  // The execSync will block, keeping the process in foreground
  execSync('npm run start', { stdio: 'inherit' });
} catch (error) {
  console.error('Server error:', error.message);
  process.exit(1);
} 