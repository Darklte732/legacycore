# LegacyCore Project

This is the main repository for the LegacyCore project. This README contains important information about the project structure and deployment process.

## Project Structure

This project has a nested structure:

- Root directory: Contains configuration files for deployment
- `legacy-core/`: Contains the actual Next.js application codebase

## Vercel Deployment

This project is configured for deployment on Vercel. The main configuration is in the `vercel.json` file which tells Vercel to build from the nested `legacy-core` directory.

### Environment Variables

For deployment to work correctly, you must configure these environment variables in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Deployment Steps

#### Via GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the project

#### Via Vercel CLI

For manual deployment:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from the project root)
vercel

# For production deployment
vercel --prod
```

## Local Development

For local development, navigate to the legacy-core directory:

```bash
cd legacy-core

# Install dependencies
npm install

# Start development server
npm run dev
```

## Running in Production Mode Locally

To run the production build locally:

```bash
cd legacy-core
npm install
npm run build
npm run start
```

## Architecture

- **Framework**: Next.js with both App Router and Pages Router
- **Language**: TypeScript/JavaScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase for database and authentication
- **Deployment**: Vercel

For more details about the architecture, see the `LegacyCore-Architecture.md` file.

## Troubleshooting Deployment

If you encounter issues with deployment:

1. Check that the `vercel.json` file is correctly configured
2. Verify all environment variables are set in the Vercel dashboard
3. Review the Vercel build logs for specific errors
4. Ensure the `next.config.js` file in the `legacy-core` directory is properly configured