import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST() {
  const session = await getServerSession(authOptions);
  
  // Jika pengguna belum login, abaikan sinyal
  if (!session || !(session.user as any).id) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // Update waktu keaktifan user saat ini ke database PostgreSQL
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Heartbeat recorded.' });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Failed to record heartbeat' }, { status: 500 });
  }
}