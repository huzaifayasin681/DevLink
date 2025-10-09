/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXTAUTH_URL?.replace('https://', '') || 'devlink.vercel.app']
        : ["localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Optimize for production
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Performance optimizations
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable bundle analyzer in development
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              if (!module.context) return 'npm.unknown';
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match || !match[1]) return 'npm.unknown';
              return `npm.${match[1].replace('@', '')}`;
            },
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;