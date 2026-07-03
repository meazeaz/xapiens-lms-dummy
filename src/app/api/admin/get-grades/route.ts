import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Tarik data relasi Grade beserta informasi nama User dan Judul Course kawan
    const grades = await prisma.grade.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        course: {
          select: {
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Urutkan dari kuis yang paling terbaru diselesaikan kawan
      }
    });

    return NextResponse.json({ success: true, grades });
  } catch (error: any) {
    console.error('🔴 API Error Get Grades:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data kompetensi nilai dari PostgreSQL.', details: error.message }, 
      { status: 500 }
    );
  }
}