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
    // Ambil semua bab yang sudah sukses dibuka oleh user di kelas ini
    const progressRecords = await prisma.chapterProgress.findMany({
      where: {
        userId,
        isOpened: true,
        chapter: { courseId }
      },
      select: { chapterId: true }
    });

    const openedIds = progressRecords.map(r => r.chapterId);
    return NextResponse.json({ openedIds });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal memuat progress' }, { status: 500 });
  }
}