import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: 
  {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  allowedDevOrigins: ['10.33.21.171', 'localhost'],
};

export default nextConfig;
