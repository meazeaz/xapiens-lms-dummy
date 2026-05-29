import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // 1. Amankan Sesi di Tingkat Server
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  // 2. Ambil data kursus secara realtime langsung dari PostgreSQL lewat Prisma
  const coursesFromDb = await prisma.course.findMany({
    include: {
      questions: true, // Sertakan info bank soal jika diperlukan info tambahan
    },
  });

  // Array gambar fallback untuk banner kartu kelas agar terlihat profesional
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

              {coursesFromDb.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Belum ada kelas aktif yang terdaftar di database pgAdmin Anda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coursesFromDb.map((course, index) => (
                    <div key={course.id} className="border border-gray-200 rounded-sm overflow-hidden flex flex-col hover:shadow-md transition bg-white">
                      {/* Banner Kelas */}
                      <div className="h-32 bg-gray-100 relative">
                        <img 
                          src={fallbackImages[index % fallbackImages.length]} 
                          alt={course.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      {/* Informasi Kelas */}
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
                        <div className="mt-auto pt-2 border-t flex justify-between items-center">
                          <span className="text-[10px] text-gray-400">
                            🎯 {course.questions.length} Quiz Questions
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

          {/* KOLOM KANAN: TIMELINE & PENGINGAT (1 Kolom) */}
          <div className="space-y-6">

            {/* Online Users Mockup */}
            <div className="bg-white border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider border-b pb-2">
                👥 Online Users
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-800">{session.user?.name}</span>
                <span className="text-gray-400 text-[10px]">(You)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-[#eef2f6] border-t border-gray-200 mt-10">
        <div className="bg-[#f97316] text-white text-center py-3 text-sm font-medium">
          PROUDLY POWERED BY <span className="font-bold">Adinda Adhwa Nisrina Hanan</span>
        </div>
      </footer>
    </div>
  );
}