# LegacyCore Production Startup Guide

This guide helps you run the LegacyCore application in production mode locally without issues.

## Quick Start Commands

```powershell
# 1. Navigate to the correct nested project directory
cd C:\Users\Ronel\Downloads\New folder (5)\legacycore\legacy-core

# 2. Kill any existing processes on port 3000
npx kill-port 3000

# 3. Run the production script
.\start-production.bat
# OR alternative:
node run-production-local.js
```

## Detailed Steps

### 1. Verify working directory
   - Ensure you're in the correct nested project directory: 
     `cd C:\Users\Ronel\Downloads\New folder (5)\legacycore\legacy-core`
   - The application has a nested structure with the main application in the `legacy-core` subdirectory

### 2. Kill any existing processes
   - Clear port 3000: `npx kill-port 3000`
   - This ensures no conflicts with previous instances

### 3. Run the production script
   - For Windows: `.\start-production.bat`
   - Alternative: `node run-production-local.js`
   - These scripts handle the build process and start the server properly
   
### 4. Verify startup
   - Check console for successful build message
   - Confirm server is listening on port 3000
   - Access http://localhost:3000 in browser to verify the application is running
   
### 5. Troubleshooting
   - If you see path errors: Check server.js path in standalone directory
   - If assets don't load: Verify all static assets were copied correctly
   - If "module not found": Ensure script is running from the correct directory
   - If build errors: Check that all dependencies are installed with `npm install`

## Important Notes

- The application has a nested project structure (main app in `legacy-core` subdirectory)
- Always run production scripts from the inner `legacy-core` directory
- Path issues are common if running from the wrong directory
- The correct landing page has a fully interactive UI, not just a static emergency page 