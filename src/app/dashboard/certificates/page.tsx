import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function CertificatesPage() {
  // 1. Amankan Sesi di Tingkat Server & Ambil ID User yang sedang login
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const userId = (session.user as any).id;

  // 2. Tarik Seluruh Data dari Tabel Certificate untuk Pengguna Ini
  const allCertificates = await prisma.certificate.findMany({
    where: { userId: userId },
    orderBy: { issuedAt: 'desc' },
  });

  // 3. Pisahkan Secara Logis: Mana yang Sertifikat Internal Ujian, Mana yang Unggahan Eksternal
  const internalCertificates = allCertificates.filter(cert => !cert.title.startsWith('[Eksternal]'));
  const externalUploadedFiles = allCertificates.filter(cert => cert.title.startsWith('[Eksternal]'));

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* HEADER & BREADCRUMB */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <h1 className="text-3xl font-light text-[#2b3a4a] mb-4">Xapiens Learning Center</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
            <span className="cursor-pointer hover:underline">Dashboard</span>
            <span>/</span>
            <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded-sm">Certificates</span>
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-8">
          <div>
            <h2 className="text-2xl font-light text-[#2b3a4a] mb-1">My Certificates & Portfolios</h2>
            <p className="text-sm text-gray-500 font-light">Manajemen sertifikat kompetensi internal LMS dan berkas lampiran eksternal siswa.</p>
          </div>

          {/* SEKSI A: SERTIFIKAT KELULUSAN KURSUS INTERNAL (DARI KUIS) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              🎓 Official Course Certificates ({internalCertificates.length})
            </h3>
            
            {internalCertificates.length === 0 ? (
              <div className="border border-gray-200 rounded-sm p-4 bg-gray-50 text-xs text-gray-500">
                Belum ada sertifikat kursus internal yang terbit. Silakan selesaikan kuis di menu <a href="/dashboard/site-home" className="text-blue-600 hover:underline">Site Home</a> dengan skor minimal 70.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internalCertificates.map((cert) => (
                  <div key={cert.id} className="border border-sky-200 bg-sky-50/20 p-5 rounded-sm flex items-center justify-between shadow-sm hover:border-sky-400 transition">
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-sky-600 uppercase tracking-wide">LMS Certified</div>
                      <h4 className="text-sm font-semibold text-gray-800">{cert.title}</h4>
                      <p className="text-gray-400">
                        Diterbitkan: {new Date(cert.issuedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-2xl p-2 bg-white border rounded-full shadow-sm select-none">📜</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-[#eef2f6] border-t border-gray-200 mt-10">
        <div className="bg-[#f97316] text-white text-center py-3 text-sm font-medium">
          PROUDLY MADE WITH <span className="font-bold">Next.js & PostgreSQL (Dual-Source Sync)</span>
        </div>
      </footer>
    </div>
  );
}