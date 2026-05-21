import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const prismaClientSingleton = () => {
  // 1. Buat koneksi pool PostgreSQL mentah menggunakan package 'pg'
  const pool = new Pool({
    connectionString: "postgresql://postgres:123456@localhost:5432/xapiens_lms",
  });

  // 2. Bungkus ke dalam driver adapter resmi milik Prisma 7
  const adapter = new PrismaPg(pool);

  // 3. Masukkan adapter ke dalam constructor. Ini 100% SAH di Prisma 7!
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;