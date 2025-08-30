/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@docujourney/ui', '@docujourney/utils'],
  
  // Enhanced performance and SEO configuration
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Force static generation for better indexing
  output: 'standalone',
  
  // Enable experimental features for better SEO
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // Image optimization for better Core Web Vitals
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ESLint configuration for production builds
  eslint: {
    // Disable ESLint during builds for production deployment
    ignoreDuringBuilds: true,
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
      // Static pages - crawl-friendly caching
      {
        source: '/h1b-dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
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