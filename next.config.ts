import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // better-sqlite3 is a native module, only use on server
      config.externals = config.externals || [];
      config.externals.push('better-sqlite3');
    }
    return config;
  },
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
