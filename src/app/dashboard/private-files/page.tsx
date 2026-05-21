'use client'; // Wajib ditambahkan agar bisa membaca session di frontend

import React from 'react';
import { useSession } from 'next-auth/react';

export default function PrivateFilesPage() {
  const { data: session } = useSession();

  // Mengambil nama user dari session NextAuth, jika belum termuat gunakan fallback string kosong/strip
  const currentUserName = session?.user?.name || 'Loading...';

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* 1. Header & Breadcrumbs */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-sm">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div>
              <h1 className="text-2xl font-light text-gray-800 flex items-center gap-3">
                {/* NAMA USER SEKARANG SUDAH DINAMIS 🎉 */}
                {currentUserName} 
                <span className="text-sm text-gray-500 flex items-center gap-1 cursor-pointer hover:text-blue-600 select-none">
                  💬 Message
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
            <span className="cursor-pointer hover:underline">Dashboard</span>
            <span>/</span>
            <span className="cursor-pointer hover:underline">Site pages</span>
            <span>/</span>
            <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded-sm">Private files</span>
          </div>
        </div>

        {/* 2. Private Files Content */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-sm font-semibold text-gray-700">Files</h2>
            <p className="text-xs text-gray-500">
              Maximum size for new files: 98MB, overall limit: 100MB
            </p>
          </div>
          
          {/* File Manager Box */}
          <div className="border border-gray-300 rounded-sm bg-white mb-4">
            
            {/* Toolbar Atas */}
            <div className="bg-[#f8f9fa] border-b border-gray-300 p-2 flex justify-between items-center text-gray-600">
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-200 rounded text-lg" title="Add file">📄</button>
                <button className="p-1 hover:bg-gray-200 rounded text-lg" title="Create folder">📁</button>
              </div>
              <div className="flex gap-1 border-l border-gray-300 pl-2">
                <button className="p-1 bg-gray-200 rounded" title="Display folder with file icons">🔲</button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Display folder with file details">🔠</button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Display folder as file tree">🌲</button>
              </div>
            </div>

            {/* Folder Path */}
            <div className="p-2 border-b border-gray-200 text-sm text-[#0ea5e9] flex items-center gap-2">
              <span>📁</span> Files
            </div>

            {/* Dropzone Area */}
            <div className="p-4">
              <div className="border-2 border-dashed border-gray-300 bg-white p-16 flex flex-col items-center justify-center text-center transition hover:bg-gray-50">
                <div className="text-blue-400 text-5xl mb-4">⬇️</div>
                <p className="text-sm text-gray-600">
                  You can drag and drop files here to add them.
                </p>
              </div>
            </div>
            
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="bg-[#1565c0] hover:bg-blue-800 text-white text-sm px-5 py-2 transition rounded-sm font-medium">
              Save changes
            </button>
            <button className="bg-[#e9ecef] hover:bg-gray-300 text-gray-700 text-sm px-5 py-2 transition rounded-sm border border-gray-300">
              Cancel
            </button>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-[#eef2f6] border-t border-gray-200 mt-10">
        <div className="py-10 px-8 flex flex-col md:flex-row justify-between items-start relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
          <div className="relative z-10 mb-8 md:mb-0">
            <h3 className="text-[#1565c0] text-xl font-light mb-4">Stay in touch</h3>
            <ul className="space-y-2 text-[#1565c0] text-sm">
              <li className="flex items-center gap-2"><span className="text-gray-400">🌐</span> https://xapiens.id/</li>
              <li className="flex items-center gap-2"><span className="text-gray-400">📞</span> +62 21 29770900</li>
              <li className="flex items-center gap-2"><span className="text-gray-400">✉️</span> hello@xapiens.id</li>
            </ul>
          </div>
          <div className="relative z-10 flex flex-col items-end">
            <div className="flex space-x-1 mb-4">
              {['fb', 'tw', 'in', 'yt', 'ig', 'wa'].map((social) => (
                <div key={social} className="w-7 h-7 flex items-center justify-center text-white text-xs cursor-pointer rounded-sm" style={{backgroundColor: social === 'wa' ? '#25D366' : social === 'yt' ? '#FF0000' : social === 'ig' ? '#C13584' : '#1565c0'}}>
                  {social}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600 mb-3 flex items-center gap-2 cursor-pointer hover:underline">
              <span>📁</span> Data retention summary
            </div>
            <button className="bg-[#1565c0] text-white px-4 py-2 text-sm flex items-center gap-2 hover:bg-blue-800 transition rounded-sm">
              <span>📱</span> Get the mobile app
            </button>
          </div>
        </div>
        <div className="bg-[#f97316] text-white text-center py-3 text-sm font-medium">
          PROUDLY MADE WITH <span className="font-bold">Next.js</span>
          <div className="text-xs font-light mt-1">Made with ❤️ by Xapiens IT</div>
        </div>
      </footer>
    </div>
  );
}