import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('id');
  const userId = (session.user as any).id;

  if (!courseId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { chapters: { orderBy: { title: 'asc' } } }
    });

    if (!course) return NextResponse.json({ error: 'Course tidak ditemukan' }, { status: 404 });

    // 🌟 KUNCI PERBAIKAN DI SINI KAWAN:
    // Cek apakah user ini sudah terdaftar (punya data Enrollment) di kelas ini
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId }
    });

    // Jika belum ada, otomatis buatkan data pendaftarannya di PostgreSQL!
    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          progress: 0,
          status: 'ONGOING'
        }
      });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}