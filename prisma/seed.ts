import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Menggunakan konfigurasi pool adapter pg standar murni proyekmu agar lolos di Prisma 7
const pool = new Pool({
  connectionString: "postgresql://postgres:123456@localhost:5432/xapiens_lms",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Bersihkan data lama agar tidak terjadi bentrok duplikat data saat di-seed ulang
  await prisma.grade.deleteMany();
  await prisma.question.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Database berhasil dibersihkan...');

  // 2. SEED DATA USER (Multi-Role)
  await prisma.user.create({
    data: {
      email: 'instruktur@gmail.com',
      name: 'Adinda (Owner)',
      password: 'Adinda123',
      role: 'INSTRUCTOR',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Super Admin (Pengelola)',
      password: 'admin123',
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'hanan@gmail.com',
      name: 'Hanan (Student)',
      password: 'hanan123',
      role: 'USER',
    },
  });

  // 3. SEED DATA COURSE (Fokus sub-kategori Managed Service Department)
  const course = await prisma.course.create({
    data: {
      id: 'it-support-ms',
      title: 'IT Support & Service Management',
      description: 'Materi kompetensi penanganan insiden infrastruktur, Customer Care Support, dan On-Site Support MS Department.',
    },
  });

  // Daftarkan siswa Hanan secara otomatis ke dalam kelas ini
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
    },
  });

  // 4. SEED BANK SOAL (Pilihan Ganda untuk Kuis Kelulusan Otomatis)
  await prisma.question.createMany({
    data: [
      {
        courseId: course.id,
        questionText: 'Jika terjadi insiden gangguan jaringan pada On-Site Support Team Kideco, dokumen apa yang pertama kali harus diperiksa sesuai SLA?',
        optionA: 'Standard Operating Procedure (SOP)',
        optionB: 'Incident Log & Ticket System',
        optionC: 'User Manual Book',
        optionD: 'Data Retention Summary',
        correctOption: 'B',
      },
      {
        courseId: course.id,
        questionText: 'Apa tugas utama dari tim Customer Care Support (CCA) di Managed Service Department?',
        optionA: 'Melakukan instalasi kabel fiber optik di lapangan',
        optionB: 'Membeli perangkat server baru',
        optionC: 'Menerima, mencatat, dan melakukan triase awal terhadap keluhan insiden pengguna',
        optionD: 'Mengubah konfigurasi database utama pgAdmin',
        correctOption: 'C',
      },
      {
        courseId: course.id,
        questionText: 'Berapakah batas nilai minimal (passing grade) yang harus dicapai agar sertifikat kelulusan kompetensi Xapiens otomatis terbit?',
        optionA: 'Nilai minimal 50',
        optionB: 'Nilai minimal 60',
        optionC: 'Nilai minimal 70',
        optionD: 'Nilai minimal 80',
        correctOption: 'C',
      }
    ],
  });

  console.log('✅ Seeding data LMS Xapiens sukses! 3 Soal Kuis IT Support siap diujikan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });