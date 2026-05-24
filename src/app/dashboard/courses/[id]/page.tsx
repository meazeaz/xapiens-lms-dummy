'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ChapterItem {
  id: string;
  title: string;
  summary: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  imageUrl?: string;
  videoUrl?: string;
  chapters: ChapterItem[];
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const { data: session } = useSession();
  const currentUserName = session?.user?.name || 'Student';

  // State Manajemen Data Database
  const [course, setCourse] = useState<CourseData | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. AMBIL DATA REALTIME DARI POSTGRESQL BERDASARKAN ID KELAS
  useEffect(() => {
    async function getCourseDetailsFromDb() {
      try {
        setLoading(true);
        // Pintu API penyuplai data satu kelas spesifik
        const res = await fetch(`/api/courses/get-course-detail?id=${courseId}`);
        
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);
          
          // Set bab pertama sebagai bab aktif otomatis jika datanya ada
          if (data.course?.chapters && data.course.chapters.length > 0) {
            setActiveChapterId(data.course.chapters[0].id);
          }
        } else {
          setError('Gagal memuat detail kompetensi kelas dari PostgreSQL kawan.');
        }
      } catch (err) {
        console.error(err);
        setError('Kendala koneksi jaringan ke server database.');
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      getCourseDetailsFromDb();
    }
  }, [courseId]);

  // Fungsi pembantu mengekstrak ID Youtube agar bisa diputar di iframe html kawan
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-500 font-light">⏳ Menghubungi pgAdmin, memuat kurikulum materi kelas...</div>;
  }

  if (error || !course) {
    return <div className="p-12 text-center text-xs text-red-600 font-medium">❌ {error || 'Kelas tidak ditemukan di database.'}</div>;
  }

  // Cari materi bab aktif yang sedang diklik siswa
  const activeChapter = course.chapters.find(ch => ch.id === activeChapterId) || course.chapters[0];
  const embedVideo = getYouTubeEmbedUrl(course.videoUrl);

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* BREADCRUMB & HEADER — JUDUL DIAMBIL DARI DB */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 flex justify-between items-center rounded-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-[#2b3a4a] mb-2">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
              <span>Dashboard</span> <span>/</span>
              <span>Courses</span> <span>/</span>
              <span className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded-sm">{course.title}</span>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400 hidden sm:block">
            <p>Instructor Penanggung Jawab:</p>
            <p className="font-semibold text-gray-700 text-sm mt-0.5">👤 {course.instructorName}</p>
          </div>
        </div>

        {/* COVER COVER BANNER — JIKA ADA DI DB, TAMPILKAN GAGAH DI ATAS MATERI */}
        {course.imageUrl && (
          <div className="w-full h-52 md:h-64 rounded-sm overflow-hidden shadow-sm border border-gray-200 bg-gray-200">
            <img src={course.imageUrl} alt="Course Banner" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 text-xs rounded-sm shadow-sm">
          💡 <strong>PANDUAN BELAJAR POSTGRESQL:</strong> Klik pada kartu bab silabus di bawah untuk membuka dokumen pembahasan materi. Tonton juga video pelengkap insting industri yang disematkan instruktur di bagian bawah jika tersedia.
        </div>

        {/* GRID KARTU TOPIK BAB — DI-RENDER REALTIME BERDASARKAN JUMLAH CHAPTER DI DB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {course.chapters.length === 0 ? (
            <p className="text-xs text-gray-400 italic col-span-full">Belum ada materi bab diinput untuk kelas ini kawan.</p>
          ) : (
            course.chapters.map((chapter, idx) => (
              <div 
                key={chapter.id} 
                onClick={() => setActiveChapterId(chapter.id)}
                className={`p-4 border rounded-sm shadow-sm flex flex-col items-center text-center cursor-pointer transition relative ${
                  activeChapterId === chapter.id 
                    ? 'border-[#0ea5e9] bg-sky-50/40 ring-1 ring-[#0ea5e9]' 
                    : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm mb-3 shadow-sm ${
                  activeChapterId === chapter.id ? 'bg-[#0ea5e9] text-white font-bold' : 'bg-gray-100 text-gray-600 font-bold'
                }`}>
                  {idx + 1}
                </div>
                <h3 className={`text-xs font-semibold leading-tight line-clamp-2 ${activeChapterId === chapter.id ? 'text-[#0ea5e9]' : 'text-gray-700'}`}>
                  {chapter.title}
                </h3>
                
                {activeChapterId === chapter.id && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0ea5e9]"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* PANEL ISI DOKUMEN MATERI YANG SEDANG DIBACA (DINAMIS DATABASE) */}
        {activeChapter && (
          <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-8 rounded-sm space-y-4 animate-fade-in">
            <div className="flex items-center space-x-3 border-b pb-3 text-gray-800">
              <span className="text-xl bg-sky-100 text-[#0ea5e9] px-2.5 py-1.5 rounded-sm font-bold">📄</span>
              <div>
                <h2 className="text-xl font-normal text-gray-900">{activeChapter.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Dokumen Kompetensi Ril Terdaftar di PostgreSQL</p>
              </div>
            </div>
            
            <div className="text-xs md:text-sm text-gray-700 leading-relaxed pt-2 whitespace-pre-line bg-gray-50/50 p-4 border rounded-sm font-medium">
              {activeChapter.summary}
            </div>
          </div>
        )}

        {/* EMBED PLAYER VIDEO MULTIMEDIA YOUTUBE ASLI DARI DATABASE */}
        {embedVideo && (
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-1">📺 Multimedia Learning Video Stream</h3>
            <div className="relative w-full aspect-video md:max-w-3xl mx-auto border rounded-sm overflow-hidden shadow-inner">
              <iframe 
                src={embedVideo} 
                title="Course Learning Video Player"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* AREA TOMBOL UJIAN EVALUASI KUIS */}
        <div className="bg-white border border-gray-200 shadow-sm p-8 rounded-sm text-center space-y-4">
          <div className="text-xs md:text-sm text-gray-500">
            Siswa <span className="font-semibold text-gray-800">{currentUserName}</span>, jika Anda sudah selesai membaca {course.chapters.length} materi bab di atas dan menonton video streaming, klik tombol di bawah untuk langsung menguji bank soal kuis kelas ini.
          </div>
          <button 
            type="button"
            onClick={() => router.push(`/dashboard/courses/${courseId}/quiz`)}
            className="inline-block bg-[#f97316] hover:bg-orange-600 text-white font-semibold text-xs md:text-sm px-10 py-3 rounded-sm shadow-md transition tracking-wide uppercase cursor-pointer"
          >
            🚀 Siap Mengikuti Quiz Kompetensi
          </button>
        </div>

      </div>
    </div>
  );
}