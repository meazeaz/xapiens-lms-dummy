import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: "postgresql://postgres:123456@localhost:5432/xapiens_lms",
  },
  // DAFTARKAN SCRIPT SEED DISINI SESUAI ATURAN PRISMA 7
  migrations: {
    seed: 'ts-node ./prisma/seed.ts',
  },
});