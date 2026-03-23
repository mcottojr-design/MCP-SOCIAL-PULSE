/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' is for self-hosted Docker deployments.
  // Vercel manages its own output — do not set this here.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.fbcdn.net' },        // Meta/Facebook CDN
      { protocol: 'https', hostname: '*.cdninstagram.com' }, // Instagram CDN
      { protocol: 'https', hostname: 'yt3.ggpht.com' },      // YouTube channel avatars
      { protocol: 'https', hostname: 'i.ytimg.com' },        // YouTube thumbnails
    ],
  },
};

export default nextConfig;
