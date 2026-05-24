'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserItem { id: string; name: string; email: string; role: string; }
interface ChapterItem { title: string; summary: string; }
interface QuestionItem { questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: string; }
interface CourseItem { id: string; title: string; description: string; instructorName: string; chapters?: ChapterItem[]; }
interface GradeItem { id: string; user: { name: string; email: string }; course: { title: string }; score: number; isPassed: boolean; createdAt: string; }

export default function SiteAdministrationPage() {
  const { data: session } = useSession(); 
  const loggedInUserRole = (session?.user as any)?.role || 'USER';

  const [activeTab, setActiveTab] = useState('Users');

  // Form User States
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('USER');
  
  // Form Course States
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [courseImage, setCourseImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

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

  useEffect(() => { fetchAdminData(); }, []);

  // Chapter Control Handlers
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

  // Quiz Control Handlers
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, name: userName, password: userPassword, role: userRole }),
      });
      if (res.ok) {
        setMessage({ text: `✅ Berhasil membuat akun user "${userName}".`, isError: false });
        setUserEmail(''); setUserName(''); setUserPassword('');
        fetchAdminData();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      // PERBAIKAN: Mengarah lurus ke endpoint create-course yang baru diaktifkan kawan
      const res = await fetch('/api/admin/create-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDesc,
          instructorName: instructorName,
          imageUrl: courseImage || null,
          videoUrl: videoUrl || null,
          chapters: dynamicChapters,
          questions: dynamicQuestions
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: `🚀 Sukses Besar! Kelas "${courseTitle}" bersama ${dynamicChapters.length} Bab Materi & ${dynamicQuestions.length} Soal Kuis resmi tersimpan di PostgreSQL.`, isError: false });
        await fetchAdminData();
        setCourseTitle(''); setCourseDesc(''); setInstructorName(''); setCourseImage(''); setVideoUrl('');
        setDynamicChapters([{ title: 'Bab 1: Introduction', summary: '' }]);
        setDynamicQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
      } else {
        setMessage({ text: `❌ Gagal Database: ${data.error || 'Kendala parsing data.'}`, isError: true });
      }
    } catch (err) {
      setMessage({ text: '❌ Gangguan koneksi ke API Database.', isError: true });
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
          <h1 className="text-3xl font-light text-[#2b3a4a] mb-4">Site administration</h1>
          <div className="flex text-sm text-gray-500 gap-2">
            <span>Dashboard</span> <span>/</span> <span className="text-gray-800 bg-gray-100 px-2 rounded-sm">Site administration</span>
          </div>
        </div>

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

        {message.text && (
          <div className={`p-3 text-xs font-medium border rounded-sm ${message.isError ? 'bg-red-50 text-red-700 border-red-300' : 'bg-green-50 text-green-700 border-green-300'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm h-fit">
              <h3 className="text-sm font-semibold text-gray-700 uppercase border-b pb-2 mb-4">👤 Add a new user</h3>
              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div><label className="block text-gray-600 mb-1">Full Name</label><input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full border p-2 text-gray-900 bg-white border-gray-300 rounded-sm outline-none" required /></div>
                <div><label className="block text-gray-600 mb-1">Email</label><input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full border p-2 text-gray-900 bg-white border-gray-300 rounded-sm outline-none" required /></div>
                <div><label className="block text-gray-600 mb-1">Password</label><input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="w-full border p-2 text-gray-900 bg-white border-gray-300 rounded-sm outline-none" required /></div>
                <button type="submit" disabled={loading} className="w-full bg-[#1565c0] text-white py-2.5 rounded-sm font-semibold hover:bg-blue-800 transition">Create User</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-sm">
              <h3 className="text-sm font-semibold text-gray-700 uppercase border-b pb-2 mb-4">📋 Active Registered Users</h3>
              <div className="overflow-x-auto text-xs border rounded-sm">
                <table className="w-full text-left">
                  <thead><tr className="bg-gray-50 border-b p-3 text-gray-600 font-semibold"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th></tr></thead>
                  <tbody className="text-gray-800">{usersList.map(u => (<tr key={u.id} className="border-b hover:bg-gray-50"><td className="p-3 font-medium">{u.name}</td><td className="p-3 font-mono text-gray-500">{u.email}</td><td className="p-3"><span className="px-2 bg-blue-100 text-blue-700 rounded-sm text-[10px] font-bold">{u.role}</span></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Courses' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white border border-gray-200 shadow-sm p-6 md:p-8 rounded-sm h-fit">
              <div className="border-b pb-3 mb-6">
                <h2 className="text-xl font-normal text-[#0ea5e9]">📖 Course Database Configuration Form</h2>
                <p className="text-xs text-gray-400 mt-1">Form sinkronisasi data multimedia kelas silabus dan bank soal evaluasi kuis.</p>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-1">Course Title (Judul Kelas)</label>
                    <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="Contoh: Belajar Full-Stack Web Development" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Instructor Name</label>
                    <input type="text" value={instructorName} onChange={(e) => setInstructorName(e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="Contoh: Affandi Abdul Aziz" required />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Course Description</label>
                  <textarea value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} rows={2} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="Tuliskan deskripsi ringkas kelas..." required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sky-50/30 border border-sky-100 p-4 rounded-sm">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Course Cover Image (URL Banner)</label>
                    <input type="url" value={courseImage} onChange={(e) => setCourseImage(e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="https://example.com/cover.png" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Learning Video Stream (URL Video)</label>
                    <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 rounded-sm outline-none font-medium focus:border-[#0ea5e9]" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                </div>

                <div className="border border-sky-200 bg-sky-50/10 p-5 rounded-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-sky-200 pb-2">
                    <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wide">📂 Syllabus Material Chapters Relation</h4>
                    <button type="button" onClick={addChapterField} className="bg-[#0ea5e9] hover:bg-sky-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-sm">➕ Add Chapter Field</button>
                  </div>
                  {dynamicChapters.map((chapter, index) => (
                    <div key={index} className="bg-white p-4 border border-gray-200 rounded-sm space-y-3 shadow-sm relative">
                      <div className="flex justify-between items-center border-b pb-1">
                        <input type="text" value={chapter.title} onChange={(e) => handleChapterChange(index, 'title', e.target.value)} className="text-gray-900 bg-white font-bold text-[12px] border-b border-gray-300 outline-none w-48" />
                        {dynamicChapters.length > 1 && <button type="button" onClick={() => removeChapterField(index)} className="text-red-500 hover:text-red-700 text-[11px] font-medium">❌ Hapus Bab</button>}
                      </div>
                      <input type="text" value={chapter.summary} onChange={(e) => handleChapterChange(index, 'summary', e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 font-medium rounded-sm outline-none focus:border-sky-500" placeholder="Masukkan detail pembahasan bab..." required />
                    </div>
                  ))}
                </div>

                <div className="border border-amber-200 bg-amber-50/10 p-5 rounded-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">📝 Quiz Questions Form Relation</h4>
                    <button type="button" onClick={addQuestionField} className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-smAA">➕ Add Question Field</button>
                  </div>
                  {dynamicQuestions.map((question, index) => (
                    <div key={index} className="bg-white p-4 border border-gray-200 rounded-sm space-y-3 relative shadow-sm">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-semibold text-gray-700 text-[12px]">Butir Pertanyaan #{index + 1}</span>
                        {dynamicQuestions.length > 1 && <button type="button" onClick={() => removeQuestionField(index)} className="text-red-600 hover:text-red-800 text-[11px] font-medium">❌ Hapus Soal</button>}
                      </div>
                      <input type="text" value={question.questionText} onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)} className="w-full border p-2.5 text-gray-900 bg-white border-gray-300 font-medium rounded-sm outline-none focus:border-amber-500" placeholder="Tulis butir soal kuis..." required />
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <input type="text" value={question.optionA} onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)} className="border p-2 text-gray-900 bg-white border-gray-300 rounded-sm font-medium" placeholder="Opsi A" required />
                        <input type="text" value={question.optionB} onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)} className="border p-2 text-gray-900 bg-white border-gray-300 rounded-sm font-medium" placeholder="Opsi B" required />
                        <input type="text" value={question.optionC} onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)} className="border p-2 text-gray-900 bg-white border-gray-300 rounded-sm font-medium" placeholder="Opsi C" required />
                        <input type="text" value={question.optionD} onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)} className="border p-2 text-gray-900 bg-white border-gray-300 rounded-sm font-medium" placeholder="Opsi D" required />
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <span>Kunci Jawaban:</span>
                        <select value={question.correctOption} onChange={(e) => handleQuestionChange(index, 'correctOption', e.target.value)} className="border p-1 bg-white text-gray-900 border-gray-300 text-[11px] rounded-sm font-semibold outline-none">
                          <option value="A">Opsi (A)</option><option value="B">Opsi (B)</option><option value="C">Opsi (C)</option><option value="D">Opsi (D)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="w-full md:w-auto bg-[#1565c0] hover:bg-blue-800 text-white font-bold text-xs px-10 py-3 rounded-sm shadow-md transition uppercase tracking-wide">
                    {loading ? 'Menyimpan...' : '🚀 Submit & Save To Database'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm h-fit">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-4">📚 Active PostgreSQL Courses</h3>
              <div className="space-y-3">
                {coursesList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada kelas di database kawan.</p>
                ) : (
                  coursesList.map(c => (
                    <div key={c.id} className="p-3 border border-gray-200 rounded-sm bg-gray-50/50 text-[11px]">
                      <p className="font-semibold text-cyan-600 text-xs">📖 {c.title}</p>
                      <p className="text-gray-600 font-medium mt-0.5">Instruktur: {c.instructorName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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