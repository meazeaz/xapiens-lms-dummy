'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserItem { id: string; name: string; email: string; role: string; }

export default function UsersTab() {
  const { data: session } = useSession(); 
  const loggedInUserRole = (session?.user as any)?.role || 'USER';
  const loggedInUserId = (session?.user as any)?.id || '';

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('USER');
  
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/get-users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { cancelEditUserMode(); }, [loggedInUserRole]);

  const startEditUser = (user: UserItem) => {
    setIsEditingUser(true); setEditUserId(user.id);
    setUserName(user.name || ''); setUserEmail(user.email || ''); setUserRole(user.role || 'USER'); setUserPassword(''); 
  };

  const cancelEditUserMode = () => {
    setIsEditingUser(false); setEditUserId(null);
    setUserName(''); setUserEmail(''); setUserPassword(''); setUserRole('USER');
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === loggedInUserId) return alert('❌ Tindakan Ditolak: Jangan menghapus akun kawan sendiri!');
    if (!confirm(`Hapus akun "${name}" secara permanen?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/create-user?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: `🗑️ Sukses menghapus pengguna "${name}".`, isError: false });
        if (editUserId === id) cancelEditUserMode();
        await fetchUsers();
      } else setMessage({ text: '❌ Gagal menghapus user.', isError: true });
    } catch (err) { setMessage({ text: '❌ Gangguan koneksi server.', isError: true });
    } finally { setLoading(false); }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage({ text: '', isError: false });
    const finalRoleToSend = loggedInUserRole === 'SUPER_ADMIN' ? userRole : 'USER';
    const payload = isEditingUser ? { id: editUserId, email: userEmail, name: userName, password: userPassword, role: finalRoleToSend } : { email: userEmail, name: userName, password: userPassword, role: finalRoleToSend };

    try {
      const res = await fetch('/api/admin/create-user', { method: isEditingUser ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setMessage({ text: isEditingUser ? `💾 Sukses! Akun diperbarui.` : `✅ Berhasil mendaftarkan akun.`, isError: false });
        cancelEditUserMode(); await fetchUsers();
      } else setMessage({ text: `❌ Gagal menyimpan data.`, isError: true });
    } catch (err) { setMessage({ text: '❌ Gangguan koneksi API.', isError: true });
    } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Kolom Kiri: Form */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm h-fit">
        {message.text && <div className={`p-3 text-xs mb-4 border rounded-sm ${message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase">{isEditingUser ? '📝 Edit Account' : '👤 Add a new user'}</h3>
          {isEditingUser && <button onClick={cancelEditUserMode} className="text-red-500 hover:underline text-[11px] font-bold">✕ Batal</button>}
        </div>
        <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
          <div><label className="block text-gray-600 mb-1">Full Name</label><input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full border p-2 bg-white rounded-sm outline-none" required /></div>
          <div><label className="block text-gray-600 mb-1">Email</label><input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full border p-2 bg-white rounded-sm outline-none" required /></div>
          <div><label className="block text-gray-600 mb-1">Password {isEditingUser && <span className="text-amber-600">(Isi jika ganti)</span>}</label><input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="w-full border p-2 bg-white rounded-sm outline-none" required={!isEditingUser} /></div>
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Account Role</label>
            {loggedInUserRole === 'SUPER_ADMIN' ? (
              <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="w-full border p-2 bg-white rounded-sm outline-none cursor-pointer">
                <option value="USER">👤 STUDENT</option><option value="ADMIN">⚙️ ADMIN</option><option value="SUPER_ADMIN">👑 SUPER ADMIN</option>
              </select>
            ) : (<select disabled className="w-full border p-2 bg-gray-50 text-gray-400 rounded-sm cursor-not-allowed"><option>👤 STUDENT (Locked)</option></select>)}
          </div>
          <button type="submit" disabled={loading} className={`w-full py-2.5 rounded-sm font-semibold text-white uppercase text-[11px] tracking-wider ${isEditingUser ? 'bg-emerald-600' : 'bg-[#1565c0]'}`}>{loading ? 'Memproses...' : isEditingUser ? 'Update User' : 'Create User'}</button>
        </form>
      </div>

      {/* Kolom Kanan: Tabel */}
      <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-sm">
        <h3 className="text-sm font-semibold text-gray-700 uppercase border-b pb-2 mb-4">📋 Active Registered Users</h3>
        <div className="overflow-x-auto text-xs border rounded-sm">
          <table className="w-full text-left">
            <thead><tr className="bg-gray-50 border-b p-3 text-gray-600 font-semibold"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {usersList.map(u => {
                const isAllowed = u.id !== loggedInUserId && (loggedInUserRole === 'SUPER_ADMIN' || (loggedInUserRole === 'ADMIN' && u.role === 'USER'));
                return (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 font-mono text-gray-500">{u.email}</td>
                    <td className="p-3"><span className="px-2 bg-blue-100 text-blue-700 rounded-sm text-[10px] font-bold">{u.role}</span></td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {isAllowed ? (
                        <><button onClick={() => startEditUser(u)} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 rounded-sm text-[10px] font-semibold mr-1">📝 Edit</button>
                        <button onClick={() => handleDeleteUser(u.id, u.name)} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-sm text-[10px] font-semibold">🗑️ Hapus</button></>
                      ) : (<span className="text-gray-400 italic text-[10px]">Locked</span>)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}