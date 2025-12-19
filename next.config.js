/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/resume-builder',
  assetPrefix: '/resume-builder/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

module.exports = nextConfig;
