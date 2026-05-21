'use client'; // Kita jadikan client component agar tombol logout bisa di-klik

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 1. Validasi Keamanan: Jika loading session selesai dan ternyata data kosong, langsung usir ke halaman login depan
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] text-sm text-gray-500 font-sans">
        Memuat sesi halaman...
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  // Mengambil data user yang sedang login aktif dari memori NextAuth
  const currentUser = session.user;
  const userRole = (currentUser as any)?.role || 'USER'; // Default fallback ke USER jika data kosong

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      {/* TOP NAVBAR */}
      <header className="h-14 bg-[#0a0a0a] text-white flex items-center justify-between px-4 z-20 sticky top-0">
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white text-xl px-2">≡</button>
          <div className="text-xl font-bold tracking-widest flex items-center">
            <span className="text-[#0ea5e9] mr-1">^</span>XAPIENS
          </div>
        </div>
        <div className="flex items-center space-x-5 text-gray-300 text-sm">
          <button className="hover:text-white text-lg">🌐</button>
          <button className="hover:text-white text-lg">🔔</button>
          <button className="hover:text-white text-lg">💬</button>
          
          {/* USER PROFILE CARD PADA NAVBAR */}
          <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
            <div className="flex flex-col items-end leading-none hidden sm:flex">
              <span className="text-xs font-medium text-white">{currentUser?.name}</span>
              <span className="text-[10px] text-gray-400 font-light mt-0.5 capitalize">{userRole.toLowerCase()}</span>
            </div>
            <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#1c1d1f] text-gray-300 flex flex-col justify-between hidden md:flex">
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              <li>
                <a href="/dashboard" className="flex items-center px-6 py-3 bg-[#0dcaf0] text-black font-medium">
                  <span className="mr-3">⏱️</span> Dashboard
                </a>
              </li>
              <li>
                <a href="/dashboard/site-home" className="flex items-center px-6 py-3 hover:bg-gray-800 transition">
                  <span className="mr-3 text-gray-400">🏠</span> Site home
                </a>
              </li>
              <li>
                <a href="/dashboard/certificates" className="flex items-center px-6 py-3 hover:bg-gray-800 transition">
                  <span className="mr-3 text-gray-400">🎓</span> Certificates
                </a>
              </li>
              <li>
                <a href="/dashboard/private-files" className="flex items-center px-6 py-3 hover:bg-gray-800 transition">
                  <span className="mr-3 text-gray-400">📁</span> Private files
                </a>
              </li>

              {/* IMPLEMENTASI RBAC: Menu ini muncul jika yang login ADMIN atau INSTRUCTOR */}
              {(userRole === 'ADMIN' || userRole === 'INSTRUCTOR') && (
                <li>
                  <a href="/dashboard/site-administration" className="flex items-center px-6 py-3 border-l-4 border-amber-500 bg-amber-500/10 text-amber-400 font-medium transition">
                    <span className="mr-3">⚙️</span> Site administration
                  </a>
                </li>
              )}
            </ul>
          </nav>
          
          {/* IMPLEMENTASI POIN 3 (LOGOUT BUTTON) */}
          <div className="flex flex-col gap-1 p-2 border-t border-gray-800">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })} // Hancurkan cookies dan lempar balik ke halaman login utama
              className="w-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white p-2.5 text-xs text-center font-medium cursor-pointer transition rounded-sm border border-red-600/30"
            >
              🚪 Keluar dari Aplikasi
            </button>
            <div className="bg-[#0dcaf0] p-2.5 text-black flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-cyan-500 transition rounded-sm mt-1">
              <span className="mr-2">♿</span> Accessibility settings
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}