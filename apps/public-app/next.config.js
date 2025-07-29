/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docujourney/ui', '@docujourney/utils'],
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;