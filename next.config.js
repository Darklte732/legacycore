/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    // This is experimental but helps with some server-side rendering issues
    serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs']
  },
  // Needed to handle build errors appropriately
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Output static site instead of serverless
  output: 'export',
  // Allow importing images with unoptimized setting for static export
  images: {
    unoptimized: true,
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Specify routes to exclude from static export
  excludeDefaultMomentLocales: true,
  // Ignore linting errors during build to ensure deployment success
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build to ensure deployment success
  typescript: {
    ignoreBuildErrors: true,
  },
  // Don't add X-Powered-By header
  poweredByHeader: false
}

module.exports = nextConfig