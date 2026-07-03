'use client';

import React, { useState, useEffect } from 'react';

interface GradeItem { id: string; user: { name: string; email: string }; course: { title: string }; score: number; isPassed: boolean; createdAt: string; }

export default function GradesTab() {
  const [gradesList, setGradesList] = useState<GradeItem[]>([]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await fetch('/api/admin/get-grades');
        if (res.ok) { const data = await res.json(); setGradesList(data.grades || []); }
      } catch (err) { console.error(err); }
    };
    fetchGrades();
  }, []);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-sm mt-6">
      <h3 className="text-lg font-normal text-gray-800 border-b pb-2 mb-4">📊 Student Quiz Ledger</h3>
      <div className="overflow-x-auto text-xs border rounded-sm">
        <table className="w-full text-left">
          <thead><tr className="bg-gray-50 border-b p-3 text-gray-600 font-semibold"><th className="p-3">Student Name</th><th className="p-3">Course Title</th><th className="p-3 text-center">Score Result</th></tr></thead>
          <tbody>
            {gradesList?.map(g => (
              <tr key={g.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">
                  <p className="text-gray-900">{g.user?.name}</p><p className="text-[10px] text-gray-400 font-mono">{g.user?.email}</p>
                </td>
                <td className="p-3">{g.course?.title}</td>
                <td className="p-3 text-center font-bold text-base">
                  {g.score} / 100
                  {g.isPassed ? <span className="block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] rounded-sm uppercase tracking-wide w-fit mx-auto">Passed</span> : <span className="block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-[9px] rounded-sm uppercase tracking-wide w-fit mx-auto">Failed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}