const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}
┌───────────────────────────────────────────────┐
│                                               │
│   LEGACYCORE PURE NODE.JS EMERGENCY MODE      │
│                                               │
└───────────────────────────────────────────────┘
${colors.reset}`);

// Create a minimal landing page
const landingPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LegacyCore Insurance Platform</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 flex flex-col items-center justify-center text-white p-4">
  <div class="text-center max-w-3xl">
    <div class="mb-6 flex items-center justify-center">
      <div class="bg-blue-700 p-4 rounded-xl shadow-lg w-20 h-20 flex items-center justify-center text-3xl font-bold">LC</div>
    </div>
    <h1 class="text-4xl font-bold mb-4">Welcome to LegacyCore</h1>
    <p class="text-xl mb-8 text-blue-200">Your comprehensive insurance management platform</p>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <a href="#agent" class="block">
        <div class="bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg p-6 shadow-lg text-center">
          <h2 class="text-xl font-semibold mb-2">Agent Portal</h2>
          <p class="text-sm text-blue-200">Manage your clients and policies</p>
        </div>
      </a>
      
      <a href="#manager" class="block">
        <div class="bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg p-6 shadow-lg text-center">
          <h2 class="text-xl font-semibold mb-2">Manager Portal</h2>
          <p class="text-sm text-indigo-200">Oversee your team and analytics</p>
        </div>
      </a>
      
      <a href="#admin" class="block">
        <div class="bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg p-6 shadow-lg text-center">
          <h2 class="text-xl font-semibold mb-2">Admin Portal</h2>
          <p class="text-sm text-purple-200">Complete system administration</p>
        </div>
      </a>
    </div>
    
    <div class="mt-8 p-6 bg-blue-800 bg-opacity-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">System Status</h3>
      <p class="text-blue-200">
        LegacyCore is currently running in <strong>Emergency Recovery Mode</strong>. <br>
        The application is being restored to full functionality.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Set headers
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Send the landing page for all routes
  res.end(landingPage);
});

// Start the server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n${colors.green}✅ Emergency server is running at:${colors.reset} http://localhost:${PORT}`);
  console.log(`${colors.blue}ℹ️ All routes will show the emergency landing page${colors.reset}`);
  console.log(`\n${colors.cyan}Press Ctrl+C to stop the server${colors.reset}`);
}); 