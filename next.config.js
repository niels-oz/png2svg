/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Bundle optimization
  experimental: {
    optimizeCss: true,
  },
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          common: {
            minChunks: 2,
            chunks: 'all',
            priority: 5
          }
        }
      }
    }
    
    return config
  }
}

module.exports = nextConfig