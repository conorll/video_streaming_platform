/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["storage.googleapis.com", "lh3.googleusercontent.com"],
  },

  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
