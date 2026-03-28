/** @type {import('next').NextConfig} */

// Bundle Analyzer - uncomment when @next/bundle-analyzer is installed
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

const nextConfig = {
  // --- EXISTING CONFIG PRESERVED ---
  images: {
    domains: ['localhost'],
    // --- IMAGE OPTIMIZATION ---
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,  // 30 days
    dangerouslyAllowSVG: false,
  },

  // --- COMPRESSION ---
  compress: true,

  // --- POWER PACK HEADERS ---
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          { 
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable' 
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { 
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable' 
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },

  // --- WEBPACK BUNDLE SPLITTING ---
  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Separate heavy vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1]
              return `npm.${packageName?.replace('@', '')}` 
            },
            chunks: 'all',
            priority: -10,
          },
          // Common components chunk
          commons: {
            name: 'commons',
            minChunks: 2,
            chunks: 'all',
            priority: -20,
          },
        },
      }
    }
    return config
  },

  // --- EXPERIMENTAL (Next.js 14 compatible) ---
  experimental: {
    // CSS optimization - inlines critical CSS
    optimizeCss: true,
    // Optimize package imports for heavy libraries
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@stellar/stellar-sdk',
    ],
  },
}

// Export config with optional bundle analyzer wrapper
// module.exports = withBundleAnalyzer(nextConfig)
module.exports = nextConfig
