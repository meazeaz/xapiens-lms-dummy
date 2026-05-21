import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PAKSA Turbopack Next.js untuk menyuntikkan DATABASE_URL langsung ke jantung runtime server sebelum Prisma Client diinisialisasi
  env: {
    DATABASE_URL: "postgresql://postgres:123456@localhost:5432/xapiens_lms",
    NEXTAUTH_SECRET: "xapiens_lms_rahasia_negara_123",
    NEXTAUTH_URL: "http://localhost:3000",
  },
};

export default nextConfig;