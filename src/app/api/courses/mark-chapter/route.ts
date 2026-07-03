import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chapterId } = await req.json();
  const userId = (session.user as any).id;

  try {
    // 1. Ambil info bab untuk mencari tahu ID Kelas (courseId) kawan
    const targetChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true }
    });

    if (!targetChapter) {
      return NextResponse.json({ error: 'Chapter tidak ditemukan' }, { status: 404 });
    }

    const courseId = targetChapter.courseId;

    // 2. Simpan status keaktifan bab saat ini ke database PostgreSQL
    await prisma.chapterProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      update: { isOpened: true },
      create: { userId, chapterId, isOpened: true },
    });

    // 3. Ambil daftar semua ID Bab yang masuk ke dalam Kelas ini
    const allChaptersInCourse = await prisma.chapter.findMany({
      where: { courseId },
      select: { id: true }
    });

    const courseChapterIds = allChaptersInCourse.map(c => c.id);
    const totalChapters = courseChapterIds.length;

    // 4. Hitung berapa bab dari kelas ini yang sudah sukses dibuka oleh user
    const openedChaptersCount = await prisma.chapterProgress.count({
      where: {
        userId,
        isOpened: true,
        chapterId: { in: courseChapterIds } // <-- Cara aman & akurat tanpa crash relasi kawan!
      }
    });

    // 5. Rumus dinamis mengikuti berapapun jumlah topiknya
    const progressPercent = totalChapters > 0 
      ? Math.round((openedChaptersCount / totalChapters) * 100) 
      : 0;

    // 6. Tembak pembaruan ke tabel Enrollment kawan!
    await prisma.enrollment.updateMany({
      where: { userId, courseId },
      data: {
        progress: progressPercent,
        status: progressPercent === 100 ? 'COMPLETED' : 'ONGOING'
      }
    });

    return NextResponse.json({ success: true, progress: progressPercent });
  } catch (error) {
    console.error('Error saat kalkulasi progres kawan:', error);
    return NextResponse.json({ error: 'Gagal update progress' }, { status: 500 });
  }
}