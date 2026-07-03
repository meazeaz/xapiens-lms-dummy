import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // 1. Amankan Sesi di Tingkat Server kawan
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const currentUserRole = (session.user as any)?.role || 'USER';
  const currentUserId = (session.user as any)?.id || '';

  // 2. Ambil data kursus secara realtime langsung dari PostgreSQL
  const coursesFromDb = await prisma.course.findMany({
    include: {
      questions: true,
      enrollments: {
        where: {
          userId: currentUserId,
        },
      },
    },
  });

  // 3. TARIK DATA USER DARI DATABASE BESERTA WAKTU AKTIF TERAKHIRNYA
  const allUsersFromDb = await prisma.user.findMany({
    select: { id: true, name: true, role: true, email: true, lastActiveAt: true },
    orderBy: { name: 'asc' }
  });

  // Tentukan batas waktu online: 1 menit yang lalu (60000 ms) dari sekarang kawan
  const ONE_MINUTE_AGO = new Date(Date.now() - 60000);

  // Filter awal: Hanya masukkan pengguna yang statusnya aktif dan abaikan diri sendiri
  const onlineUsersRaw = allUsersFromDb.filter(u => 
    new Date(u.lastActiveAt) >= ONE_MINUTE_AGO && u.id !== currentUserId
  );

  // 4. LOGIKA FILTRASI DAFTAR PENGGUNA ONLINE BERDASARKAN LEVEL OTORITAS
  let displayedOnlineUsers = [];
  if (currentUserRole === 'SUPER_ADMIN') {
    // Super Admin memantau semuanya: Super Admin lain, Admin, dan User
    displayedOnlineUsers = onlineUsersRaw;
  } else if (currentUserRole === 'ADMIN') {
    // Admin hanya diizinkan memantau sesama Admin dan User biasa (Super Admin disembunyikan)
    displayedOnlineUsers = onlineUsersRaw.filter(u => u.role === 'ADMIN' || u.role === 'USER');
  } else {
    // Regular User murni HANYA bisa melihat sesama User biasa (Admin & Super Admin aman tersembunyi)
    displayedOnlineUsers = onlineUsersRaw.filter(u => u.role === 'USER');
  }

  // Array gambar fallback untuk banner kartu kelas
  const fallbackImages = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop'
  ];

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* 1. Welcome Banner */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <h1 className="text-3xl font-light text-[#2b3a4a] mb-2">
            Welcome back, <span className="font-normal text-[#0ea5e9]">{session.user?.name}</span>!
          </h1>
          <p className="text-sm text-gray-500 font-light">
            Sistem Informasi Pelatihan Mandiri Internal — Managed Service Department.
          </p>
        </div>

        {/* 2. Grid Konten Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI: DAFTAR KELAS AKTIF (2 Kolom) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-normal text-gray-800 border-b pb-3 mb-4">
                📋 My Enrolled Courses
              </h2>

              {coursesFromDb?.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Belum ada kelas aktif yang terdaftar di database pgAdmin kawan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coursesFromDb?.map((course, index) => (
                    <div key={course.id} className="border border-gray-200 rounded-sm overflow-hidden flex flex-col hover:shadow-md transition bg-white">
                      <div className="h-32 bg-gray-100 relative">
                        <img 
                          src={fallbackImages[index % fallbackImages.length]} 
                          alt={course.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow text-xs">
                        <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider mb-1">
                          Managed Service Dept
                        </span>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 truncate" title={course.title}>
                          {course.title}
                        </h3>
                        <p className="text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                          {course.description}
                        </p>
                        
                        {/* TAMPILAN PROGRESS BAR KAWAN (DENGAN PELINDUNG) */}
                        {course.enrollments?.length > 0 ? (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1 text-[10px]">
                              <span className="text-gray-500 font-medium">Progress Belajar:</span>
                              <span className="font-bold text-[#0ea5e9]">{course.enrollments[0].progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-[#0ea5e9] h-1.5 rounded-full" 
                                style={{ width: `${course.enrollments[0].progress}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1 block">Status: {course.enrollments[0].status}</span>
                          </div>
                        ) : (
                          <div className="mb-4 text-[10px] text-gray-400 italic">
                            Belum memulai kelas ini.
                          </div>
                        )}

                        <div className="mt-auto pt-2 border-t flex justify-between items-center">
                          <span className="text-[10px] text-gray-400">
                            🎯 {course.questions?.length || 0} Quiz Questions
                          </span>
                          <a 
                            href={`/dashboard/courses/${course.id}`} 
                            className="bg-[#0ea5e9] hover:bg-sky-600 text-white font-medium px-3 py-1.5 rounded-sm transition text-center"
                          >
                            Enter Class
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: MONITORING PENGGUNA ONLINE REAL-TIME */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0ea5e9] mb-2 uppercase tracking-wider border-b pb-2 select-none">
                🟢 Online Users ({displayedOnlineUsers?.length || 0})
              </h3>
              
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {displayedOnlineUsers?.length === 0 ? (
                  <p className="text-gray-400 italic text-[11px] text-center py-4">Tidak ada pengguna lain yang sedang online kawan.</p>
                ) : (
                  displayedOnlineUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-sm border border-gray-100 hover:bg-gray-100/50 transition">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium text-gray-800 text-xs">
                          {user.name}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-sm text-[9px] font-bold uppercase tracking-wide">
                        {user.role === 'SUPER_ADMIN' ? 'Owner' : user.role.toLowerCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#eef2f6] border-t border-gray-200 mt-10">
        <div className="bg-[#f97316] text-white text-center py-3 text-sm font-medium">
          POWERED BY <span className="font-bold">Adinda Adhwa Nisrina Hanan</span>
        </div>
      </footer>
    </div>
  );
}