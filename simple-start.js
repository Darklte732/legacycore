const { execSync } = require('child_process');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.cyan}
┌───────────────────────────────────────────────┐
│                                               │
│       LEGACYCORE SIMPLIFIED PRODUCTION        │
│                                               │
└───────────────────────────────────────────────┘
${colors.reset}`);

// Kill any running process on port 3000
try {
  console.log(`${colors.yellow}Checking for processes on port 3000...${colors.reset}`);
  execSync('npx kill-port 3000', { stdio: 'ignore' });
  console.log(`${colors.green}Port 3000 cleared${colors.reset}`);
} catch (e) {
  // Ignore errors if no process is running
}

// Step 1: Build the site in static export mode
console.log(`\n${colors.blue}Step 1: Building the application...${colors.reset}`);
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`\n${colors.green}Build completed successfully!${colors.reset}`);
} catch (error) {
  console.error(`\n${colors.red}Build failed:${colors.reset}`, error.message);
  process.exit(1);
}

// Step 2: Start a simple Express server to serve the static files
console.log(`\n${colors.blue}Step 2: Starting static file server...${colors.reset}`);

const app = express();
const PORT = 3000;

// Serve static files from the 'out' directory (static export output)
app.use(express.static(path.join(__dirname, 'out')));

// For client-side routing, always return index.html for any unknown paths
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n${colors.green}Server is running at:${colors.reset} http://localhost:${PORT}`);
  console.log(`\n${colors.cyan}Press Ctrl+C to stop the server${colors.reset}`);
}); 