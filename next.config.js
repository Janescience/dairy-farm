const withPWA = require('next-pwa')({
  dest: 'public'
})

// Set Thailand timezone
process.env.TZ = 'Asia/Bangkok'

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  webpack: (config) => {
    config.resolve.fallback = { fs: false }
    return config
  }
})

module.exports = nextConfig