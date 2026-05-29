import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. HANDLER POST: MEMBUAT USER BARU / KURSUS (SUDAH AMAN)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'CREATE_COURSE') {
      const { title, description, instructorName, questionsData } = body;
      if (!title || !description) return NextResponse.json({ error: 'Judul wajib diisi!' }, { status: 400 });
      const courseId = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      const newCourse = await prisma.course.create({
        data: {
          id: courseId, title, description, instructorName: instructorName || 'Admin Instruktur', 
          questions: {
            create: (questionsData || []).map((q: any, index: number) => ({
              id: `${courseId}-q${Date.now()}-${index + 1}`, 
              questionText: q.questionText, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption,
            }))
          }
        }
      });
      return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
    }

    const { email, name, password, role } = body;
    if (!email || !name || !password) return NextResponse.json({ error: 'Data tidak lengkap kawan!' }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'Email sudah terdaftar kawan!' }, { status: 400 });

    const newUser = await prisma.user.create({
      data: { email: email.trim(), name: name.trim(), password, role: role || 'USER' },
    });
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal database.', details: error.message }, { status: 500 });
  }
}

// 2. HANDLER PUT: MEMPERBARUI / EDIT DATA AKUN USER KAWAN
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, password, role } = body;

    if (!id || !email || !name) {
      return NextResponse.json({ error: 'ID, Nama, dan Email wajib diisi kawan!' }, { status: 400 });
    }

    // Siapkan objek update data kawan
    const updateData: any = {
      email: email.trim(),
      name: name.trim(),
      role: role
    };

    // Jika password di form diisi baru, ikut update. Jika kosong, pertahankan yang lama kawan
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('🔴 ERROR API PUT USER:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data user di PostgreSQL.', details: error.message }, { status: 500 });
  }
}

// 3. HANDLER DELETE: MENGHAPUS USER PERMANEN DARI POSTGRESQL
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID User wajib disertakan kawan!' }, { status: 400 });
    }

    // Melakukan penghapusan baris user secara permanen kawan
    await prisma.user.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true, message: 'Akun user berhasil dihapus dari pgAdmin.' });
  } catch (error: any) {
    console.error('🔴 ERROR API DELETE USER:', error);
    return NextResponse.json({ error: 'Gagal menghapus akun dari database.', details: error.message }, { status: 500 });
  }
}