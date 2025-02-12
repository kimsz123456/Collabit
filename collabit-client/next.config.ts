import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    TZ: "Asia/Seoul",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // 다른 이미지 도메인들이 필요한 경우 여기에 추가
    ],

    domains: ["example.com"], // 허용할 도메인 추가
  },
  /* config options here */
};

export default nextConfig;
