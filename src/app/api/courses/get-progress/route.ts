import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  const userId = (session.user as any).id;

  if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });

  try {
    // 1. Ambil semua ID Bab yang terdaftar di dalam Kelas ini kawan
    const allChaptersInCourse = await prisma.chapter.findMany({
      where: { courseId },
      select: { id: true }
    });

    const courseChapterIds = allChaptersInCourse.map(c => c.id);

    // 2. Cari bab dari list di atas yang sudah sukses dibuka oleh user ini
    const progressRecords = await prisma.chapterProgress.findMany({
      where: {
        userId,
        isOpened: true,
        chapterId: { in: courseChapterIds } // <-- Solusi aman tanpa crash relasi kawan!
      },
      select: { chapterId: true }
    });

    const openedIds = progressRecords.map(r => r.chapterId);
    return NextResponse.json({ openedIds });
  } catch (error) {
    console.error('Error saat memuat progres kawan:', error);
    return NextResponse.json({ error: 'Gagal memuat progress' }, { status: 500 });
  }
}