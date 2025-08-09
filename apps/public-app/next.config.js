/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docujourney/ui', '@docujourney/utils'],
  
  // Enhanced performance and SEO configuration
  compress: true,
  poweredByHeader: false,
  
  // Image optimization for better Core Web Vitals
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // SEO-friendly redirects and rewrites
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/h1b-dashboard',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/h1b-salary-data/:path*',
        destination: '/h1b-dashboard/:path*',
      },
    ];
  },

  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          // Enhanced caching for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Specific caching for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;