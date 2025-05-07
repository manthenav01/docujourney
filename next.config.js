module.exports = {
  // Allow Firebase Auth popups to close by loosening cross-origin opener policy
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
        ],
      },
    ];
  },
  reactStrictMode: true,
  swcMinify: true,
};