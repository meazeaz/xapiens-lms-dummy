import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, courseId, score, isPassed, courseTitle } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Data parameter tidak lengkap.' }, { status: 400 });
    }

    // 1. Gunakan Transaction block agar penyimpanan Grade dan Certificate dieksekusi bersamaan demi konsistensi data TA
    const result = await prisma.$transaction(async (tx) => {
      // Simpan riwayat nilai ujian kuis
      const newGrade = await tx.grade.create({
        data: { userId, courseId, score, isPassed },
      });

      // 2. KELULUSAN OTOMATIS: Jika isPassed bernilai true, terbitkan langsung baris sertifikatnya!
      let newCertificate = null;
      if (isPassed) {
        newCertificate = await tx.certificate.create({
          data: {
            userId,
            title: courseTitle,
          },
        });
      }

      return { newGrade, newCertificate };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('API Error Quiz:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}