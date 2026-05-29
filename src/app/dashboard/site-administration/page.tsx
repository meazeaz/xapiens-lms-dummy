'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserItem { id: string; name: string; email: string; role: string; }
interface ChapterItem { title: string; summary: string; }
interface QuestionItem { questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: string; }
interface CourseItem { id: string; title: string; description: string; instructorName: string; imageUrl?: string; videoUrl?: string; chapters?: ChapterItem[]; questions?: QuestionItem[]; }
interface GradeItem { id: string; user: { name: string; email: string }; course: { title: string }; score: number; isPassed: boolean; createdAt: string; }

export default function SiteAdministrationPage() {
  const { data: session } = useSession(); 
  const loggedInUserRole = (session?.user as any)?.role || 'USER';
  const loggedInUserId = (session?.user as any)?.id || '';

  const [activeTab, setActiveTab] = useState('Users');

  // Form User States
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('USER');
  
  // USER CRUD STATES
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  // Form Course States
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [courseImage, setCourseImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // COURSE CRUD STATES
  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);

  // Complex Dynamic Array Input States
  const [dynamicChapters, setDynamicChapters] = useState<ChapterItem[]>([
    { title: 'Bab 1: Introduction', summary: '' }
  ]);

  const [dynamicQuestions, setDynamicQuestions] = useState<QuestionItem[]>([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }
  ]);

  // Database Tracking Lists States
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [gradesList, setGradesList] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const tabs = ['Site administration', 'Users', 'Courses', 'Grades'];

  const fetchAdminData = async () => {
    try {
      const resUsers = await fetch('/api/admin/get-users');
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsersList(data.users || []);
      }

      const resCourses = await fetch('/api/admin/get-courses'); 
      if (resCourses.ok) {
        const data = await resCourses.json();
        setCoursesList(data.courses || []);
      }

      setGradesList([
        { id: "g-1", user: { name: "Hanan (Student)", email: "hanan@gmail.com" }, course: { title: "IT Support & Service Management" }, score: 100, isPassed: true, createdAt: new Date().toLocaleDateString('id-ID') }
      ]);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    cancelEditUserMode();
  }, [loggedInUserRole]);

  // =========================================================================
  // HANDLERS UNTUK USER CRUD (EDIT & HAPUS AKUN)
  // =========================================================================
  const startEditUser = (user: UserItem) => {
    setIsEditingUser(true);
    setEditUserId(user.id);
    setUserName(user.name || '');
    setUserEmail(user.email || '');
    setUserRole(user.role || 'USER');
    setUserPassword('');
  };

  const cancelEditUserMode = () => {
    setIsEditingUser(false);
    setEditUserId(null);
    setUserName(''); setUserEmail(''); setUserPassword(''); setUserRole('USER');
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === loggedInUserId) {
      alert('❌ Tindakan Ditolak: Jangan menghapus akun kawan sendiri yang sedang login aktif!');
      return;
    }

    if (!confirm(`Apakah kawan yakin ingin menghapus akun "${name}" secara permanen dari database pgAdmin?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/create-user?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: `🗑️ Sukses menghapus akun pengguna "${name}" dari database PostgreSQL kawan.`, isError: false });
        if (editUserId === id) cancelEditUserMode();
        await fetchAdminData();
      } else {
        setMessage({ text: '❌ Gagal menghapus user dari database.', isError: true });
      }
    } catch (err) {
      setMessage({ text: '❌ Gangguan koneksi menuju server database.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });

    const finalRoleToSend = loggedInUserRole === 'INSTRUCTOR' ? userRole : 'USER';
    const url = '/api/admin/create-user';
    const method = isEditingUser ? 'PUT' : 'POST';
    
    const payload = isEditingUser 
      ? { id: editUserId, email: userEmail, name: userName, password: userPassword, role: finalRoleToSend }
      : { email: userEmail, name: userName, password: userPassword, role: finalRoleToSend };

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ 
          text: isEditingUser 
            ? `💾 Sukses! Perubahan profil akun "${userName}" berhasil disimpan ke PostgreSQL kawan.`
            : `✅ Berhasil mendaftarkan akun "${finalRoleToSend}" untuk kawan "${userName}" di database.`, 
          isError: false 
        });
        cancelEditUserMode();
        await fetchAdminData();
      } else {
        setMessage({ text: `❌ Gagal: ${data.error || 'Terjadi kendala.'}`, isError: true });
      }
    } catch (err) { 
      setMessage({ text: '❌ Gangguan koneksi ke API Server.', isError: true });
    } finally { setLoading(false); }
  };

  // =========================================================================
  // HANDLERS UNTUK COURSE CRUD
  // =========================================================================
  const addChapterField = () => {
    setDynamicChapters([...dynamicChapters, { title: `Bab ${dynamicChapters.length + 1}: `, summary: '' }]);
  };
  const removeChapterField = (idx: number) => {
    if (dynamicChapters.length === 1) return;
    setDynamicChapters(dynamicChapters.filter((_, i) => i !== idx));
  };
  const handleChapterChange = (index: number, field: keyof ChapterItem, value: string) => {
    const updated = [...dynamicChapters];
    updated[index][field] = value;
    setDynamicChapters(updated);
  };

  const addQuestionField = () => {
    setDynamicQuestions([...dynamicQuestions, { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
  };
  const removeQuestionField = (idx: number) => {
    if (dynamicQuestions.length === 1) return;
    setDynamicQuestions(dynamicQuestions.filter((_, i) => i !== idx));
  };
  const handleQuestionChange = (index: number, field: keyof QuestionItem, value: string) => {
    const updated = [...dynamicQuestions];
    updated[index][field] = value;
    setDynamicQuestions(updated);
  };

  const startEditCourse = (course: CourseItem) => {
    setIsEditing(true);
    setEditCourseId(course.id);
    
    setCourseTitle(course.title || '');
    setCourseDesc(course.description || '');
    setInstructorName(course.instructorName || '');
    setCourseImage(course.imageUrl || ''); 
    setVideoUrl(course.videoUrl || '');

    if (course.chapters && course.chapters.length > 0) {
      setDynamicChapters(course.chapters.map(ch => ({ 
        title: ch.title || '', 
        summary: ch.summary || '' 
      })));
    } else {
      setDynamicChapters([{ title: 'Bab 1: Introduction', summary: '' }]);
    }

    if (course.questions && course.questions.length > 0) {
      setDynamicQuestions(course.questions.map(q => ({
        questionText: q.questionText || '',
        optionA: q.optionA || '',
        optionB: q.optionB || '',
        optionC: q.optionC || '',
        optionD: q.optionD || '',
        correctOption: q.correctOption || 'A'
      })));
    } else {
      setDynamicQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Apakah kawan yakin ingin menghapus kelas "${title}" secara permanen dari database pgAdmin?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/create-course?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: `🗑️ Sukses menghapus kelas "${title}" dari database PostgreSQL.`, isError: false });
        if (editCourseId === id) cancelEditMode();
        await fetchAdminData();
      } else {
        setMessage({ text: '❌ Gagal menghapus kelas dari database.', isError: true });
      }
    } catch (err) {
      setMessage({ text: '❌ Gangguan jaringan database.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const cancelEditMode = () => {
    setIsEditing(false);
    setEditCourseId(null);
    setCourseTitle(''); setCourseDesc(''); setInstructorName(''); setCourseImage(''); setVideoUrl('');
    setDynamicChapters([{ title: 'Bab 1: Introduction', summary: '' }]);
    setDynamicQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
  };

  const handleFormCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });

    const url = '/api/admin/create-course';
    const method = isEditing ? 'PUT' : 'POST';
    const payload = {
      id: editCourseId,
      title: courseTitle,
      description: courseDesc,
      instructorName: instructorName,
      imageUrl: courseImage || null,
      videoUrl: videoUrl || null,
      chapters: dynamicChapters,
      questions: dynamicQuestions
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          text: isEditing 
            ? `💾 Sukses Memperbarui! Perubahan kelas "${courseTitle}" telah aman disimpan ke database pgAdmin kawan.` 
            : `🚀 Sukses Besar! Kelas "${courseTitle}" bersama kurikulum lengkapnya resmi diluncurkan ke database PostgreSQL kawan.`, 
          isError: false 
        });

        cancelEditMode();
        await fetchAdminData();
      } else {
        setMessage({ text: `❌ Gagal Database: ${data.error || 'Kendala sinkronisasi.'}`, isError: true });
      }
    } catch (err) {
      setMessage({ text: '❌ Gangguan koneksi ke server database kawan.', isError: true });
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* HEADER COMPONENT */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
          <h1 className="text-3xl font-light text-[#2b3a4a] mb-4">Site administration</h1>
          <div className="flex text-sm text-gray-500 gap-2">
            <span>Dashboard</span> <span>/</span> <span className="text-gray-800 bg-gray-100 px-2 rounded-sm">Site administration</span>
          </div>
        </div>

        {/* TABS CONFIGURATION BAR */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex space-x-6 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button 
                key={tab} type="button" disabled={tab === 'Site administration'} onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition ${
                  tab === 'Site administration' ? 'text-gray-400 font-bold border-transparent mr-4' :
                  activeTab === tab ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* STATE TOAST FEEDBACK NOTIFICATION */}
        {message.text && (
          <div className={`p-3 text-xs font-medium border rounded-sm ${message.isError ? 'bg-red-50 text-red-700 border-red-300' : 'bg-green-50 text-green-700 border-green-300'}`}>
            {message.text}
          </div>
        )}

        {/* TAB MENU 1: USERS */}
        {activeTab === 'Users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm h-fit">
              
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase">
                  {isEditingUser ? '📝 Edit Profile Account' : '👤 Add a new user'}
                </h3>
                {isEditingUser && (
                  <button type="button" onClick={cancelEditUserMode} className="text-red-500 hover:underline text-[11px] font-bold cursor-pointer">
                    ✕ Batal
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
                <div><label className="block text-gray-600 mb-1">Full Name</label><input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full border p-2 text-gray-900 bg-white border-gray-300 rounded-sm outline-none" required /></div>
                <div><label className="block text-gray-600 mb-1">Email</label><input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full border p-2 text-gray-900 bg-white border-gray-300 rounded-sm outline-none" required /></div>
                
                <div>
                  <label className="block text-gray-600 mb-1">
                    Password {isEditingUser && <span className="text-amber-600 font-normal">(Isi hanya jika ingin ganti)</span>}
                  </label>
                  <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="w-full border p-2 text-gray-900 bg-white border-gray-300 rounded-sm outline-none" placeholder={isEditingUser ? "••••••••" : ""} required={!isEditingUser} />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1 font-semibold">Account Role Level (Otoritas)</label>
                  {loggedInUserRole === 'INSTRUCTOR' ? (
                    <select 
                      value={userRole} 
                      onChange={(e) => setUserRole(e.target.value)} 
                      className="w-full border p-2 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium cursor-pointer focus:border-[#0ea5e9]"
                    >
                      <option value="USER">👤 STUDENT / REGULAR USER</option>
                      <option value="ADMIN">⚙️ SUPER ADMIN (PENGELOLA)</option>
                      <option value="INSTRUCTOR">👨‍🏫 INSTRUCTOR / OWNER</option>
                    </select>
                  ) : (
                    <select value="USER" disabled className="w-full border p-2 text-gray-400 bg-gray-50 border-gray-200 rounded-sm outline-none font-medium cursor-not-allowed">
                      <option value="USER">👤 STUDENT / REGULAR USER (Locked)</option>
                    </select>
                  )}
                  <p className="text-[10px] text-gray-400 font-light mt-1.5 leading-relaxed">
                    {loggedInUserRole === 'INSTRUCTOR' 
                      ? '✓ Skenario Instruktur: Anda memiliki wewenang tertinggi untuk menunjuk pendaftar biasa, pengelola, maupun sesama pengawas kelas kawan.' 
                      : '✕ Skenario Admin: Level kewenangan Anda dibatasi murni untuk mencetak akun Regular User (Murid) saja kawan.'}
                  </p>
                </div>

                <button type="submit" disabled={loading} className={`w-full py-2.5 rounded-sm font-semibold text-white transition cursor-pointer uppercase text-[11px] tracking-wider ${isEditingUser ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#1565c0] hover:bg-blue-800'}`}>
                  {loading ? 'Memproses...' : isEditingUser ? '💾 Update User Account' : 'Create User Account'}
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-sm">
              <h3 className="text-sm font-semibold text-gray-700 uppercase border-b pb-2 mb-4">📋 Active Registered Users</h3>
              <div className="overflow-x-auto text-xs border rounded-sm">
                <table className="w-full text-left">
                  <thead><tr className="bg-gray-50 border-b p-3 text-gray-600 font-semibold"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3 text-right">Actions</th></tr></thead>
                  <tbody className="text-gray-800">
                    {usersList.map(u => {
                      const isActionAllowed = 
                        u.id !== loggedInUserId && 
                        (loggedInUserRole === 'INSTRUCTOR' || (loggedInUserRole === 'ADMIN' && u.role === 'USER'));

                      return (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{u.name} {u.id === loggedInUserId && <span className="text-gray-400 text-[10px] font-normal">(You)</span>}</td>
                          <td className="p-3 font-mono text-gray-500">{u.email}</td>
                          <td className="p-3"><span className="px-2 bg-blue-100 text-blue-700 rounded-sm text-[10px] font-bold">{u.role}</span></td>
                          
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {isActionAllowed ? (
                              <>
                                <button type="button" onClick={() => startEditUser(u)} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 rounded-sm text-[10px] font-semibold hover:bg-amber-100 transition cursor-pointer">
                                  📝 Edit
                                </button>
                                <button type="button" onClick={() => handleDeleteUser(u.id, u.name)} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-sm text-[10px] font-semibold hover:bg-red-100 transition cursor-pointer">
                                  🗑️ Hapus
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 italic text-[10px] pr-2 select-none">No Privileges</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB MENU 2: COURSES */}
        {activeTab === 'Courses' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white border border-gray-200 shadow-sm p-6 md:p-8 rounded-sm h-fit">
              <div className="border-b pb-3 mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-normal text-[#0ea5e9]">{isEditing ? '📝 Edit Existing Database Course' : '📖 Course Database Configuration Form'}</h2>
                  <p className="text-xs text-gray-400 mt-1">{isEditing ? 'Kamu sedang mengubah data kelas. Sekali di-update data lama akan langsung disesuaikan kawan.' : 'Form sinkronisasi data multimedia kelas silabus dan bank soal evaluasi kuis.'}</p>
                </div>
                {isEditing && <button type="button" onClick={cancelEditMode} className="bg-gray-500 hover:bg-gray-600 text-white font-bold text-xs px-4 py-2 rounded-sm shadow-sm transition cursor-pointer">✕ Batalkan Edit</button>}
              </div>

              <form onSubmit={handleFormCourseSubmit} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2"><label className="block text-gray-700 font-semibold mb-1">Course Title (Judul Kelas)</label><input type="text" value={courseTitle || ''} onChange={(e) => setCourseTitle(e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="Contoh: Belajar Full-Stack Web Development" required /></div>
                  <div><label className="block text-gray-700 font-semibold mb-1">Instructor Name</label><input type="text" value={instructorName || ''} onChange={(e) => setInstructorName(e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="Contoh: Affandi Abdul Aziz" required /></div>
                </div>
                <div><label className="block text-gray-700 font-semibold mb-1">Course Description</label><textarea value={courseDesc || ''} onChange={(e) => setCourseDesc(e.target.value)} rows={2} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="Tuliskan deskripsi ringkas kelas..." required /></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sky-50/30 border border-sky-100 p-4 rounded-sm">
                  <div><label className="block text-gray-700 font-semibold mb-1">Course Cover Image (URL Banner)</label><input type="url" value={courseImage || ''} onChange={(e) => setCourseImage(e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="https://example.com/cover.png" /></div>
                  <div><label className="block text-gray-700 font-semibold mb-1">Learning Video Stream (URL Video)</label><input type="url" value={videoUrl || ''} onChange={(e) => setVideoUrl(e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="https://youtube.com/watch?v=..." /></div>
                </div>

                <div className="border border-sky-200 bg-sky-50/10 p-5 rounded-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-sky-200 pb-2"><h4 className="text-xs font-bold text-sky-800 uppercase tracking-wide">📂 Syllabus Material Chapters Relation</h4><button type="button" onClick={addChapterField} className="bg-[#0ea5e9] hover:bg-sky-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-sm cursor-pointer">➕ Add Chapter Field</button></div>
                  {dynamicChapters.map((chapter, index) => (
                    <div key={index} className="bg-white p-4 border border-gray-200 rounded-sm space-y-3 shadow-sm relative">
                      <div className="flex justify-between items-center border-b pb-1">
                        <input type="text" value={chapter.title || ''} onChange={(e) => handleChapterChange(index, 'title', e.target.value)} className="text-gray-900 bg-white font-bold text-[12px] border-b border-gray-300 outline-none w-48" />
                        {dynamicChapters.length > 1 && <button type="button" onClick={() => removeChapterField(index)} className="text-red-500 hover:text-red-700 text-[11px] font-medium cursor-pointer">❌ Hapus Bab</button>}
                      </div>
                      <input type="text" value={chapter.summary || ''} onChange={(e) => handleChapterChange(index, 'summary', e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 font-medium rounded-sm outline-none focus:border-sky-500" placeholder="Masukkan detail pembahasan bab..." required />
                    </div>
                  ))}
                </div>

                <div className="border border-amber-200 bg-amber-50/10 p-5 rounded-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-amber-200 pb-2"><h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">📝 Quiz Questions Form Relation</h4><button type="button" onClick={addQuestionField} className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-sm cursor-pointer">➕ Add Question Field</button></div>
                  {dynamicQuestions.map((question, index) => (
                    <div key={index} className="bg-white p-4 border border-gray-200 rounded-sm space-y-3 relative shadow-sm">
                      <div className="flex justify-between items-center border-b pb-1"><span className="font-semibold text-gray-700 text-[12px]">Butir Pertanyaan #{index + 1}</span>{dynamicQuestions.length > 1 && <button type="button" onClick={() => removeQuestionField(index)} className="text-red-600 hover:text-red-800 text-[11px] font-medium cursor-pointer">❌ Hapus Soal</button>}</div>
                      <input type="text" value={question.questionText || ''} onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 font-medium rounded-sm outline-none focus:border-amber-500" placeholder="Tulis butir soal kuis..." required />
                      
                      {/* AMAN: MEMANGGIL HANDLEQUESTIONCHANGE SECARA TEPAT KAWAN */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <input type="text" value={question.optionA || ''} onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)} className="border p-2 text-gray-900 bg-white border-gray-300 rounded-sm font-medium" placeholder="Opsi A" required />
                        <input type="text" value={question.optionB || ''} onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)} className="border p-2 text-gray-900 bg-white border-gray-300 rounded-sm font-medium" placeholder="Opsi B" required />
                        <input type="text" value={question.optionC || ''} onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)} className="border p-2 text-gray-900 bg-white border-gray-300 rounded-sm font-medium" placeholder="Opsi C" required />
                        <input type="text" value={question.optionD || ''} onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)} className="border p-2 text-gray-900 bg-white border-gray-300 rounded-sm font-medium" placeholder="Opsi D" required />
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700 font-medium"><span>Kunci Jawaban:</span><select value={question.correctOption} onChange={(e) => handleQuestionChange(index, 'correctOption', e.target.value)} className="border p-1 bg-white text-gray-900 border-gray-300 text-[11px] rounded-sm font-semibold outline-none cursor-pointer"><option value="A">Opsi (A)</option><option value="B">Opsi (B)</option><option value="C">Opsi (C)</option><option value="D">Opsi (D)</option></select></div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end"><button type="submit" disabled={loading} className={`w-full md:w-auto font-bold text-xs px-10 py-3 rounded-sm shadow-md transition uppercase tracking-wide text-white cursor-pointer ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#1565c0] hover:bg-blue-800'}`}>{loading ? 'Proses Sinkronisasi...' : isEditing ? '💾 Update Course Data' : '🚀 Submit & Save To Database'}</button></div>
              </form>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm h-fit">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-4">📚 Active PostgreSQL Courses</h3>
              <div className="space-y-3">
                {coursesList.length === 0 ? (<p className="text-xs text-gray-400 italic">Belum ada kelas di database kawan.</p>) : (
                  coursesList.map(c => (
                    <div key={c.id} className="p-3 border border-gray-200 rounded-sm bg-gray-50/50 text-[11px] flex flex-col justify-between gap-3 shadow-sm">
                      <div><p className="font-semibold text-cyan-600 text-xs truncate">📖 {c.title}</p><p className="text-gray-500 font-medium mt-0.5">Instruktur: {c.instructorName || 'Belum Diatur'}</p></div>
                      <div className="flex items-center gap-2 border-t pt-2 justify-end">
                        <button type="button" onClick={() => startEditCourse(c)} className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 border border-amber-300 text-amber-700 rounded-sm shadow-xs hover:bg-amber-100 transition cursor-pointer">📝 Edit</button>
                        <button type="button" onClick={() => handleDeleteCourse(c.id, c.title)} className="px-2.5 py-1 text-[10px] font-bold bg-red-50 border border-red-300 text-red-700 rounded-sm shadow-xs hover:bg-red-100 transition cursor-pointer">🗑️ Hapus</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB MENU 3: GRADES */}
        {activeTab === 'Grades' && (
          <div className="bg-white border border-gray-200 p-6 rounded-sm">
            <h3 className="text-lg font-normal text-gray-800 border-b pb-2 mb-4">📊 Student Quiz Competency Ledger</h3>
            <div className="overflow-x-auto text-xs border rounded-sm">
              <table className="w-full text-left">
                <thead><tr className="bg-gray-50 border-b p-3 text-gray-600 font-semibold"><th className="p-3">Student Name</th><th className="p-3">Course Title</th><th className="p-3 text-center">Score</th><th className="p-3 text-center">Status</th></tr></thead>
                <tbody className="text-gray-800">{gradesList.map(g => (
                  <tr key={g.id} className="border-b hover:bg-gray-50"><td className="p-3 font-medium">{g.user.name}</td><td className="p-3 font-medium">{g.course.title}</td><td className="p-3 text-center font-bold">{g.score} / 100</td><td className="p-3 text-center"><span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-sm">PASSED</span></td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}