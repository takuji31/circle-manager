/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    runtime: 'nodejs',
  },
  swcMinify: true,
};

module.exports = nextConfig;
