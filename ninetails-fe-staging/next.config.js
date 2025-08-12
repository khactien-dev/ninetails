/** @type {import('next').NextConfig} */
// const { i18n } = require('./next-i18next.config.js');

const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  // i18n,
  experimental: {
    appDir: false,
    forceSwcTransforms: false,
  },
  images: {
    unoptimized: true,
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
};

module.exports = nextConfig;
