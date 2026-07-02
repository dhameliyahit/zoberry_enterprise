/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@phosphor-icons/react'],
};

module.exports = nextConfig;
