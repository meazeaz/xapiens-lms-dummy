import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        chapters: true,
        questions: true
      },
      orderBy: { title: 'asc' }
    });
    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error('API Error Get Courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}