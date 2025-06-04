/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['http2.mlstatic.com', 'images.olx.com.ar', 'scontent.fbue1-1.fna.fbcdn.net'],
    unoptimized: true,
  },
  experimental: {
    // serverComponentsExternalPackages ha sido movido a serverExternalPackages
  },
  serverExternalPackages: ['puppeteer', 'sqlite3'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      })
    }
    return config
  },
}

export default nextConfig
