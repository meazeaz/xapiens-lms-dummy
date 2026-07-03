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
    const progress = await prisma.chapterProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      update: { isOpened: true },
      create: { userId, chapterId, isOpened: true },
    });
    return NextResponse.json({ progress });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update progress' }, { status: 500 });
  }
}