const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization with WebP and AVIF support
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000, // 128KB
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@stellar/stellar-sdk',
    ],
  },

  // Advanced bundle optimization
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            enforce: true,
            priority: 40,
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
          },
          lib: {
            name: 'lib',
            chunks: 'all',
            enforce: true,
            priority: 30,
            test: /[\\/]node_modules[\\/](@next|next)[\\/]/,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            enforce: true,
            priority: 20,
          },
          // Heavy vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1]
              return `npm.${packageName?.replace('@', '')}` 
            },
            chunks: 'all',
            priority: 10,
          },
          // Shared UI components
          shared: {
            name: 'shared',
            chunks: 'all',
            enforce: true,
            priority: 5,
            test: /[\\/]node_modules[\\/](lucide-react|recharts|framer-motion)[\\/]/,
          },
        },
      };

      // Tree shaking optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Reduce memory usage
    config.optimization.minimize = !dev;
    
    return config;
  },

  // Headers for caching and security
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
    ];
  },

  // Redirects for performance
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
