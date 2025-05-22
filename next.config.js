/** @type {import('next').NextConfig} */
const path = require('path');
const { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } = require('fs');

function copyPublicFolder() {
  try {
    const source = path.join(__dirname, 'public');
    const dest = path.join(__dirname, '.next/standalone/public');
    
    // Skip if running in development
    if (process.env.NODE_ENV !== 'production') return;
    
    // Create destination if it doesn't exist
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    
    // Helper to copy files recursively
    function copyRecursive(src, dst) {
      // Check if source exists before attempting to read
      if (!existsSync(src)) {
        console.log(`Source directory does not exist: ${src}`);
        return;
      }
      
      // Get all files/directories in source
      const entries = readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);
        
        // Create directories as needed
        if (entry.isDirectory()) {
          if (!existsSync(dstPath)) {
            mkdirSync(dstPath, { recursive: true });
          }
          // Recursively copy subdirectories
          copyRecursive(srcPath, dstPath);
        } else {
          // Copy files
          copyFileSync(srcPath, dstPath);
        }
      }
    }
    
    // Copy the public folder
    copyRecursive(source, dest);
    console.log('Successfully copied public folder to standalone output');
    
    // Create alternate versions of the logo files (with and without hyphens)
    const logoMappings = [
      { source: 'aig logo.png', target: 'aig-logo.png' },
      { source: 'aig-logo.png', target: 'aig logo.png' },
      { source: 'americo logo.png', target: 'americo-logo.png' },
      { source: 'americo-logo.png', target: 'americo logo.png' },
      { source: 'gerber logo.png', target: 'gerber-logo.png' },
      { source: 'gerber-logo.png', target: 'gerber logo.png' },
      { source: 'aetna logo.png', target: 'aetna-logo.png' },

      { source: 'aetna-logo.png', target: 'aetna logo.png' },
      { source: 'legacy logo.png', target: 'legacy-logo.png' },
      { source: 'legacy-logo.png', target: 'legacy logo.png' },
      { source: 'logo.png', target: 'logo.png' }
    ];
    
    logoMappings.forEach(mapping => {
      const sourcePath = path.join(dest, 'images', mapping.source);
      const targetPath = path.join(dest, 'images', mapping.target);
      
      if (existsSync(sourcePath) && !existsSync(targetPath)) {
        try {
          copyFileSync(sourcePath, targetPath);
          console.log(`Created ${mapping.target} from ${mapping.source}`);
        } catch (err) {
          console.error(`Failed to create ${mapping.target}: ${err.message}`);
        }
      }
    });
  } catch (error) {
    console.error('Error copying public folder:', error);
  }
}

function copyStaticFolder() {
  try {
    const source = path.join(__dirname, '.next/static');
    const dest = path.join(__dirname, '.next/standalone/.next/static');
    
    // Skip if running in development
    if (process.env.NODE_ENV !== 'production') return;
    
    // Create destination if it doesn't exist
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    
    // Helper to copy files recursively
    function copyRecursive(src, dst) {
      // Check if source exists before attempting to read
      if (!existsSync(src)) {
        console.log(`Source directory does not exist: ${src}`);
        return;
      }
      
      // Get all files/directories in source
      const entries = readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);
        
        // Create directories as needed
        if (entry.isDirectory()) {
          if (!existsSync(dstPath)) {
            mkdirSync(dstPath, { recursive: true });
          }
          // Recursively copy subdirectories
          copyRecursive(srcPath, dstPath);
        } else {
          // Copy files
          copyFileSync(srcPath, dstPath);
        }
      }
    }
    
    // Copy the static folder
    copyRecursive(source, dest);
    console.log('Successfully copied static folder to standalone output');
  } catch (error) {
    console.error('Error copying static folder:', error);
  }
}

const nextConfig = {
  reactStrictMode: true,
  // Remove static export configuration for serverless builds
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  typescript: {
    // Dangerously allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Dangerously allow production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  // Ensure serverless functions are generated with serverless target
  output: 'standalone',
  // Use trailing slashes for more consistent URLs
  trailingSlash: false,
  // Disable static optimization for manager routes to prevent RSC errors
  experimental: {
    // Disable CSS optimization to avoid critters dependency issues
    optimizeCss: false,
    // Add important settings for handling server components
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Disable static optimization for the problematic routes
    disableOptimizedLoading: true
  },
  // Enable static image optimization
  images: {
    unoptimized: false,
    // Add domains if needed for remote images
    domains: ['localhost', 'legacycore.io', 'www.legacycore.io', 'vercel.app'],
    // Ensure images work in Vercel deployment
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Disable the compression to ensure middleware gets to see every request
  compress: false,
  // More explicit rewrites to handle RSC requests
  async rewrites() {
    return [
      // Handle RSC requests by stripping the _rsc parameters and returning the base content
      {
        source: '/manager/:path*/_rsc/:params*',
        destination: '/manager/:path*',
      },
      {
        source: '/:path*/_rsc/:params*',
        destination: '/:path*',
      },
      // Redirect all /agents requests to /manager/agents when used with RSC
      {
        source: '/agents',
        destination: '/manager/agents',
      },
      // Redirect all /carriers requests to /manager/carriers when used with RSC
      {
        source: '/carriers',
        destination: '/manager/carriers',
      },
      // Handle other potential problem paths
      {
        source: '/manager/agents/_rsc/:params*',
        destination: '/manager/agents',
      },
      {
        source: '/manager/carriers/_rsc/:params*',
        destination: '/manager/carriers',
      },
      {
        source: '/manager/applications/_rsc/:params*',
        destination: '/manager/applications',
      },
      {
        source: '/manager/analytics/_rsc/:params*',
        destination: '/manager/analytics',
      },
      {
        source: '/manager/settings/_rsc/:params*',
        destination: '/manager/settings',
      }
    ]
  },
  // Hook into the build process to copy static assets for standalone mode
  webpack: (config, { isServer, dev }) => {
    // Only run during production build on the server
    if (isServer && !dev) {
      // Register a callback to be executed after webpack compilation
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tapPromise('CopyPublicAndStaticFolders', async () => {
            // Copy public folder to standalone output
            copyPublicFolder();
            
            // Ensure static folder exists
            const staticPath = path.join(__dirname, '.next/static');
            if (!existsSync(staticPath)) {
              console.log(`Creating missing static folder: ${staticPath}`);
              mkdirSync(staticPath, { recursive: true });
            }
            
            // Copy static folder to standalone output
            copyStaticFolder();
            return Promise.resolve();
          });
        },
      });
    }
    return config;
  },
}

module.exports = nextConfig
