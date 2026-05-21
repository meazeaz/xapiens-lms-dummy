import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { userId, fileName } = await request.json();

    const finalUserId = (session?.user as any)?.id || userId;

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'Gagal mengidentifikasi akun Anda. Silakan re-login.' }, 
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { error: 'Nama file tidak boleh kosong.' }, 
        { status: 400 }
      );
    }

    // Simpan data sertifikat eksternal ke database pgAdmin
    const newUpload = await prisma.certificate.create({
      data: {
        userId: finalUserId,
        title: `[Eksternal] ${fileName}`,
      },
    });

    return NextResponse.json({ success: true, data: newUpload }, { status: 201 });
  } catch (error: any) {
    console.error('🔴 API CRASH ERROR UPLOAD:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}