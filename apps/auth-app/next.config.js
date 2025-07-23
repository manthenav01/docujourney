/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docujourney/ui', '@docujourney/utils'],
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;