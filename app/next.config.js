/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/demo': ['./templates/**/*'],
    },
  },
};

module.exports = nextConfig;
