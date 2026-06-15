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
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/demo.html',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
