import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. JALUR KHUSUS: PEMBUATAN KURSUS BARU + BANK SOAL DINAMIS
    if (body.action === 'CREATE_COURSE') {
      const { title, description, instructorName, questionsData } = body;

      if (!title || !description) {
        return NextResponse.json({ error: 'Judul dan Deskripsi wajib diisi!' }, { status: 400 });
      }

      const courseId = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      // Simpan Kursus Sekaligus Hubungkan dengan Bank Soal Dinamis (Berapapun Jumlahnya)
      const newCourse = await prisma.course.create({
        data: {
          id: courseId,
          title: title,
          description: description,
          // Menyimpan nama instruktur/admin penanggung jawab jika tabel DB kamu mendukung field text bebas
          instructor: instructorName || 'Admin Instruktur', 
          questions: {
            create: questionsData.map((q: any, index: number) => ({
              id: `${courseId}-q${Date.now()}-${index + 1}`, // ID Unik agar tidak bentrok
              questionText: q.questionText,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctOption: q.correctOption,
            }))
          }
        },
        include: {
          questions: true
        }
      });

      return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
    }

    // 2. JALUR DEFAULT: PEMBUATAN AKUN USER BARU
    const { email, name, password, role } = body;
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Data user belum lengkap!' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar!' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: { email, name, password, role: role || 'USER' },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error('🔴 DB CRASH ERROR:', error);
    return NextResponse.json(
      { error: 'Gagal memproses ke database PostgreSQL.', details: error.message }, 
      { status: 500 }
    );
  }
}