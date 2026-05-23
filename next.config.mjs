/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['cloudinary'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
