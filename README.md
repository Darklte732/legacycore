# LegacyCore

This repository contains the Next.js application for LegacyCore.

## Running in Production Mode Locally

There are multiple ways to run the application in production mode locally:

### Method 1: Using the Batch File (Windows)

1. Run the batch file:
   ```
   run-production-local.bat
   ```

This will:
- Build the application with `npm run build`
- Copy necessary static assets
- Start the server in production mode

### Method 2: Using run-fixed-production.js

This enhanced server includes proper static asset serving:

1. Build the application:
   ```
   npm run build
   ```

2. Run the enhanced server:
   ```
   node run-fixed-production.js
   ```

### Method 3: Using Node.js Standalone Server

1. Build the application:
   ```
   npm run build
   ```

2. Copy static assets to the standalone directory:
   ```
   xcopy "public" ".next\standalone\public" /E /I /Y
   ```

3. Start the standalone server:
   ```
   node .next/standalone/server.js
   ```

## Deploying to Vercel via GitHub

### Step 1: Prepare for GitHub

1. Install Git LFS if not already installed:
   ```bash
   git lfs install
   ```

2. Create a new GitHub repository
   - Go to [GitHub](https://github.com) and log in
   - Click "New" to create a new repository
   - Name it "legacycore" or your preferred name
   - Keep it private if it contains sensitive information

3. Add your GitHub repository as a remote:
   ```bash
   git remote add origin https://github.com/yourusername/legacycore.git
   ```

4. Push your code to GitHub:
   ```bash
   git checkout -b main
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and log in (or sign up)

2. Click "Add New..." → "Project"

3. Import your GitHub repository:
   - Find your repository in the list
   - Click "Import"

4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./ (default)
   - Build Command: npm run build
   - Output Directory: .next

5. Add environment variables:
   - Click "Environment Variables"
   - Add all variables from your .env file, including:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_URL
     - SUPABASE_ANON_KEY
     - COOKIE_NAME
     - COOKIE_MAX_AGE

6. Click "Deploy"

7. Once deployment is complete, Vercel will provide you with a URL to access your application

### Troubleshooting Deployment Issues

If your deployment fails, check the following:

1. **Large Files**: Make sure Git LFS is properly set up for files over 100MB
   ```bash
   git lfs track "*.pack" "*.wasm" "*.node"
   git add .gitattributes
   git push
   ```

2. **Missing Dependencies**: Ensure all dependencies are in package.json

3. **Build Errors**: Check the Vercel build logs for specific errors

4. **Minimal Deployment**: If the full application won't deploy, try a minimal deployment:
   ```bash
   node minimal-next-deploy.js
   ```

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Development Mode

To run in development mode:

```
npm run dev
```

## Notes

- Production mode builds and runs with optimizations
- If you encounter missing styles or images, verify the static asset paths
- The enhanced server (Method 2) provides better static file handling

## Features

- User authentication with role-based access
- Dashboard for agents and managers
- Application management
- AI-powered chat assistance
- Calendar and scheduling
- Commission tracking

## Project Structure

This project follows a specific structure for Vercel deployment:

- The main Next.js application is located in the `legacy-core` directory
- The root directory contains configuration files for Vercel deployment

## Development

To develop the application locally:

## Deployment Instructions

### Running in Production Mode

To build and run the application in production mode locally:

```bash
# Windows
run-production-local.bat

# Manual steps
node install-dependencies.js
node run-production-local.js
```

### Fixing Image Asset Issues

If you encounter 404 errors for image files, use:

```bash
# Windows
fix-image-assets.bat

# Manual steps
node install-dependencies.js
node fix-image-assets.js
```

Then restart your server:
```bash
node .next/standalone/server.js
```

### Deploying to Vercel

To build and deploy to Vercel with all assets correctly handled:

```bash
# Windows
deploy-to-vercel-with-image-fix.bat

# Manual steps
node install-dependencies.js
npx next build
node fix-image-assets.js
vercel --prod
```

For detailed instructions, see [BUILD-AND-DEPLOY-INSTRUCTIONS.md](BUILD-AND-DEPLOY-INSTRUCTIONS.md).