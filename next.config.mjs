/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@distube/ytdl-core', 'ffmpeg-static'],
  },
  transpilePackages: ['antd', '@ant-design', 'rc-util', 'rc-pagination', 'rc-picker'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
