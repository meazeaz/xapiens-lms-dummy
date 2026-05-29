import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. HANDLER POST: MEMBUAT KURSUS BARU (SUDAH AMAN)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, instructorName, imageUrl, videoUrl, chapters, questions } = body;

    if (!title || !description || !instructorName) {
      return NextResponse.json({ error: 'Judul, Deskripsi, dan Nama Instruktur wajib diisi!' }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        instructorName,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        chapters: {
          create: (chapters || []).map((ch: any) => ({ title: ch.title, summary: ch.summary })),
        },
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
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error: any) {
    console.error('🔴 ERROR API POST COURSE:', error);
    return NextResponse.json({ error: 'Gagal menyimpan ke database.', details: error.message }, { status: 500 });
  }
}

// 2. HANDLER PUT: MEMPERBARUI/EDIT DATA KURSUS YANG SUDAH ADA
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, description, instructorName, imageUrl, videoUrl, chapters, questions } = body;

    if (!id || !title || !description || !instructorName) {
      return NextResponse.json({ error: 'ID Kursus dan parameter wajib tidak boleh kosong!' }, { status: 400 });
    }

    // Melakukan update kompleks menggunakan skema hapus-tulis ulang relasi (Cleanest Method)
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // Hapus bab materi lama dan kuis lama terlebih dahulu agar tidak duplikat bergulung
      await tx.chapter.deleteMany({ where: { courseId: id } });
      await tx.question.deleteMany({ where: { courseId: id } });

      // Update data utama tabel Course sekaligus suntik relasi baru
      return await tx.course.update({
        where: { id: id },
        data: {
          title,
          description,
          instructorName,
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null,
          chapters: {
            create: (chapters || []).map((ch: any) => ({ title: ch.title, summary: ch.summary })),
          },
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
      });
    });

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error: any) {
    console.error('🔴 ERROR API PUT COURSE:', error);
    return NextResponse.json({ error: 'Gagal memperbarui database PostgreSQL.', details: error.message }, { status: 500 });
  }
}

// 3. HANDLER DELETE: MENGHAPUS KURSUS PERMANEN DARI DATABASE
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Kursus wajib disertakan kawan!' }, { status: 400 });
    }

    // Karena di schema.prisma kamu sudah terpasang onDelete: Cascade, 
    // Menghapus Course otomatis akan menyapu bersih tabel Chapter, Question, Grade, dan Enrollment yang terikat!
    await prisma.course.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, message: 'Kursus berhasil dihapus secara permanen.' });
  } catch (error: any) {
    console.error('🔴 ERROR API DELETE COURSE:', error);
    return NextResponse.json({ error: 'Gagal menghapus kursus dari database.', details: error.message }, { status: 500 });
  }
}