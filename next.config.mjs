/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/exhibition-app' : '',
  images: {
    unoptimized: true,
  }
}

export default nextConfig
