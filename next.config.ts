import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // ✅ avatars Google OAuth
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // ✅ avatars GitHub OAuth
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com", // ✅ avatars Discord (optionnel)
      },
      {
        protocol: "https",
        hostname: "your-project-id.supabase.co", // ✅ ton bucket Supabase (remplace ton domaine)
      },
    ],
  },
};

export default nextConfig;
