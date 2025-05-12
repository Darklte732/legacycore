/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Disable server components since we're exporting statically
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize build output
  swcMinify: true,
  // Optimize static imports
  poweredByHeader: false,
  // Improve build performance
  webpack: (config) => {
    // Disable source maps in production
    if (!process.env.NODE_ENV !== 'development') {
      config.devtool = false;
    }
    return config;
  }
}

module.exports = nextConfig