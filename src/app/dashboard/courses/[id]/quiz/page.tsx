'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  const params = useParams();
  const courseId = params.id as string;
  
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // State Manajemen Ujian
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State Hasil Akhir (Layar Skor Kelulusan)
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  // FOKUS UTAMA: Ambil data soal asli dari database pgAdmin berdasarkan ID kelas ini
  useEffect(() => {
    async function loadQuizFromDatabase() {
      try {
        setLoadingData(true);
        // Menembak API internal courses untuk mengambil bank soal realtime
        const res = await fetch(`/api/courses/get-quiz?courseId=${courseId}`);
        
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions || []);
        } else {
          setErrorMessage('Gagal memuat bank soal dari server database PostgreSQL.');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setErrorMessage('Terjadi kendala jaringan saat menghubungi database.');
      } finally {
        setLoadingData(false);
      }
    }

    if (courseId) {
      loadQuizFromDatabase();
    }
  }, [courseId]);

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
      // Kirim hasil skor ujian untuk dicatat permanen ke database pgAdmin
      await fetch('/api/courses/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
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
    return <div className="p-12 text-center text-sm text-gray-500 font-light">⏳ Memuat lembar soal kuis asli dari database pgAdmin...</div>;
  }

  if (errorMessage) {
    return <div className="p-12 text-center text-sm text-red-600 font-medium">❌ {errorMessage}</div>;
  }

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8] p-4 md:p-8">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* TAMPILAN A: JIKA KUIS SELESAI (SKOR RE-RENDER DARI DB) */}
        {quizFinished ? (
          <div className="bg-white border border-gray-200 shadow-md p-8 text-center space-y-6 rounded-sm">
            <div className="text-5xl">{isPassed ? '🎉' : '❌'}</div>
            <h1 className="text-3xl font-light text-gray-800">Hasil Evaluasi Ujian</h1>
            
            <div className="py-4">
              <p className="text-sm text-gray-500">Skor Kompetensi Anda:</p>
              <p className={`text-6xl font-bold mt-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {finalScore} <span className="text-xl text-gray-400">/ 100</span>
              </p>
            </div>

            <div className={`p-4 text-xs rounded-sm max-w-md mx-auto font-medium ${isPassed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {isPassed 
                ? '✓ SELAMAT! Anda dinyatakan LULUS kompetensi kelas ini. Sertifikat resmi digital Anda sudah diterbitkan di menu Certificates.' 
                : '✗ MAAF, ANDA BELUM LULUS. Nilai Anda di bawah batas passing grade (70). Silakan ulas kembali materi.'}
            </div>

            <div className="pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/dashboard/site-home')}
                className="bg-[#1565c0] hover:bg-blue-800 text-white font-medium text-xs px-6 py-2.5 rounded-sm shadow-sm transition cursor-pointer"
              >
                🏠 Kembali ke Dashboard Utama
              </button>
            </div>
          </div>
        ) : (
          
          /* TAMPILAN B: LEMBAR PERTANYAAN KUIS ASLI DATABASE */
          <form onSubmit={handleSubmitQuiz} className="bg-white border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 rounded-sm">
            <div className="border-b pb-4">
              <h1 className="text-2xl font-light text-gray-800">Lembar Evaluasi Kuis</h1>
              <p className="text-xs text-gray-400 mt-1">Sistem Ujian Terintegrasi pgAdmin — Menampilkan data bank soal kursus aktif.</p>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Belum ada bank soal kuis yang terdaftar untuk kelas ini di database. Silakan hubungi instruktur/admin kawan.
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-3 text-xs border-b border-gray-100 pb-5">
                    <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                      {idx + 1}. {q.questionText}
                    </p>
                    <div className="space-y-2 pl-2 text-gray-600">
                      {[
                        ['A', q.optionA],
                        ['B', q.optionB],
                        ['C', q.optionC],
                        ['D', q.optionD]
                      ].map(([key, val]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer hover:text-black bg-gray-50 p-2.5 rounded-sm border border-gray-200 hover:border-gray-300 transition">
                          <input
                            type="radio"
                            name={q.id}
                            value={key}
                            checked={answers[q.id] === key}
                            onChange={() => handleOptionChange(q.id, key)}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <span><span className="font-bold">({key})</span> {val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {questions.length > 0 && (
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-[#1565c0] hover:bg-blue-800 text-white font-semibold text-xs px-8 py-3 rounded-sm shadow-md transition disabled:bg-blue-400 cursor-pointer"
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