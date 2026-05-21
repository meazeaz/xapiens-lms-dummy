'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // <-- Import NextAuth ditambahkan

export default function LandingAndLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // <-- Tambahan state loading

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Memanggil backend NextAuth (Prisma/PostgreSQL)
    const res = await signIn('credentials', {
      redirect: false,
      email: username,   // Kita pakai 'username' dari form sebagai input email pgAdmin
      password: password,
    });

    if (res?.error) {
      // Jika pgAdmin menolak / data tidak cocok
      setError('Nama pengguna atau kata sandi salah!');
      setIsLoading(false);
    } else {
      // Jika pgAdmin menerima (Login Berhasil)
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* TOP NAVBAR */}
      <nav className="h-14 bg-[#0a0a0a] text-white flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold tracking-widest flex items-center">
            <span className="text-[#0ea5e9] mr-1">^</span>XAPIENS
          </div>
        </div>
        <div className="flex items-center space-x-5 text-gray-300 text-sm">
          <button className="hover:text-white">🌐</button>
          <button className="hover:text-white">🔔</button>
          <button className="hover:text-white">💬</button>
          <div className="w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">👤</span>
          </div>
        </div>
      </nav>

      {/* HERO SECTION & LOGIN BOX */}
      <section className="relative bg-slate-800 text-white py-16 px-4 sm:px-12 lg:px-24 flex flex-col md:flex-row items-center justify-between min-h-[500px]">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

        {/* Left Content: Typography */}
        <div className="relative z-10 w-full md:w-7/12 mb-10 md:mb-0 pr-0 md:pr-10">
          <h1 className="text-4xl md:text-5xl font-light mb-6">Xapiens Learning Center</h1>
          <p className="text-lg md:text-xl leading-relaxed text-gray-200">
            At our core, Xapiens is about helping Clients meet their business challenges and improve their performance. 
            Because of our history, which saw Xapiens grow organically in response to Client needs, we are very Client-focused 
            in our work processes. We evaluate all of our offerings in terms of whether they will advance your business as our end goal.
          </p>
        </div>

        {/* Right Content: Login Box */}
        <div className="relative z-10 w-full md:w-4/12 max-w-md">
          <div className="bg-white text-slate-800 p-8 rounded-sm shadow-2xl">
            <h2 className="text-2xl font-light mb-4 text-gray-700">Access to the platform</h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nama Pengguna</label>
                <div className="flex border border-gray-300 rounded bg-[#e8f0fe]">
                  <span className="p-3 text-gray-500 border-r border-gray-300 bg-gray-50">✉️</span>
                  <input 
                    type="email" // <-- Diubah ke email sesuai format akun di pgAdmin
                    placeholder="admin@gmail.com" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 outline-none bg-transparent text-sm text-gray-800" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <div className="flex border border-gray-300 rounded bg-[#e8f0fe]">
                  <span className="p-3 text-gray-500 border-r border-gray-300 bg-gray-50">🔒</span>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 outline-none bg-transparent text-sm text-gray-800" 
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full text-white py-2 px-6 transition font-medium text-center rounded-sm shadow-md ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1565c0] hover:bg-blue-800'}`}
                >
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-xs text-center text-gray-400">
              Pendaftaran akun baru hanya dapat dilakukan oleh Administrator / Instruktur.
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR INFO CARDS */}
      <section className="py-16 px-4 sm:px-12 lg:px-24 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-gray-200 p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-[#1565c0] rounded-full flex items-center justify-center mb-4 text-xl">👥</div>
            <h3 className="text-xl font-light mb-4">We are</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow">Obsessed with Client service. What matters to our Clients, matters most to us.</p>
            <button className="bg-[#1565c0] text-white px-6 py-2 text-sm hover:bg-blue-800 transition">Read More</button>
          </div>
          <div className="border border-gray-200 p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-[#1565c0] rounded-full flex items-center justify-center mb-4 text-xl">🎯</div>
            <h3 className="text-xl font-light mb-4">We Aim</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow">We aim all ours efforts at the Client's business impact, user experience, and speed: bigger, better, faster.</p>
            <button className="bg-[#1565c0] text-white px-6 py-2 text-sm hover:bg-blue-800 transition">Read More</button>
          </div>
          <div className="border border-gray-200 p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-[#1565c0] rounded-full flex items-center justify-center mb-4 text-xl">🛠️</div>
            <h3 className="text-xl font-light mb-4">We Do</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow">We do amazing things. When we work together.</p>
            <button className="bg-[#1565c0] text-white px-6 py-2 text-sm hover:bg-blue-800 transition">Read More</button>
          </div>
          <div className="border border-gray-200 p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-[#1565c0] rounded-full flex items-center justify-center mb-4 text-xl">🚀</div>
            <h3 className="text-xl font-light mb-4">We Never Settle</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow">We never settle in making ourselves and our services better. By learning and innovating every day.</p>
            <button className="bg-[#1565c0] text-white px-6 py-2 text-sm hover:bg-blue-800 transition">Read More</button>
          </div>
        </div>
      </section>

      {/* 4. KATEGORI KURSUS */}
      <section className="py-12 px-4 sm:px-12 lg:px-24 bg-white border-t border-gray-100 flex-grow">
        <div className="flex items-center justify-center mb-10">
          <div className="h-[1px] w-24 bg-[#1565c0]"></div>
          <h2 className="text-2xl text-[#1565c0] mx-4 font-light">Kategori kursus</h2>
          <div className="h-[1px] w-24 bg-[#1565c0]"></div>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-3 text-lg text-[#1565c0]">
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span className="text-gray-400 text-sm">▹</span> Business Support Department <span className="text-sm text-gray-500 no-underline">(2)</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span className="text-gray-400 text-sm">▹</span> Digital Services Department
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span className="text-gray-400 text-sm">▹</span> General Xapiens Knowledge <span className="text-sm text-gray-500 no-underline">(6)</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span className="text-gray-400 text-sm">▹</span> Infrastructure & Cloud Service <span className="text-sm text-gray-500 no-underline">(2)</span>
          </div>
          <div className="pl-4">
            <div className="flex items-center gap-2 cursor-pointer hover:underline mb-2 font-semibold">
              <span className="text-gray-500 text-sm">▾</span> Managed Service Department
            </div>
            <div className="pl-6 space-y-2 text-base">
              <div className="flex items-center gap-2 cursor-pointer hover:underline font-bold text-cyan-600">
                <span className="text-cyan-600 text-sm">▹</span> IT Support & Service Management <span className="text-sm text-gray-500 font-normal">(Sertifikasi Tugas Akhir)</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:underline">
                <span className="text-gray-400 text-sm">▹</span> Technical Operation Center
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATS SECTION */}
      <section className="bg-[#1e88e5] text-white py-16 px-4 sm:px-12 flex flex-col md:flex-row items-center justify-around">
        <h2 className="text-3xl font-light text-[#f59e0b] mb-10 md:mb-0 text-center w-full md:w-1/4">BEBERAPA<br/>ANGKA</h2>
        <div className="flex flex-col md:flex-row w-full md:w-3/4 justify-around items-center space-y-10 md:space-y-0">
          <div className="flex flex-col items-center text-center">
            <div className="text-5xl mb-2">👤</div>
            <div className="text-2xl font-bold mb-2">247</div>
            <div className="border-t border-blue-300 pt-2 w-32 text-sm tracking-wider">PESERTA</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-5xl mb-2">🎓</div>
            <div className="text-2xl font-bold mb-2">33</div>
            <div className="border-t border-blue-300 pt-2 w-32 text-sm tracking-wider">KURSUS</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-5xl mb-2">🧩</div>
            <div className="text-2xl font-bold mb-2">412</div>
            <div className="border-t border-blue-300 pt-2 w-32 text-sm tracking-wider">AKTIVITAS</div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-100 flex flex-col">
        <div className="py-12 px-4 sm:px-12 lg:px-24 flex flex-col md:flex-row justify-between items-start border-b border-gray-200">
          <div>
            <h3 className="text-[#1565c0] text-2xl font-light mb-4">Stay in touch</h3>
            <ul className="space-y-3 text-[#1565c0] text-sm">
              <li>🌐 https://xapiens.id/</li>
              <li>📞 +62 21 29770900</li>
              <li>✉️ hello@xapiens.id</li>
            </ul>
          </div>
          <div className="text-xs text-gray-500 mt-6 md:mt-0">
            © 2026 PT Xapiens Teknologi Indonesia. All Rights Reserved.
          </div>
        </div>
        <div className="bg-[#f97316] text-white text-center py-4 text-sm font-medium">
          PROUDLY POWERED BY <span className="font-bold">NEXT.JS (CSR & SSR)</span>
        </div>
      </footer>
    </div>
  );
}