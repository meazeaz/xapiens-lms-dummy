import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Tarik seluruh data user dari pgAdmin untuk ditampilkan ke Admin/Instruktur
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('API Error Get Users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}