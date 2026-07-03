'use client';

import React, { useState, useEffect } from 'react';

interface ChapterItem { title: string; summary: string; }
interface QuestionItem { questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: string; }
interface CourseItem { id: string; title: string; description: string; instructorName: string; imageUrl?: string; videoUrl?: string; chapters?: ChapterItem[]; questions?: QuestionItem[]; }

export default function CoursesTab() {
  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [courseImage, setCourseImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);

  const [dynamicChapters, setDynamicChapters] = useState<ChapterItem[]>([{ title: 'Bab 1: Introduction', summary: '' }]);
  const [dynamicQuestions, setDynamicQuestions] = useState<QuestionItem[]>([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/get-courses');
      if (res.ok) { const data = await res.json(); setCoursesList(data.courses || []); }
    } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchCourses(); }, []);

  const addChapterField = () => setDynamicChapters([...dynamicChapters, { title: `Bab ${dynamicChapters.length + 1}: `, summary: '' }]);
  const removeChapterField = (idx: number) => { if (dynamicChapters.length > 1) setDynamicChapters(dynamicChapters.filter((_, i) => i !== idx)); };
  const handleChapterChange = (index: number, field: keyof ChapterItem, value: string) => { const updated = [...dynamicChapters]; updated[index][field] = value; setDynamicChapters(updated); };

  const addQuestionField = () => setDynamicQuestions([...dynamicQuestions, { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
  const removeQuestionField = (idx: number) => { if (dynamicQuestions.length > 1) setDynamicQuestions(dynamicQuestions.filter((_, i) => i !== idx)); };
  const handleQuestionChange = (index: number, field: keyof QuestionItem, value: string) => { const updated = [...dynamicQuestions]; updated[index][field] = value; setDynamicQuestions(updated); };

  const startEditCourse = (course: CourseItem) => {
    setIsEditing(true); setEditCourseId(course.id);
    setCourseTitle(course.title || ''); setCourseDesc(course.description || ''); setInstructorName(course.instructorName || ''); setCourseImage(course.imageUrl || ''); setVideoUrl(course.videoUrl || '');
    if (course.chapters?.length) setDynamicChapters(course.chapters.map(ch => ({ title: ch.title || '', summary: ch.summary || '' }))); else setDynamicChapters([{ title: 'Bab 1: Introduction', summary: '' }]);
    if (course.questions?.length) setDynamicQuestions(course.questions.map(q => ({ questionText: q.questionText || '', optionA: q.optionA || '', optionB: q.optionB || '', optionC: q.optionC || '', optionD: q.optionD || '', correctOption: q.correctOption || 'A' }))); else setDynamicQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Hapus kelas "${title}" secara permanen?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/create-course?id=${id}`, { method: 'DELETE' });
      if (res.ok) { setMessage({ text: `🗑️ Sukses menghapus kelas.`, isError: false }); if (editCourseId === id) cancelEditMode(); await fetchCourses(); }
      else setMessage({ text: '❌ Gagal menghapus kelas.', isError: true });
    } catch (err) { setMessage({ text: '❌ Gangguan jaringan.', isError: true }); } finally { setLoading(false); }
  };

  const cancelEditMode = () => {
    setIsEditing(false); setEditCourseId(null);
    setCourseTitle(''); setCourseDesc(''); setInstructorName(''); setCourseImage(''); setVideoUrl('');
    setDynamicChapters([{ title: 'Bab 1: Introduction', summary: '' }]);
    setDynamicQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
  };

  const handleFormCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage({ text: '', isError: false });
    const payload = { id: editCourseId, title: courseTitle, description: courseDesc, instructorName, imageUrl: courseImage || null, videoUrl: videoUrl || null, chapters: dynamicChapters, questions: dynamicQuestions };
    try {
      const res = await fetch('/api/admin/create-course', { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setMessage({ text: '💾 Sukses menyimpan data kelas!', isError: false }); cancelEditMode(); await fetchCourses(); } 
      else setMessage({ text: '❌ Gagal sinkronisasi.', isError: true });
    } catch (err) { setMessage({ text: '❌ Gangguan server.', isError: true }); } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
      <div className="xl:col-span-2 bg-white border border-gray-200 shadow-sm p-6 md:p-8 rounded-sm h-fit">
        <div className="border-b pb-3 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-normal text-[#0ea5e9]">{isEditing ? '📝 Edit Existing Database Course' : '📖 Course Database Configuration Form'}</h2>
            <p className="text-xs text-gray-400 mt-1">{isEditing ? 'Sekali di-update data lama akan disesuaikan.' : 'Form sinkronisasi data multimedia kelas.'}</p>
          </div>
          {isEditing && <button type="button" onClick={cancelEditMode} className="bg-gray-500 hover:bg-gray-600 text-white font-bold text-xs px-4 py-2 rounded-sm cursor-pointer">✕ Batal Edit</button>}
        </div>
        {message.text && <div className={`p-3 text-xs mb-4 border rounded-sm ${message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>}

        <form onSubmit={handleFormCourseSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className="block text-gray-700 font-semibold mb-1">Course Title</label><input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="w-full border p-2.5 rounded-sm outline-none focus:border-[#0ea5e9]" required /></div>
            <div><label className="block text-gray-700 font-semibold mb-1">Instructor Name</label><input type="text" value={instructorName} onChange={e => setInstructorName(e.target.value)} className="w-full border p-2.5 rounded-sm outline-none focus:border-[#0ea5e9]" required /></div>
          </div>
          <div><label className="block text-gray-700 font-semibold mb-1">Course Description</label><textarea value={courseDesc} onChange={e => setCourseDesc(e.target.value)} rows={2} className="w-full border p-2.5 rounded-sm outline-none focus:border-[#0ea5e9]" required /></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sky-50/30 border border-sky-100 p-4 rounded-sm">
            <div><label className="block text-gray-700 font-semibold mb-1">Cover Image URL</label><input type="url" value={courseImage} onChange={e => setCourseImage(e.target.value)} className="w-full border p-2.5 rounded-sm outline-none focus:border-[#0ea5e9]" /></div>
            <div><label className="block text-gray-700 font-semibold mb-1">Video Stream URL</label><input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full border p-2.5 rounded-sm outline-none focus:border-[#0ea5e9]" /></div>
          </div>

          {/* Chapters */}
          <div className="border border-sky-200 bg-sky-50/10 p-5 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-sky-200 pb-2"><h4 className="text-xs font-bold text-sky-800 uppercase">📂 Syllabus Chapters</h4><button type="button" onClick={addChapterField} className="bg-[#0ea5e9] text-white px-3 py-1.5 rounded-sm text-[11px] font-bold">➕ Add Chapter</button></div>
            {dynamicChapters.map((ch, idx) => (
              <div key={idx} className="bg-white p-4 border rounded-sm space-y-3 shadow-sm relative">
                <div className="flex justify-between items-center border-b pb-1"><input type="text" value={ch.title} onChange={e => handleChapterChange(idx, 'title', e.target.value)} className="font-bold text-[12px] border-b outline-none w-48" />{dynamicChapters.length > 1 && <button type="button" onClick={() => removeChapterField(idx)} className="text-red-500 font-medium text-[11px]">❌ Hapus</button>}</div>
                <input type="text" value={ch.summary} onChange={e => handleChapterChange(idx, 'summary', e.target.value)} className="w-full border p-2.5 rounded-sm outline-none focus:border-sky-500" placeholder="Ringkasan Bab..." required />
              </div>
            ))}
          </div>

          {/* Questions */}
          <div className="border border-amber-200 bg-amber-50/10 p-5 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-amber-200 pb-2"><h4 className="text-xs font-bold text-amber-800 uppercase">📝 Quiz Questions</h4><button type="button" onClick={addQuestionField} className="bg-amber-600 text-white px-3 py-1.5 rounded-sm text-[11px] font-bold">➕ Add Question</button></div>
            {dynamicQuestions.map((q, idx) => (
              <div key={idx} className="bg-white p-4 border rounded-sm space-y-3 relative shadow-sm">
                <div className="flex justify-between items-center border-b pb-1"><span className="font-semibold text-[12px]">Butir Pertanyaan #{idx + 1}</span>{dynamicQuestions.length > 1 && <button type="button" onClick={() => removeQuestionField(idx)} className="text-red-600 font-medium text-[11px]">❌ Hapus</button>}</div>
                <input type="text" value={q.questionText} onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)} className="w-full border p-2.5 rounded-sm outline-none focus:border-amber-500" placeholder="Tulis soal kuis..." required />
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <input type="text" value={q.optionA} onChange={e => handleQuestionChange(idx, 'optionA', e.target.value)} className="border p-2 rounded-sm" placeholder="Opsi A" required />
                  <input type="text" value={q.optionB} onChange={e => handleQuestionChange(idx, 'optionB', e.target.value)} className="border p-2 rounded-sm" placeholder="Opsi B" required />
                  <input type="text" value={q.optionC} onChange={e => handleQuestionChange(idx, 'optionC', e.target.value)} className="border p-2 rounded-sm" placeholder="Opsi C" required />
                  <input type="text" value={q.optionD} onChange={e => handleQuestionChange(idx, 'optionD', e.target.value)} className="border p-2 rounded-sm" placeholder="Opsi D" required />
                </div>
                <div className="flex items-center gap-2 font-medium"><span>Kunci Jawaban:</span><select value={q.correctOption} onChange={e => handleQuestionChange(idx, 'correctOption', e.target.value)} className="border p-1 rounded-sm"><option value="A">Opsi (A)</option><option value="B">Opsi (B)</option><option value="C">Opsi (C)</option><option value="D">Opsi (D)</option></select></div>
              </div>
            ))}
          </div>

          <div className="flex justify-end"><button type="submit" disabled={loading} className={`px-10 py-3 rounded-sm font-bold text-white uppercase text-xs ${isEditing ? 'bg-emerald-600' : 'bg-[#1565c0]'}`}>{loading ? 'Proses...' : isEditing ? '💾 Update Course Data' : '🚀 Submit to Database'}</button></div>
        </form>
      </div>

      {/* Courses List */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm h-fit">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-4">📚 Active Courses</h3>
        <div className="space-y-3">
          {coursesList.length === 0 ? (<p className="text-xs text-gray-400 italic">Belum ada kelas.</p>) : (
            coursesList.map(c => (
              <div key={c.id} className="p-3 border rounded-sm bg-gray-50/50 text-[11px] shadow-sm">
                <p className="font-semibold text-cyan-600 truncate">📖 {c.title}</p>
                <div className="flex gap-2 border-t mt-2 pt-2 justify-end">
                  <button onClick={() => startEditCourse(c)} className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 rounded-sm">📝 Edit</button>
                  <button onClick={() => handleDeleteCourse(c.id, c.title)} className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-300 rounded-sm">🗑️ Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}