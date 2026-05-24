import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'ID Kursus wajib disertakan kawan!' }, { status: 400 });
    }

    // Mengambil bank soal dari PostgreSQL yang memiliki courseId yang cocok
    const questions = await prisma.question.findMany({
      where: { courseId: courseId },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error('🔴 ERROR FETCH QUIZ DATABASE:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari PostgreSQL.' }, { status: 500 });
  }
}