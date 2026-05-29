'use client';

import React, { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] text-sm text-gray-500 font-sans">
        Memuat sesi halaman...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentUser = session.user;
  const userRole = (currentUser as any)?.role || 'USER';

  const isActiveMenu = (menuPath: string) => {
    return pathname === menuPath || pathname.startsWith(`${menuPath}/`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      
      {/* TOP NAVBAR — SEKARANG SUDAH BERSIH MINIMALIS KAWAN */}
      <header className="h-14 bg-[#0a0a0a] text-white flex items-center justify-between px-4 z-20 sticky top-0">
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white text-xl px-2 cursor-pointer">≡</button>
          <div className="text-xl font-bold tracking-widest flex items-center select-none">
            <span className="text-[#0ea5e9] mr-1">^</span>XAPIENS
          </div>
        </div>
        
        {/* AREA SISI KANAN NAVBAR (IKON MULTIMEDIA SUDAH TOTAL DIHAPUS) */}
        <div className="flex items-center text-gray-300 text-sm">
          <div className="flex items-center gap-2 pl-3">
            <div className="flex flex-col items-end leading-none hidden sm:flex select-none">
              <span className="text-xs font-medium text-white">{currentUser?.name}</span>
              <span className="text-[10px] text-gray-400 font-light mt-0.5 capitalize">{userRole.toLowerCase()}</span>
            </div>
            <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR TRACKING */}
        <aside className="w-64 bg-[#1c1d1f] text-gray-300 flex flex-col justify-between hidden md:flex border-r border-gray-800 shadow-md">
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              <li>
                <a 
                  href="/dashboard" 
                  className={`flex items-center px-6 py-3 font-medium transition duration-200 border-l-4 ${
                    pathname === '/dashboard'
                      ? 'bg-[#0dcaf0]/10 border-[#0dcaf0] text-[#0dcaf0]' 
                      : 'border-transparent hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-3">⏱️</span> Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="/dashboard/site-home" 
                  className={`flex items-center px-6 py-3 font-medium transition duration-200 border-l-4 ${
                    isActiveMenu('/dashboard/site-home') || isActiveMenu('/dashboard/courses')
                      ? 'bg-[#0dcaf0]/10 border-[#0dcaf0] text-[#0dcaf0]' 
                      : 'border-transparent hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-3">🏠</span> Site home
                </a>
              </li>
              <li>
                <a 
                  href="/dashboard/certificates" 
                  className={`flex items-center px-6 py-3 font-medium transition duration-200 border-l-4 ${
                    isActiveMenu('/dashboard/certificates')
                      ? 'bg-[#0dcaf0]/10 border-[#0dcaf0] text-[#0dcaf0]' 
                      : 'border-transparent hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="mr-3">🎓</span> Certificates
                </a>
              </li>
              {(userRole === 'ADMIN' || userRole === 'INSTRUCTOR') && (
                <li>
                  <a 
                    href="/dashboard/site-administration" 
                    className={`flex items-center px-6 py-3 font-medium transition duration-200 border-l-4 ${
                      isActiveMenu('/dashboard/site-administration')
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                        : 'border-transparent hover:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="mr-3">⚙️</span> Site administration
                  </a>
                </li>
              )}
            </ul>
          </nav>
          
          <div className="flex flex-col gap-1 p-2 border-t border-gray-800 bg-[#161719]">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white p-2.5 text-xs text-center font-medium cursor-pointer transition rounded-sm border border-red-600/30 shadow-sm"
            >
              🚪 Keluar dari Aplikasi
            </button>
            <div className="bg-[#1c1d1f] border border-gray-800 p-2.5 text-gray-400 flex items-center justify-center text-xs font-medium cursor-not-allowed select-none rounded-sm mt-1">
              <span className="mr-2">♿</span> Accessibility settings
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#f4f6f8]">
          {children}
        </main>
      </div>
    </div>
  );
}