
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, 
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      { // Adicionado para permitir imagens do Firebase Storage
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', 
      }
    ],
  },
  experimental: {
    optimizeCss: true, // Adicionada otimização de CSS
  },
};

export default nextConfig;
