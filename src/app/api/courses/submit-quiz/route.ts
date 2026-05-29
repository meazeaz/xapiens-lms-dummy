import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, courseId, score, isPassed, courseTitle } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Data parameter tidak lengkap.' }, { status: 400 });
    }

    // Eksekusi aman dalam blok transaksi database kawan
    const result = await prisma.$transaction(async (tx) => {
      // 1. Simpan riwayat nilai kuis ke PostgreSQL
      const newGrade = await tx.grade.create({
        data: { userId, courseId, score, isPassed },
      });

      // 2. KELULUSAN OTOMATIS: Jika lulus, racik nomor sertifikat unik korporat!
      let newCertificate = null;
      if (isPassed) {
        const tahun = new Date().getFullYear();
        const bulan = String(new Date().getMonth() + 1).padStart(2, '0');
        const acakKode = Math.floor(1000 + Math.random() * 9000); // Kode acak 4 digit
        
        // Format Nomor Sertifikat Industri Resmi Xapiens kawan
        const nomorSertifikat = `CERT/XAPIENS/${tahun}/${bulan}/${acakKode}`;

        newCertificate = await tx.certificate.create({
          data: {
            userId,
            title: `${courseTitle}|${nomorSertifikat}`, // Kita titipkan nomor unik di kolom title dipisah tanda pipa (|) kawan
          },
        });
      }

      return { newGrade, newCertificate };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('API Error Quiz:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}