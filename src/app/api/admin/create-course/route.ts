import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
// Pastikan path authOptions ini sesuai dengan struktur project Next-Auth kawan
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Proteksi Keamanan Keamanan/Role (Opsional tapi penting untuk Admin)
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang dapat membuat kelas.' },
        { status: 403 }
      );
    }

    // 2. Ambil payload data kompleks dari Frontend
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

    // 3. Simpan ke database PostgreSQL menggunakan Transaksi Bertingkat Prisma
    const newCourse = await prisma.course.create({
      data: {
        title: title,
        description: description,
        instructorName: instructorName,
        imageUrl: imageUrl || null, // Jika kosong, set jadi null di database
        videoUrl: videoUrl || null,   // Jika kosong, set jadi null di database
        
        // Relasi One-to-Many ke tabel Chapter
        chapters: {
          create: chapters.map((ch: any) => ({
            title: ch.title,
            summary: ch.summary,
          })),
        },

        // Relasi One-to-Many ke tabel Question (Kuis)
        questions: {
          create: questions.map((q: any) => ({
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
          })),
        },
      },
      // Include hasil relasi agar bisa dikembalikan sebagai respons sukses
      include: {
        chapters: true,
        questions: true,
      }
    });

    // 4. Kembalikan respons sukses ke frontend
    return NextResponse.json(
      { 
        message: 'Sukses menyimpan ke database!', 
        course: newCourse 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error Database Prisma:', error);
    return NextResponse.json(
      { error: 'Terjadi kegagalan sistem database backend.', details: error.message },
      { status: 500 }
    );
  } finally {
    // Putuskan koneksi prisma setelah selesai operasi
    await prisma.$disconnect();
  }
}