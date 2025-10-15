/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 支持本地包
  transpilePackages: ['@ebin-player/react', 'ebin-player'],
}

module.exports = nextConfig
