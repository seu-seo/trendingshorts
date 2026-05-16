/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages compatible static export.
  // Uncomment basePath/assetPrefix when deploying under a sub-path
  // (e.g. https://username.github.io/repo-name/).
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // basePath: '/your-repo-name',
  // assetPrefix: '/your-repo-name/',
};

module.exports = nextConfig;
