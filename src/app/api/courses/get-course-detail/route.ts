import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Kelas wajib disertakan kawan!' }, { status: 400 });
    }

    // Ambil baris data kelas beserta tabel relasi Chapter (Bab materi) miliknya
    const course = await prisma.course.findUnique({
      where: { id: id },
      include: {
        chapters: {
          orderBy: { id: 'asc' } // Urutkan bab dari awal
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan di pgAdmin.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    console.error('🔴 ERROR FETCH DETAIL COURSE:', error);
    return NextResponse.json({ error: 'Gagal memuat data dari PostgreSQL.' }, { status: 500 });
  }
}