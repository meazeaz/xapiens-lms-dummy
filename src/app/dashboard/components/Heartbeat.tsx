'use client';

import { useEffect } from 'react';

export default function Heartbeat() {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/auth/heartbeat', { method: 'POST' });
      } catch (err) {
        console.error('Gagal mengirim sinyal aktif kawan:', err);
      }
    };

    // Kirim sinyal pertama kali saat halaman dimuat
    sendHeartbeat();

    // Kirim sinyal otomatis setiap 30 detik
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, []);

  return null; // Komponen ini gaib kawan, tidak merender UI apa pun
}