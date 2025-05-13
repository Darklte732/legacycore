/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // Ignore linting errors during build to ensure deployment success
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build to ensure deployment success
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable SWC minification for better compatibility
  swcMinify: false,
  // Don't add X-Powered-By header
  poweredByHeader: false
}

module.exports = nextConfig