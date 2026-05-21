  'use client';

  import { signIn } from 'next-auth/react';
  import { useRouter } from 'next/navigation';
  import React from 'react';

  export default function DashboardContent() {
    return (
      <div className="flex flex-col min-h-full">
        {/* KONTEN UTAMA */}
        <div className="p-4 md:p-8 space-y-6 flex-grow">
          
          {/* Profile Card */}
          <div className="bg-white border border-gray-200 shadow-sm p-6 relative">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-4xl">
                👤
              </div>
              <div>
                <h1 className="text-2xl font-light text-gray-800 flex items-center gap-3">
                  XTI LMS: Dashboard 
                  <span className="text-sm text-gray-500 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                    💬 Message
                  </span>
                </h1>
              </div>
            </div>
            <button className="absolute top-6 right-6 bg-gray-200 text-gray-700 px-4 py-2 text-sm hover:bg-gray-300 transition">
              Customise this page
            </button>
          </div>

          {/* Recently Accessed Courses */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <h2 className="text-lg text-gray-700 font-normal">Recently accessed courses</h2>
            </div>
            <div className="p-16 flex flex-col items-center justify-center text-gray-400">
              <div className="text-5xl mb-3">🏢</div>
              <p className="text-sm">No recent courses</p>
            </div>
          </div>

          {/* Course Overview */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg text-gray-700 font-normal">Course overview</h2>
            </div>
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2">
              {/* Filters */}
              <select className="border border-gray-300 text-gray-600 px-3 py-1.5 text-sm bg-white outline-none">
                <option>Y All (except removed from view)</option>
              </select>
              <div className="flex-grow"></div>
              <select className="border border-gray-300 text-gray-600 px-3 py-1.5 text-sm bg-white outline-none">
                <option>⬇ Course name</option>
              </select>
              <select className="border border-gray-300 text-gray-600 px-3 py-1.5 text-sm bg-white outline-none">
                <option>🔲 Card</option>
              </select>
            </div>
            <div className="p-24 flex flex-col items-center justify-center text-gray-400">
              <div className="text-5xl mb-3">🏢</div>
              <p className="text-sm">No courses</p>
            </div>
          </div>

        </div>

        {/* FOOTER DI DALAM DASHBOARD */}
        <footer className="bg-[#eef2f6] border-t border-gray-200 mt-10">
          <div className="py-10 px-8 flex flex-col md:flex-row justify-between items-start relative overflow-hidden">
            {/* Background watermark effect (opsional) */}
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