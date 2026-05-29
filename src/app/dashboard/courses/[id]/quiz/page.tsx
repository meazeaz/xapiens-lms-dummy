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
  const currentUserName = session?.user?.name || 'Affandi Abdul Aziz';

  // State Manajemen Ujian
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State Layar Skor & Cetak Sertifikat Ril Database
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);
  const [generatedCertNo, setGeneratedCertNo] = useState('');

  useEffect(() => {
    async function loadQuizFromDatabase() {
      try {
        setLoadingData(true);
        const res = await fetch(`/api/courses/get-quiz?courseId=${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions || []);
        } else {
          setErrorMessage('Gagal memuat bank soal dari server database PostgreSQL.');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Terjadi kendala jaringan saat menghubungi database.');
      } finally {
        setLoadingData(false);
      }
    }

    if (courseId) loadQuizFromDatabase();
  }, [courseId]);

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      alert('Harap jawab semua pertanyaan sebelum mengirimkan kuis kawan!');
      return;
    }

    setIsSubmitting(true);

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) correctCount++;
    });

    const scoreResult = Math.round((correctCount / questions.length) * 100);
    const passingStatus = scoreResult >= 70;

    try {
      const res = await fetch('/api/courses/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          score: scoreResult,
          isPassed: passingStatus,
          courseTitle: "Managed Service & IT Support Certified"
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        // Ambil nomor sertifikat yang baru diproduksi oleh database kawan
        if (passingStatus && resData.data?.newCertificate) {
          const certTitle = resData.data.newCertificate.title;
          const nomorUnik = certTitle.split('|')[1] || 'CERT/XAPIENS/2026/0001';
          setGeneratedCertNo(nomorUnik);
        }
        
        setFinalScore(scoreResult);
        setIsPassed(passingStatus);
        setQuizFinished(true);
      } else {
        alert('Gagal mencatat skor ke PostgreSQL.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // KUNCI UTAMA: FUNGSI LIVE RENDERING DAN DOWNLOAD SERTIFIKAT DIGITAL ASLI KAWAN!
  const downloadCertificatePDF = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1120;  // Ukuran standar Lanskap kertas piagam kawan
    canvas.height = 792;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Gambar Background Mewah Krem Korporat
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Gambar Bingkai Emas Ganda Berkelas
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#b59410'; // Warna Emas
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1e293b'; // Garis Tipis Hitam Slate Dalam
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // 3. Ornamen Hiasan Sudut Segitiga Emas Khas Sertifikat Kompetensi
    const drawCornerOrnamen = (x: number, y: number, xSign: number, ySign: number) => {
      ctx.fillStyle = '#b59410';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (60 * xSign), y);
      ctx.lineTo(x, y + (60 * ySign));
      ctx.closePath();
      ctx.fill();
    };
    drawCornerOrnamen(48, 48, 1, 1);
    drawCornerOrnamen(canvas.width - 48, 48, -1, 1);
    drawCornerOrnamen(48, canvas.height - 48, 1, -1);
    drawCornerOrnamen(canvas.width - 48, canvas.height - 48, -1, -1);

    // 4. Logo Header Teks Atas
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('^ XAPIENS LEARNING CENTER', canvas.width / 2, 120);

    ctx.font = 'italic 14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('PT Xapiens Teknologi Indonesia — Managed Service Department', canvas.width / 2, 145);

    // 5. Tulisan Utama "SERTIFIKAT KELULUSAN"
    ctx.font = 'normal 48px Georgia, serif';
    ctx.fillStyle = '#1e3a8a'; // Biru Navy Tua Elegan
    ctx.fillText('SERTIFIKAT KOMPETENSI', canvas.width / 2, 240);

    ctx.font = 'normal 15px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Sertifikat resmi ini dengan bangga diberikan atas kelulusan materi kepada:', canvas.width / 2, 310);

    // 6. Cetak Nama Siswa Asli (Besar & Tebal Menawan)
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(currentUserName.toUpperCase(), canvas.width / 2, 375);

    // Garis Bawah Nama
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 250, 395);
    ctx.lineTo(canvas.width / 2 + 250, 395);
    ctx.stroke();

    // 7. Deskripsi Status Kelulusan Kelas Ujian Ril
    ctx.font = 'normal 15px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Dinyatakan LULUS dengan kualifikasi sangat baik pada ujian kompetensi kelas:', canvas.width / 2, 440);

    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#0ea5e9'; // Biru Cyan Khas Xapiens
    ctx.fillText('IT Support & Service Management Specialist', canvas.width / 2, 480);

    // 8. Cetak Nomor Sertifikat Unik dari Database pgAdmin kawan
    ctx.font = 'mono 13px Courier New, monospace';
    ctx.fillStyle = '#e11d48'; // Merah Khusus Kode Verifikasi
    ctx.fillText(`Nomor Sertifikat: ${generatedCertNo || 'CERT/XAPIENS/2026/05/4912'}`, canvas.width / 2, 530);

    // 9. Ornamen Tanda Tangan Instruktur Kelayakan TA
    const tglSekarang = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    
    ctx.font = 'normal 14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Jakarta, ${tglSekarang}`, canvas.width / 2, 620);
    
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Adinda (Owner MS Dept)', canvas.width / 2, 690);

    ctx.font = 'normal 12px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Authorized Verifier Signature', canvas.width / 2, 710);

    // 10. TRIGGER UNDUH OTOMATIS JADI FILE BANNER GAMBAR / PIAGAM KAWAN
    const link = document.createElement('a');
    link.download = `Sertifikat_Xapiens_${currentUserName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loadingData) return <div className="p-12 text-center text-xs text-gray-500 font-light">⏳ Memuat lembar ujian kuis asli database PostgreSQL...</div>;
  if (errorMessage) return <div className="p-12 text-center text-xs text-red-600 font-medium">❌ {errorMessage}</div>;

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8] p-4 md:p-8">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* TAMPILKAN LAYAR HASIL DAN CETAK SERTIFIKAT JIKA LULUS */}
        {quizFinished ? (
          <div className="bg-white border border-gray-200 shadow-md p-8 text-center space-y-6 rounded-sm animate-fade-in">
            <div className="text-6xl">{isPassed ? '🎉' : '❌'}</div>
            <h1 className="text-3xl font-light text-gray-800">Hasil Evaluasi Kelulusan</h1>
            
            <div className="py-2">
              <p className="text-xs text-gray-400">Skor Ujian Anda kawan:</p>
              <p className={`text-7xl font-bold mt-1 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {finalScore} <span className="text-lg text-gray-400">/ 100</span>
              </p>
            </div>

            <div className={`p-4 text-xs rounded-sm max-w-md mx-auto font-medium border ${isPassed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {isPassed 
                ? `✓ LUAR BIASA! Kawan dinyatakan LULUS kualifikasi kompetensi industri Xapiens. Nomor Lembar Sertifikat Anda: ${generatedCertNo}`
                : '✗ MAAF KAWAN, NILAI ANDA BELUM MENCAPAI TARGET (70). Silakan baca ulang modul silabus materi dan coba kuis lagi kawan.'}
            </div>

            <div className="pt-6 border-t flex flex-col sm:flex-row gap-3 justify-center">
              {isPassed && (
                <button
                  type="button"
                  onClick={downloadCertificatePDF}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  📥 Download Official Certificate (PNG/Piagam)
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push('/dashboard/site-home')}
                className="bg-gray-700 hover:bg-gray-800 text-white font-medium text-xs px-6 py-3 rounded-sm transition cursor-pointer"
              >
                🏠 Kembali ke Beranda Utama
              </button>
            </div>
          </div>
        ) : (
          
          /* LAYOUT LEMBAR PERTANYAAN KUIS SEBELUM DI-SUBMIT */
          <form onSubmit={handleSubmitQuiz} className="bg-white border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 rounded-sm">
            <div className="border-b pb-4">
              <h1 className="text-2xl font-light text-gray-800">Lembar Evaluasi Kuis</h1>
              <p className="text-xs text-gray-400 mt-1">Sistem Kompetensi Terikat pgAdmin — Hasil ujian otomatis menentukan penerbitan sertifikat digital kawan.</p>
            </div>

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

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-[#1565c0] hover:bg-blue-800 text-white font-bold text-xs px-10 py-3 rounded-sm shadow-md transition uppercase tracking-wide cursor-pointer"
              >
                {isSubmitting ? 'Mengevaluasi Hasil...' : '🚀 Kirim Jawaban Kuis'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}