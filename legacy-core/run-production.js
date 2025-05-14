#!/usr/bin/env node

/**
 * LegacyCore Production Runner
 * This script builds the Next.js app, copies all necessary assets, and runs the production server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m'
};

// Function to copy a directory recursively
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

// Function to create alternate versions of logo files (with and without hyphens)
function createAlternateVersions(publicDir) {
  console.log(`${colors.yellow}Creating alternate versions of image files...${colors.reset}`);
  
  // Define logo mappings (both hyphenated and space versions)
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
  
  // Create each alternate version
  logoMappings.forEach(mapping => {
    const sourcePath = path.join(publicDir, mapping.source);
    const targetPath = path.join(publicDir, mapping.target);
    
    if (fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`  ${colors.gray}Created ${mapping.target} from ${mapping.source}${colors.reset}`);
      } catch (err) {
        console.error(`  ${colors.red}Failed to create ${mapping.target}: ${err.message}${colors.reset}`);
      }
    }
  });
}

// Function to verify critical directories exist
function verifyCriticalPaths(baseDir) {
  console.log(`${colors.yellow}Verifying critical directories...${colors.reset}`);
  
  const criticalPaths = [
    '.next/standalone/public',
    '.next/standalone/.next/static',
    '.next/standalone/.next/static/css',
    '.next/standalone/.next/static/chunks'
  ];
  
  let allPathsExist = true;
  
  criticalPaths.forEach(criticalPath => {
    const fullPath = path.join(baseDir, criticalPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`${colors.red}ERROR: Critical path ${criticalPath} does not exist!${colors.reset}`);
      allPathsExist = false;
    } else {
      console.log(`  ${colors.gray}Verified ${criticalPath}${colors.reset}`);
    }
  });
  
  return allPathsExist;
}

// Main function
async function main() {
  try {
    // Build the Next.js application
    console.log(`${colors.green}Building Next.js application...${colors.reset}`);
    execSync('npx next build', { stdio: 'inherit' });
    console.log(`${colors.green}Build completed successfully${colors.reset}`);
    
    // Copy public directory to standalone
    const publicSource = path.join(__dirname, 'public');
    const publicTarget = path.join(__dirname, '.next/standalone/public');
    console.log(`${colors.yellow}Copying public directory to standalone...${colors.reset}`);
    copyFolderSync(publicSource, publicTarget);
    console.log(`${colors.green}Successfully copied public directory to ${publicTarget}${colors.reset}`);
    
    // Create alternate versions of logo files
    createAlternateVersions(publicTarget);
    console.log(`${colors.green}Alternate versions created successfully${colors.reset}`);
    
    // Copy static directory to standalone/.next/static
    const staticSource = path.join(__dirname, '.next/static');
    const staticTarget = path.join(__dirname, '.next/standalone/.next/static');
    console.log(`${colors.yellow}Copying static directory to standalone...${colors.reset}`);
    copyFolderSync(staticSource, staticTarget);
    console.log(`${colors.green}Successfully copied static directory to ${staticTarget}${colors.reset}`);
    
    // Verify that critical directories exist
    const allPathsExist = verifyCriticalPaths(__dirname);
    if (!allPathsExist) {
      console.error(`${colors.red}Asset verification failed. Please check the paths above.${colors.reset}`);
      process.exit(1);
    }
    
    // Start the production server
    console.log(`${colors.green}Starting production server...${colors.reset}`);
    const serverJsPath = path.join(__dirname, '.next/standalone/server.js');
    execSync(`node ${serverJsPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main(); 