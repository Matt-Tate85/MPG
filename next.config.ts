import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module, keep it server-side only
  serverExternalPackages: ['better-sqlite3'],
  // Allow images from OpenStreetMap tile servers
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tile.openstreetmap.org',
      },
    ],
  },
};

export default nextConfig;
