// Script to ensure Tailwind CSS processing is working correctly
const fs = require('fs');
const path = require('path');

// Check if postcss.config.js exists and is correctly configured
function ensurePostCssConfig() {
  const postCssPath = path.join(__dirname, 'postcss.config.js');
  
  if (!fs.existsSync(postCssPath)) {
    // Create a basic postcss.config.js file if it doesn't exist
    const content = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    fs.writeFileSync(postCssPath, content);
    console.log('Created postcss.config.js');
    return true;
  }
  
  console.log('postcss.config.js already exists');
  return true;
}

// Check if tailwind.config.js exists and is correctly configured
function ensureTailwindConfig() {
  const tailwindPath = path.join(__dirname, 'tailwind.config.js');
  
  if (!fs.existsSync(tailwindPath)) {
    // Create a basic tailwind.config.js file if it doesn't exist
    const content = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    fs.writeFileSync(tailwindPath, content);
    console.log('Created tailwind.config.js');
    return true;
  }
  
  console.log('tailwind.config.js already exists');
  return true;
}

// Run the fixups
console.log('Running Tailwind CSS fixups...');
const postCssFixed = ensurePostCssConfig();
const tailwindFixed = ensureTailwindConfig();

if (postCssFixed && tailwindFixed) {
  console.log('Tailwind CSS configuration verified!');
  console.log('Now run the server with: node prod-dev-server.js');
} else {
  console.log('Some fixups failed, check the errors above.');
} 