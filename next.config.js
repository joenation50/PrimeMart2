/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    // This forces all server components/actions to use the Edge runtime
    runtime: 'edge', 
  },
};

module.exports = nextConfig;