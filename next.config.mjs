/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Diese Optionen sind wichtig für GitHub Pages
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
