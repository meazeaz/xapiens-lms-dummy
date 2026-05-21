'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function PrivateFilesPage() {
  const { data: session } = useSession();
  const currentUserName = session?.user?.name || 'Loading...';
  const userId = (session?.user as any)?.id;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar! Maksimal 5MB.');
        return;
      }
      setSelectedFile(file);
      setStatusMessage({ text: '', isError: false });
    }
  };

 const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !userId) {
      alert('Silakan pilih file terlebih dahulu!');
      return;
    }

    setUploading(true); // <-- PERBAIKAN: Pakai kurung (true), bukan = true
    setStatusMessage({ text: '', isError: false });

    try {
      // Menembak ke folder 'privates-files' (pakai S) sesuai folder backend-mu
      const res = await fetch('/api/privates-files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          fileName: selectedFile.name,
        }),
      });

      if (res.ok) {
        setStatusMessage({ text: `✅ Berhasil! File "${selectedFile.name}" telah aman tersimpan di Private Files Anda.`, isError: false });
        setSelectedFile(null);
      } else {
        setStatusMessage({ text: '❌ Gagal mengunggah file ke server database.', isError: true });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: '❌ Terjadi kendala jaringan saat proses unggah.', isError: true });
    } finally {
      setUploading(false); // <-- PERBAIKAN: Pakai kurung (false), bukan = false
    }
  };

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* Header */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-sm">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div>
              <h1 className="text-2xl font-light text-gray-800 flex items-center gap-3">
                {currentUserName} 
                <span className="text-sm text-gray-500 flex items-center gap-1 cursor-not-allowed select-none">
                  💬 Message
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Site pages</span>
            <span>/</span>
            <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded-sm">Private files</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-sm font-semibold text-gray-700">Files Upload Manager</h2>
            <p className="text-xs text-gray-500">Maximum size for new files: 5MB</p>
          </div>
          
          {statusMessage.text && (
            <div className={`p-3 mb-4 text-xs font-medium border rounded-sm ${statusMessage.isError ? 'bg-red-50 text-red-700 border-red-300' : 'bg-green-50 text-green-700 border-green-300'}`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="border border-gray-300 rounded-sm bg-white mb-4">
            <div className="bg-[#f8f9fa] border-b border-gray-300 p-2 text-xs text-gray-600 font-medium">
              📁 Area Penyimpanan Dokumen Siswa
            </div>

            <div className="p-4">
              <label className="border-2 border-dashed border-gray-300 bg-white p-12 flex flex-col items-center justify-center text-center transition hover:bg-gray-50 cursor-pointer block relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                />
                <div className="text-sky-500 text-4xl mb-3">⬇️</div>
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-green-600">
                      📌 File Terpilih Siap Diunggah:
                    </p>
                    <p className="text-xs text-gray-800 font-mono bg-gray-100 px-2 py-1 inline-block border rounded-sm">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to browse or drag and drop your file here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, JPG, PNG</p>
                  </div>
                )}
              </label>
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200 flex gap-2">
              <button 
                type="submit"
                disabled={uploading || !selectedFile}
                className="bg-[#1565c0] hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs px-5 py-2 transition rounded-sm font-medium cursor-pointer shadow-sm"
              >
                {uploading ? 'Sedang Mengunggah...' : 'Save changes / Upload'}
              </button>
              <button 
                type="button"
                onClick={() => setSelectedFile(null)}
                disabled={!selectedFile}
                className="bg-white hover:bg-gray-100 border text-gray-700 text-xs px-5 py-2 transition rounded-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}