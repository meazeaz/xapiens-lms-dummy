'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface QuestionItem {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

export default function QuizTakePage() {
  const router = useRouter();
  
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // State Manajemen Ujian
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State Hasil Akhir (Result Screen)
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  // FOKUS UTAMA: Ambil data soal asli dari database pgAdmin berdasarkan ID kelas ini
  useEffect(() => {
    // Memuat lembar soal simulasi untuk demo sidang TA (bisa diganti fetch DB asli)
    setQuestions([
      {
        id: "q1",
        questionText: "Jika terjadi insiden gangguan jaringan pada On-Site Support Team Kideco, dokumen apa yang pertama kali harus diperiksa sesuai SLA?",
        optionA: "Standard Operating Procedure (SOP)",
        optionB: "Incident Log & Ticket System",
        optionC: "User Manual Book",
        optionD: "Data Retention Summary",
        correctOption: "B"
      },
      {
        id: "q2",
        questionText: "Apa tugas utama dari tim Customer Care Support (CCA) di Managed Service Department?",
        optionA: "Melakukan instalasi kabel fiber optik di lapangan",
        optionB: "Membeli perangkat server baru",
        optionC: "Menerima, mencatat, dan melakukan triase awal terhadap keluhan insiden pengguna",
        optionD: "Mengubah konfigurasi database utama pgAdmin",
        correctOption: "C"
      },
      {
        id: "q3",
        questionText: "Berapakah batas nilai minimal (passing grade) yang harus dicapai agar sertifikat kelulusan kompetensi Xapiens otomatis terbit?",
        optionA: "Nilai minimal 50",
        optionB: "Nilai minimal 60",
        optionC: "Nilai minimal 70",
        optionD: "Nilai minimal 85",
        correctOption: "C"
      }
    ]);
    setLoadingData(false);
  }, []);

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      alert('Harap jawab semua pertanyaan sebelum mengirimkan kuis!');
      return;
    }

    setIsSubmitting(true);

    // Hitung Nilai Kuis secara realtime berdasarkan jawaban siswa
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) {
        correctCount++;
      }
    });

    const scoreResult = Math.round((correctCount / questions.length) * 100);
    const passingStatus = scoreResult >= 70;

    try {
      // Simpan skor ujian untuk dicatat permanen ke database pgAdmin
      await fetch('/api/courses/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          score: scoreResult,
          isPassed: passingStatus,
          courseTitle: "Official Certified Competency Portfolio"
        }),
      });

      setFinalScore(scoreResult);
      setIsPassed(passingStatus);
      setQuizFinished(true);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan skor ke database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return <div className="p-12 text-center text-sm text-gray-500 font-light">⏳ Memuat lembar soal kuis...</div>;
  }

  if (errorMessage) {
    return <div className="p-12 text-center text-sm text-red-600 font-medium">❌ {errorMessage}</div>;
  }

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8] p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* LAYOUT DUA KOLOM SETELAH KUIS SELESAI */}
        {quizFinished && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 animate-fade-in">
            
            {/* KOLOM KIRI: STATUS KELULUSAN (Besar) */}
            <div className="md:col-span-2 bg-white border border-gray-200 shadow-lg p-8 rounded-lg flex flex-col items-center text-center space-y-6">
              <div className="text-8xl">{isPassed ? '🎉' : '❌'}</div>
              <h1 className="text-4xl font-light text-gray-900">Hasil Evaluasi Akhir</h1>
              
              <div className={`p-6 text-sm rounded-lg max-w-xl mx-auto font-medium shadow-inner ${isPassed ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {isPassed 
                  ? '✓ SELAMAT! Anda dinyatakan LULUS kompetensi kelas ini. Sertifikat resmi digital Anda sudah diterbitkan di menu Certificates.' 
                  : '✗ MAAF, ANDA BELUM LULUS. Nilai Anda di bawah batas passing grade (70). Silakan ulas kembali materi dan coba lagi.'}
              </div>

              <div className="pt-6 border-t w-full">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/site-home')}
                  className="bg-[#1565c0] hover:bg-blue-800 text-white font-medium text-xs px-10 py-3 rounded-lg shadow-md transition cursor-pointer uppercase tracking-wider"
                >
                  🏠 Kembali ke Dashboard Utama
                </button>
              </div>
            </div>

            {/* KOLOM KANAN: RINGKASAN SKOR (Kecil) */}
            <div className="bg-white border border-gray-200 shadow-lg p-8 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-3">Ringkasan Skor</h3>
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500">Skor Kompetensi Anda:</p>
                <p className={`text-8xl font-bold mt-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {finalScore}
                </p>
                <p className="text-xl text-gray-400">/ 100</p>
              </div>
            </div>

          </div>
        )}

        {/* LEMBAR PERTANYAAN KUIS (TAMPILKAN JIKA BELUM SELESAI) */}
        {!quizFinished && (
          <form onSubmit={handleSubmitQuiz} className="bg-white border border-gray-200 shadow-sm p-6 md:p-10 space-y-8 rounded-lg">
            <div className="border-b pb-6 flex items-center gap-4">
              <span className="text-3xl">📝</span>
              <div>
                <h1 className="text-2xl font-light text-gray-800">Lembar Evaluasi Kuis</h1>
                <p className="text-xs text-gray-400 mt-1">Harap jawab semua pertanyaan dengan teliti berdasarkan materi yang telah dipelajari.</p>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Belum ada bank soal kuis yang terdaftar untuk kelas ini.
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-4 text-sm border border-gray-100 p-6 rounded-lg bg-gray-50/50">
                    <p className="font-semibold text-gray-800 text-base leading-relaxed flex gap-3">
                      <span className="text-[#1565c0] font-bold">{idx + 1}.</span> 
                      <span>{q.questionText}</span>
                    </p>
                    <div className="space-y-3 pl-8 text-gray-700">
                      {[
                        ['A', q.optionA],
                        ['B', q.optionB],
                        ['C', q.optionC],
                        ['D', q.optionD]
                      ].map(([key, val]) => (
                        <label key={key} className="flex items-center gap-4 cursor-pointer hover:text-black bg-white p-4 rounded-lg border border-gray-200 hover:border-[#1565c0] hover:shadow-md transition">
                          <input
                            type="radio"
                            name={q.id}
                            value={key}
                            checked={answers[q.id] === key}
                            onChange={() => handleOptionChange(q.id, key)}
                            className="w-5 h-5 accent-[#1565c0] cursor-pointer"
                          />
                          <span className="leading-relaxed"><span className="font-bold text-lg text-gray-400 mr-2">{key}.</span> {val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {questions.length > 0 && (
              <div className="pt-8 flex justify-end border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-[#1565c0] hover:bg-blue-800 text-white font-semibold text-xs px-12 py-3.5 rounded-lg shadow-md transition disabled:bg-blue-400 cursor-pointer uppercase tracking-wider"
                >
                  {isSubmitting ? 'Mengevaluasi Skor...' : '🚀 Kirim Jawaban Kuis'}
                </button>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}