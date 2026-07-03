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
    // 1. Cari tahu bab ini milik kelas (Course) mana kawan
    const targetChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true }
    });

    if (!targetChapter) {
      return NextResponse.json({ error: 'Chapter tidak ditemukan' }, { status: 404 });
    }

    const courseId = targetChapter.courseId;

    // 2. Catat bahwa bab ini sudah berhasil dibuka oleh user
    await prisma.chapterProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      update: { isOpened: true },
      create: { userId, chapterId, isOpened: true },
    });

    // 3. Hitung total bab yang ada di kelas ini
    const totalChapters = await prisma.chapter.count({
      where: { courseId }
    });

    // 4. Hitung berapa banyak bab yang sudah dibuka oleh user di kelas ini
    const openedChaptersCount = await prisma.chapterProgress.count({
      where: {
        userId,
        isOpened: true,
        chapter: { courseId } // Memastikan menghitung bab yang sekelas
      }
    });

    // 5. Rumus kalkulasi persentase progress LMS asli kawan!
    const progressPercent = totalChapters > 0 
      ? Math.round((openedChaptersCount / totalChapters) * 100) 
      : 0;

    // 6. Update otomatis ke dalam tabel Enrollment agar Admin & User bisa lihat hasilnya
    await prisma.enrollment.updateMany({
      where: { userId, courseId },
      data: {
        progress: progressPercent,
        status: progressPercent === 100 ? 'COMPLETED' : 'ONGOING'
      }
    });

    return NextResponse.json({ success: true, progress: progressPercent });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Gagal update progress' }, { status: 500 });
  }
}