import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    serverExternalPackages: ["some-package"],  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
