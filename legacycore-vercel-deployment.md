# LegacyCore Vercel Deployment Guide

This guide walks through the process of deploying the LegacyCore application to Vercel, taking into account its nested project structure.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/cli) installed: `npm i -g vercel`
- Git repository with your LegacyCore code

## Deployment Steps

### 1. Configure the correct project structure

Since LegacyCore has a nested structure with the main application in the `legacy-core` subdirectory, you need to tell Vercel where the actual project is located.

Create a `vercel.json` file in the root directory:

```json
{
  "outputDirectory": "legacy-core",
  "installCommand": "cd legacy-core && npm install",
  "buildCommand": "cd legacy-core && npm run build",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "NODE_ENV": "production"
  }
}
```

### 2. Set up environment variables in Vercel

1. Navigate to your Vercel dashboard
2. Go to your project settings
3. Under "Environment Variables" add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - Any other environment variables from your `.env.local` file

### 3. Deploy using Vercel CLI

From your project root directory:

```bash
# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# For production deployment
vercel --prod
```

### 4. Alternative: Deploy via Git integration

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. In Vercel dashboard, click "New Project"
3. Import your repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `legacy-core`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables from Step 2
6. Deploy

## Troubleshooting

### Path issues
- If you encounter path-related errors, verify the `outputDirectory` in your `vercel.json` is correct

### Build failures
- Check Vercel logs for specific error messages
- Verify that your application builds locally with `npm run build` from the `legacy-core` directory

### API routes not working
- Ensure your serverless functions are correctly set up in the `legacy-core/pages/api` directory
- Check that necessary environment variables are set

### Static assets missing
- Verify that your static assets are correctly placed in the `legacy-core/public` directory

## Updating your deployment

- For deployments via Git, simply push changes to your repository
- For manual deployments, run `vercel --prod` again from your root directory

## Vercel-specific optimizations

- Enable Vercel Analytics for performance monitoring
- Configure the `legacy-core/next.config.js` file to work well with Vercel:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp']
  }
}

module.exports = nextConfig
``` 