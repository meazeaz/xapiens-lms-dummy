'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ModuleItem {
  id: string;
  title: string;
  shortDesc: string;
  icon: string;
  fullContent: string[];
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const { data: session } = useSession();
  const currentUserName = session?.user?.name || 'Student';

  // State untuk menyimpan modul yang sedang aktif dipilih/dibaca siswa (Default: Modul 1)
  const [activeModuleId, setActiveModuleId] = useState('mod-1');

  // Data Konten Pembelajaran Lengkap & Detail per Topik (Standar Kompetensi Industri)
  const learningModules: ModuleItem[] = [
    { 
      id: 'mod-1', 
      title: 'Basic Foundation', 
      shortDesc: 'Pengenalan dasar matriks eskalasi penanganan insiden infrastruktur serta kepatuhan pemenuhan target waktu SLA.', 
      icon: '💻',
      fullContent: [
        "Definisi Manajemen Layanan TI (ITSM) di lingkungan operasional korporat.",
        "Pemahaman dasar mengenai Service Level Agreement (SLA) dan Service Level Requirements (SLR).",
        "Matriks Eskalasi: Menentukan kapan sebuah insiden masuk ke kategori Low, Medium, atau High Priority.",
        "Alur pelaporan gangguan dari end-user menuju pusat komando bantuan (Helpdesk Agent)."
      ]
    },
    { 
      id: 'mod-2', 
      title: 'Project Management Framework', 
      shortDesc: 'SOP Penanganan Tiket Gangguan melalui Customer Care Support (CCA) wajib dicatat dalam kurun waktu 15 menit.', 
      icon: '⚙️',
      fullContent: [
        "Metodologi penanganan insiden berbasis kerangka kerja ITIL (Information Technology Infrastructure Library).",
        "Aturan Emas 15 Menit: Prosedur triase cepat dan pencatatan tiket gangguan ke dalam sistem log aplikasi.",
        "Cara melakukan tagging aset infrastruktur yang mengalami kendala teknis.",
        "Komunikasi taktis inter-departemen saat terjadi pemadaman sistem skala massal (Major Incident)."
      ]
    },
    { 
      id: 'mod-3', 
      title: 'Topic 3: Incident Log Operations', 
      shortDesc: 'Manajemen Insiden Lapangan oleh On-Site Support Team yang bertanggung jawab penuh terhadap perbaikan fisik hardware.', 
      icon: '📊',
      fullContent: [
        "Prosedur dispatching (penugasan) tiket dari tim CCA pusat menuju teknisi lapangan terdekat.",
        "Langkah penanganan kerusakan fisik perangkat keras: Troubleshooting workstation, IP Phone, dan printer logistik.",
        "Dokumentasi penutupan tiket: Mengisi Root Cause Analysis (RCA) dan Solved Action Log.",
        "Meminta konfirmasi kepuasan pengguna (User Sign-Off) setelah kendala berhasil diatasi."
      ]
    },
    { 
      id: 'mod-4', 
      title: 'Topic 4: Infrastructure Distribution', 
      shortDesc: 'Materi mendalam mengenai jaringan distribusi lokal di area operasional kerja infrastruktur utama korporasi.', 
      icon: '🌐',
      fullContent: [
        "Pemeliharaan topologi jaringan lokal (LAN) dan perimeter distribusi nirkabel (Wi-Fi) di area kerja.",
        "Langkah deteksi dini degradasi bandwidth jaringan lokal menggunakan metode ping test dan traceroute.",
        "SOP penanganan kabel backbone terputus dan koordinasi dengan penyedia jasa internet (ISP) mitra.",
        "Keamanan infrastruktur dasar: Manajemen hak akses port switch dan distribusi kabel patch panel rapi."
      ]
    },
    { 
      id: 'mod-5', 
      title: 'Topic 5: Quality & Evaluation Assurance', 
      shortDesc: 'Tahap evaluasi akhir pemeliharaan sistem informasi manajemen dan pelaporan kendala infrastruktur IT.', 
      icon: '🛡️',
      fullContent: [
        "Audit berkala performa penutupan tiket penanganan insiden bulanan.",
        "Metode penghitungan persentase kepatuhan SLA (Target minimal pemenuhan layanan 95% sukses).",
        "Continuous Service Improvement (CSI): Menggunakan feedback user untuk meningkatkan kualitas penanganan teknisi.",
        "Persiapan pelaporan data laporan kendala infrastruktur IT untuk diserahkan kepada Management Owner."
      ]
    }
  ];

  // Cari data lengkap modul yang sedang diklik aktif oleh siswa
  const activeModule = learningModules.find(mod => mod.id === activeModuleId) || learningModules[0];

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* BREADCRUMB & HEADER */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 flex justify-between items-center rounded-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-[#2b3a4a] mb-2">
              Managed Service & IT Support Department
            </h1>
            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
              <span>Dashboard</span> <span>/</span>
              <span>Courses</span> <span>/</span>
              <span>Managed Service Department</span> <span>/</span>
              <span className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded-sm">IT Support & Service Management</span>
            </div>
          </div>
        </div>

        {/* INFORMASI BERANDA KELAS */}
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 text-xs rounded-sm shadow-sm">
          💡 <strong>PANDUAN BELAJAR:</strong> Klik pada salah satu kartu topik di bawah untuk membuka dan membaca modul materi secara lengkap. Setelah selesai meninjau seluruh topik, klik tombol di bagian paling bawah untuk memulai kuis.
        </div>

        {/* GRID KARTU TOPIK (BISA DIKLIK) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {learningModules.map((module) => (
            <div 
              key={module.id} 
              onClick={() => setActiveModuleId(module.id)}
              className={`p-4 border rounded-sm shadow-sm flex flex-col items-center text-center cursor-pointer transition relative ${
                activeModuleId === module.id 
                  ? 'border-[#0ea5e9] bg-sky-50/40 ring-1 ring-[#0ea5e9]' 
                  : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md'
              }`}
            >
              {/* Ikon Bulat Khas Moodle */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 shadow-sm ${
                activeModuleId === module.id ? 'bg-[#0ea5e9] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {module.icon}
              </div>
              <h3 className={`text-xs font-semibold leading-tight ${activeModuleId === module.id ? 'text-[#0ea5e9]' : 'text-gray-700'}`}>
                {module.title}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{module.shortDesc}</p>
              
              {/* Indikator Segitiga Aktif */}
              {activeModuleId === module.id && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0ea5e9]"></div>
              )}
            </div>
          ))}
        </div>

        {/* PANEL DOKUMEN ISI MATERI YANG SEDANG DIBACA DINAMIS */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-8 rounded-sm space-y-4">
          <div className="flex items-center space-x-3 border-b pb-3 text-gray-800">
            <span className="text-2xl bg-sky-100 text-[#0ea5e9] p-1.5 rounded-sm font-bold">{activeModule.icon}</span>
            <div>
              <h2 className="text-xl font-normal text-gray-900">{activeModule.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Materi Dokumen Pelatihan Mandiri Internal PT Xapiens</p>
            </div>
          </div>
          
          {/* List Teks Materi Panjang */}
          <div className="text-xs md:text-sm text-gray-600 space-y-3 leading-relaxed pt-2">
            <p className="font-medium text-gray-800">Sub-Bab Pembahasan Utama:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              {activeModule.fullContent.map((sentence, idx) => (
                <li key={idx} className="hover:text-black transition">
                  {sentence}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AREA TOMBOL EXECUTOR DI BAGIAN PALING BAWAH */}
        <div className="bg-white border border-gray-200 shadow-sm p-8 rounded-sm text-center space-y-4">
          <div className="text-xs md:text-sm text-gray-500">
            Siswa <span className="font-semibold text-gray-800">{currentUserName}</span>, jika Anda sudah selesai membaca dan memahami seluruh materi 5 topik di atas, silakan klik tombol di bawah untuk berpindah halaman ke ruang evaluasi.
          </div>
          <button 
            type="button"
            onClick={() => router.push(`/dashboard/courses/${courseId}/quiz`)}
            className="inline-block bg-[#f97316] hover:bg-orange-600 text-white font-semibold text-xs md:text-sm px-10 py-3 rounded-sm shadow-md transition tracking-wide cursor-pointer uppercase"
          >
            🚀 Siap Mengikuti Quiz Kompetensi
          </button>
        </div>

      </div>
    </div>
  );
}