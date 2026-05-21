import React from 'react';

export default function CertificatesPage() {
  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* 1. Header & Breadcrumbs */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <h1 className="text-3xl font-light text-[#2b3a4a] mb-4">Xapiens Learning Center</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
            <span className="cursor-pointer hover:underline">Dashboard</span>
            <span>/</span>
            <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded-sm">Certificates</span>
          </div>
        </div>

        {/* 2. Certificates Content */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-light text-[#2b3a4a] mb-1">My certificates</h2>
            <p className="text-lg text-gray-500 font-light">Certificates from all courses</p>
          </div>
          
          {/* Empty State Box */}
          <div className="border border-gray-300 rounded-sm p-4 bg-white text-sm text-gray-700">
            You have no certificates yet.
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