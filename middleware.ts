import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Fungsi middleware dasar
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Menentukan rute mana saja yang akan dicek oleh middleware ini
export const config = {
  matcher: '/dashboard/:path*',
}