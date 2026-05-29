import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DownloadCertButton from '@/components/DownloadCertButton';

export default async function CertificatesPage() {
  // 1. Amankan Sesi & Tarik Informasi User Aktif
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }

  const userId = (session.user as any).id;
  const currentUserName = session.user?.name || 'Affandi Abdul Aziz';

  // 2. Tarik data dari database pgAdmin (Hanya memfilter sertifikat internal kuis resmi)
  const allCertificates = await prisma.certificate.findMany({
    where: { 
      userId: userId,
      NOT: {
        title: {
          startsWith: '[Eksternal]'
        }
      }
    },
    orderBy: { issuedAt: 'desc' },
  });

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* HEADER & BREADCRUMB */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
          <h1 className="text-3xl font-light text-[#2b3a4a] mb-4">Xapiens Learning Center</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded-sm">Certificates</span>
          </div>
        </div>

        {/* KONTEN UTAMA — SEKARANG MAKIN PADAT DAN FOKUS KAWAN */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-6 rounded-sm">
          <div>
            <h2 className="text-2xl font-light text-[#2b3a4a] mb-1">My Certificates</h2>
            <p className="text-sm text-gray-500 font-light">Daftar pencapaian kelulusan kualifikasi pelatihan mandiri internal perusahaan kawan.</p>
          </div>

          {/* AREA UTAMA: DAFTAR SERTIFIKAT KELULUSAN KUIS */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b pb-2 flex items-center gap-2 select-none">
              🎓 Official Course Certificates ({allCertificates.length})
            </h3>
            
            {allCertificates.length === 0 ? (
              <div className="border border-gray-200 rounded-sm p-4 bg-gray-50 text-xs text-gray-400 italic">
                Belum ada sertifikat kursus yang terbit kawan. Silakan selesaikan ujian kuis di menu <a href="/dashboard/site-home" className="text-blue-600 hover:underline font-medium">Site Home</a> dengan skor minimal 70.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allCertificates.map((cert) => {
                  // Pecah title untuk memisahkan nama kelas dan nomor sertifikat database kawan
                  const parts = cert.title.split('|');
                  const displayTitle = parts[0] || 'Managed Service Certified';
                  const nomorSertifikat = parts[1] || 'CERT/XAPIENS/2026/05/0000';

                  return (
                    <div key={cert.id} className="border border-sky-200 bg-sky-50/20 p-5 rounded-sm flex items-center justify-between shadow-sm hover:border-sky-400 transition gap-4">
                      <div className="space-y-1 text-gray-600 text-[11px] flex-1 min-w-0">
                        <div className="font-bold text-sky-600 uppercase tracking-wide text-[10px]">LMS Certified</div>
                        <h4 className="text-sm font-semibold text-gray-800 leading-tight truncate" title={displayTitle}>{displayTitle}</h4>
                        <p className="text-gray-400 font-mono text-[10px] truncate" title={nomorSertifikat}>No: {nomorSertifikat}</p>
                        <p className="text-gray-400 mt-1">
                          Lulus: {new Date(cert.issuedAt).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      {/* KOMPONEN INDUK GENERATOR LIVE CANVAS DOWNLOAD */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-2xl p-1.5 bg-white border rounded-full shadow-xs select-none hidden sm:block">📜</div>
                        <DownloadCertButton 
                          userName={currentUserName}
                          courseTitle={displayTitle}
                          certNo={nomorSertifikat}
                          issuedAt={cert.issuedAt}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      <footer className="bg-[#eef2f6] border-t border-gray-200 mt-10">
        <div className="bg-[#f97316] text-white text-center py-3 text-sm font-medium uppercase tracking-wider">
          PROUDLY MADE WITH Next.js & PostgreSQL
        </div>
      </footer>
    </div>
  );
}