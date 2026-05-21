import { PrismaClient } from '@prisma/client';

// TRIK PAMUNGKAS: Kita paksa tulis variabel environment-nya langsung ke memori Node.js
// Dengan begini, ts-node dan Prisma tidak akan bisa protes lagi.
process.env.DATABASE_URL = "postgresql://postgres:123456@localhost:5432/xapiens_lms";

// Inisialisasi dibiarkan kosong agar TypeScript (garis merah) diam
const prisma = new PrismaClient();

async function main() {
  // Membersihkan data lama agar tidak duplikat saat dijalankan ulang
  await prisma.user.deleteMany();

  // 1. Membuat akun Admin
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Super Admin',
      password: 'admin123',
      role: 'ADMIN',
    },
  });

  // 2. Membuat akun Instruktur
  await prisma.user.create({
    data: {
      email: 'instruktur@gmail.com',
      name: 'Adinda',
      password: 'Adinda123',
      role: 'INSTRUCTOR',
    },
  });

  // 3. Membuat akun User/Student
  await prisma.user.create({
    data: {
      email: 'hanan@gmail.com',
      name: 'hanan',
      password: 'hanan123',
      role: 'USER',
    },
  });

  console.log('✅ Seeding database berhasil! 3 Akun siap digunakan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });