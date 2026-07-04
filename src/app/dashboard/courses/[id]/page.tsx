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

  const [course, setCourse] = useState<CourseData | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [openedChapters, setOpenedChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sinkronisasi data detail kelas dan status progress dari database kawan
  const fetchCourseAndProgress = async () => {
    try {
      setLoading(true);
      const [resCourse, resProgress] = await Promise.all([
        fetch(`/api/courses/get-course-detail?id=${courseId}`),
        fetch(`/api/courses/get-progress?courseId=${courseId}`)
      ]);
      
      if (resCourse.ok) {
        const data = await resCourse.json();
        setCourse(data.course);
        if (data.course?.chapters?.length > 0) {
          setActiveChapterId(data.course.chapters[0].id);
        }
      } else {
        setError('Gagal memuat detail kompetensi kelas dari PostgreSQL kawan.');
      }
      
      if (resProgress.ok) {
        const prog = await resProgress.json();
        setOpenedChapters(prog.openedIds || []);
      }
    } catch (err) {
      console.error(err);
      setError('Kendala koneksi jaringan ke server database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseAndProgress();
    }
  }, [courseId]);

  const markAsRead = async (chapterId: string) => {
    // 1. Set bab yang diklik sebagai bab aktif di layar kawan
    setActiveChapterId(chapterId);

    // 2. Jika belum ada di list opened, baru kita tambahkan dan kirim ke database
    if (!openedChapters.includes(chapterId)) {
      setOpenedChapters(prev => [...prev, chapterId]);
      
      try {
        const res = await fetch('/api/courses/mark-chapter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId })
        });

        if (res.ok) {
          router.refresh();
        }
      } catch (err) {
        console.error('Gagal sinkronisasi progress kawan:', err);
      }
    }
  };

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

  if (loading) return <div className="p-12 text-center text-xs text-gray-500 font-light">⏳ Menghubungi pgAdmin, memuat kurikulum materi kelas...</div>;
  if (error || !course) return <div className="p-12 text-center text-xs text-red-600 font-medium">❌ {error || 'Kelas tidak ditemukan.'}</div>;

  const activeChapter = course.chapters.find(ch => ch.id === activeChapterId) || course.chapters[0];
  const embedVideo = getYouTubeEmbedUrl(course.videoUrl);
  
  // Logika validasi tombol kuis (Semua bab wajib dibaca)
  const isAllChaptersRead = course.chapters.every(ch => openedChapters.includes(ch.id));

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* HEADER */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 flex justify-between items-center rounded-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-[#2b3a4a] mb-2">{course.title}</h1>
            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
              <span>Dashboard</span> <span>/</span> <span>Courses</span> <span>/</span>
              <span className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded-sm">{course.title}</span>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400 hidden sm:block">
            <p>Instructor Penanggung Jawab:</p>
            <p className="font-semibold text-gray-700 text-sm mt-0.5">👤 {course.instructorName}</p>
          </div>
        </div>

        {/* GUIDANCE BOX */}
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 text-xs rounded-sm shadow-sm">
          💡 <strong>PANDUAN BELAJAR:</strong> Klik pada kartu bab silabus di bawah secara berurutan. Setelah semua terbuka, akses Quiz Evaluasi di bawah otomatis aktif kawan.
        </div>

        {/* GRID KARTU TOPIK BAB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {course.chapters.length === 0 ? (
            <p className="text-xs text-gray-400 italic col-span-full">Belum ada materi bab diinput untuk kelas ini kawan.</p>
          ) : (
            course.chapters.map((chapter, idx) => {
              // 🌟 FORMULA PERBAIKAN BARU SINKRONISASI KUNCI:
              const isCurrentOpened = openedChapters.includes(chapter.id);
              const isPreviousOpened = idx > 0 && openedChapters.includes(course.chapters[idx - 1].id);
              
              // Bab pertama otomatis terbuka (idx === 0)
              // Bab lain terbuka jika dirinya sudah pernah dibuka ATAU bab sebelumnya sudah pernah dibuka
              const isLocked = idx > 0 && !isCurrentOpened && !isPreviousOpened;

              return (
                <div 
                  key={chapter.id} 
                  onClick={() => !isLocked && markAsRead(chapter.id)}
                  className={`p-4 border rounded-sm transition text-left ${
                    isLocked ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white cursor-pointer hover:shadow-md'
                  } ${activeChapterId === chapter.id ? 'border-[#0ea5e9] ring-1 ring-[#0ea5e9]' : 'border-gray-200'}`}
                >
                  <span className={`text-[10px] font-bold ${isLocked ? 'text-gray-400' : 'text-[#0ea5e9]'}`}>
                    {isLocked ? '🔒 LOCKED' : '🔓 OPEN'}
                  </span>
                  <h3 className="text-xs font-semibold mt-2">{chapter.title}</h3>
                </div>
              );
            })
          )}
        </div>

        {/* PANEL ISI MATERI */}
        {activeChapter && (
          <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-8 rounded-sm space-y-4">
            <h2 className="text-xl font-normal text-gray-900 border-b pb-3">{activeChapter.title}</h2>
            <div className="text-xs md:text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-4 border rounded-sm font-medium whitespace-pre-line">
              {activeChapter.summary}
            </div>
          </div>
        )}

        {/* MULTIMEDIA VIDEO */}
        {embedVideo && (
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
            <h3 className="text-sm font-semibold text-gray-800 uppercase mb-3">📺 Learning Video Stream</h3>
            <div className="relative w-full aspect-video md:max-w-3xl mx-auto border overflow-hidden">
              <iframe src={embedVideo} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
            </div>
          </div>
        )}

        {/* AREA TOMBOL KUIS */}
        <div className="bg-white border border-gray-200 shadow-sm p-8 rounded-sm text-center">
          <button 
            type="button"
            disabled={!isAllChaptersRead}
            onClick={() => router.push(`/dashboard/courses/${courseId}/quiz`)}
            className={`inline-block font-semibold text-xs md:text-sm px-10 py-3 rounded-sm shadow-md transition uppercase tracking-wide cursor-pointer ${
              isAllChaptersRead ? 'bg-[#f97316] hover:bg-orange-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAllChaptersRead ? '🚀 Siap Mengikuti Quiz Kompetensi' : '🔒 Selesaikan Semua Bab Untuk Membuka Quiz'}
          </button>
        </div>

      </div>
    </div>
  );
}