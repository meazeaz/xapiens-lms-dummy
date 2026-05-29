'use client';

import React from 'react';

interface DownloadCertProps {
  userName: string;
  courseTitle: string;
  certNo: string;
  issuedAt: Date;
}

export default function DownloadCertButton({ userName, courseTitle, certNo, issuedAt }: DownloadCertProps) {
  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1120; // Ukuran Lanskap Standar Piagam
    canvas.height = 792;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background Krem Mewah Korporat
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Bingkai Emas Ganda Berkelas
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#b59410'; 
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1e293b'; 
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // 3. Ornamen Hiasan Sudut Segitiga Emas
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

    // 5. Judul Utama Piagam
    ctx.font = 'normal 48px Georgia, serif';
    ctx.fillStyle = '#1e3a8a'; 
    ctx.fillText('SERTIFIKAT KOMPETENSI', canvas.width / 2, 240);

    ctx.font = 'normal 15px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Sertifikat resmi ini dengan bangga diberikan atas kelulusan materi kepada:', canvas.width / 2, 310);

    // 6. Nama Siswa Dinamis dari Sesi Akun kawan
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(userName.toUpperCase(), canvas.width / 2, 375);

    // Garis Bawah Nama
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 250, 395);
    ctx.lineTo(canvas.width / 2 + 250, 395);
    ctx.stroke();

    // 7. Deskripsi Status Kelulusan Kelas Ujian
    ctx.font = 'normal 15px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Dinyatakan LULUS dengan kualifikasi sangat baik pada ujian kompetensi kelas:', canvas.width / 2, 440);

    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#0ea5e9'; 
    ctx.fillText(courseTitle, canvas.width / 2, 480);

    // 8. Nomor Sertifikat Dinamis Hasil Split Database kawan
    ctx.font = 'mono 13px Courier New, monospace';
    ctx.fillStyle = '#e11d48'; 
    ctx.fillText(`Nomor Sertifikat: ${certNo}`, canvas.width / 2, 530);

    // 9. Tanggal Kelulusan Ril Sesuai Waktu Ujian Terdata
    const tglCetak = new Date(issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = 'normal 14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Jakarta, ${tglCetak}`, canvas.width / 2, 620);
    
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Adinda (Owner MS Dept)', canvas.width / 2, 690);

    ctx.font = 'normal 12px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Authorized Verifier Signature', canvas.width / 2, 710);

    // 10. Aksi Download Otomatis kawan
    const link = document.createElement('a');
    link.download = `Sertifikat_${courseTitle.replace(/\s+/g, '_')}_${userName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-2 rounded-sm shadow-xs transition cursor-pointer flex items-center gap-1.5"
    >
      📥 Download Sertifikat
    </button>
  );
}