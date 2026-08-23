import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sodfujxpthupbkmkibzm.supabase.co",
        pathname: "/storage/v1/object/sign/entry-photos/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
