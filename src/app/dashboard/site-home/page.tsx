import React from 'react';
import prisma from '@/lib/prisma';

export default async function SiteHomePage() {
  
  // Ambil data kursus secara realtime langsung dari PostgreSQL lewat Prisma
  const coursesFromDb = await prisma.course.findMany();

  // Array gambar fallback agar tampilan kartu kursus tetap menarik secara visual sesuai screenshoot LMS Xapiens
  const fallbackImages = [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop'
  ];

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* 1. Header Banner (Logo Xapiens) */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 flex justify-between items-center">
          <div className="text-3xl font-bold tracking-widest flex items-center">
            <span className="text-[#0ea5e9] mr-1">^</span>
            <span className="text-[#2b3a4a]">XAPIENS</span>
          </div>
          <button className="text-[#0ea5e9] hover:text-blue-700 transition flex items-center">
            ⚙️ <span className="text-xs ml-1">▾</span>
          </button>
        </div>

        {/* 2. Course Categories (Struktur Managed Service Department) */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-[#2b3a4a] font-light">Course categories</h2>
            <button className="text-[#0ea5e9] text-sm hover:underline">▾ Collapse all</button>
          </div>
          
          <div className="space-y-2 text-[#0ea5e9] text-[15px]">
            <div className="pl-1">
              <div className="flex items-center gap-2 cursor-pointer hover:underline mb-1 font-medium text-gray-800">
                <span className="text-gray-500 text-sm">▾</span> Managed Service Department
              </div>
              <div className="pl-5 space-y-1">
                <div className="flex items-center gap-2 cursor-pointer hover:underline text-[#0ea5e9]">
                  <span className="text-gray-500 text-sm">▾</span> IT Service Management <span className="text-sm text-gray-500 no-underline">(1)</span>
                </div>
                <div className="pl-5 space-y-1">
                  <div className="flex items-center gap-2 cursor-pointer hover:underline font-bold text-cyan-600">
                    <span className="text-cyan-600 text-sm">▹</span> IT Support & Service Management <span className="text-xs text-gray-400 font-normal"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Available Courses (Daftar Kelas Dinamis dari Database) */}
        <div className="mt-8">
          <div className="flex items-center justify-center mb-8">
            <div className="h-[1px] flex-grow bg-gray-300 max-w-[100px]"></div>
            <div className="h-[2px] w-12 bg-[#0ea5e9] mx-1"></div>
            <h2 className="text-2xl text-[#0ea5e9] mx-4 font-light">Available courses</h2>
            <div className="h-[2px] w-12 bg-[#0ea5e9] mx-1"></div>
            <div className="h-[1px] flex-grow bg-gray-300 max-w-[100px]"></div>
          </div>

          {coursesFromDb.length === 0 ? (
            <div className="text-center p-12 bg-white border text-gray-400 rounded-sm shadow-sm text-sm">
              Belum ada data kursus aktif di database PostgreSQL. Silakan jalankan seed terlebih dahulu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {coursesFromDb.map((course, index) => (
                <div key={course.id} className="bg-white border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition">
                  {/* Banner Gambar Kursus */}
                  <div className="relative h-40 bg-gray-200">
                    <img 
                      src={fallbackImages[index % fallbackImages.length]} 
                      alt={course.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* Detail Konten Kartu Kursus */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-2">
                      <span className="bg-[#17a2b8] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                        Managed Service
                      </span>
                    </div>
                    <h3 className="text-[#0ea5e9] text-lg font-medium leading-tight mb-3 hover:underline cursor-pointer">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                      {course.description}
                    </p>
                    
                    {/* Tombol Akses Aktif Terhubung ke Sub-Halaman Kuis Dinamis */}
                    <div className="flex justify-end mt-auto">
                      <a 
                        href={`/dashboard/courses/${course.id}`}
                        className="bg-[#1565c0] hover:bg-blue-800 text-white text-xs font-medium px-4 py-2 rounded-sm transition text-center shadow-sm"
                      >
                        Access Course
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-[#eef2f6] border-t border-gray-200 mt-10">
        <div className="text-center py-4 bg-[#f97316] text-white text-sm font-medium">
          POWERED BY <span className="font-bold">Adinda Adhwa Nisrina Hanan</span>
        </div>
      </footer>
    </div>
  );
}