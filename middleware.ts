import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Kode di sini hanya akan berjalan jika user sudah lolos autentikasi token login
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // TAMBAHAN KEAMANAN SANGAT KETAT (RBAC):
    // Jika user biasa (USER) nekat mengetik manual URL site-administration di browser, tendang balik ke home
    if (path.startsWith("/dashboard/site-administration") && token?.role === "USER") {
      return NextResponse.redirect(new URL("/dashboard/site-home", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Middleware hanya akan meloloskan request jika token jwt NextAuth itu ada (tidak null)
      authorized: ({ token }) => !!token,
    },
    pages: {
      // Jika user belum login, secara otomatis alihkan paksa ke halaman login utama ini
      signIn: "/",
    },
  }
);

// MATRIKS PASANGAN MATCHING: Tentukan rute mana saja yang wajib dilindungi oleh keamanan ini
export const config = {
  matcher: [
    "/dashboard/:path*", // Mengunci mati seluruh halaman di dalam dashboard dan sub-foldernya
  ],
};