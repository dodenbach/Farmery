/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors during build
  },
  swcMinify: true,
}

module.exports = nextConfig
