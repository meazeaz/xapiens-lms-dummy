import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PASTIKAN tertulis huruf BESAR semua kawan: POST
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      title, 
      description, 
      instructorName, 
      imageUrl, 
      videoUrl, 
      chapters, 
      questions 
    } = body;

    // Validasi data dasar wajib
    if (!title || !description || !instructorName) {
      return NextResponse.json(
        { error: 'Judul, Deskripsi, dan Nama Instruktur wajib diisi kawan!' },
        { status: 400 }
      );
    }

    // Simpan ke database PostgreSQL menggunakan Transaksi Bertingkat Prisma
    const newCourse = await prisma.course.create({
      data: {
        title: title,
        description: description,
        instructorName: instructorName,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        
        // Input array relasi Bab Materi dinamis
        chapters: {
          create: (chapters || []).map((ch: any) => ({
            title: ch.title,
            summary: ch.summary,
          })),
        },

        // Input array relasi Pertanyaan Kuis dinamis
        questions: {
          create: (questions || []).map((q: any) => ({
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
          })),
        },
      },
      include: {
        chapters: true,
        questions: true,
      }
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });

  } catch (error: any) {
    console.error('🔴 ERROR API DB PRISMA:', error);
    return NextResponse.json(
      { error: 'Gagal memproses penyimpanan ke database PostgreSQL.', details: error.message },
      { status: 500 }
    );
  }
}