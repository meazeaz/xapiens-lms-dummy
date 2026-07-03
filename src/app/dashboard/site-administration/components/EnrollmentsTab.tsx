'use client';

import React, { useState, useEffect } from 'react';

interface EnrollmentItem { id: string; user: { name: string; email: string }; course: { title: string }; progress: number; status: string; }

export default function EnrollmentsTab() {
  const [enrollmentsList, setEnrollmentsList] = useState<EnrollmentItem[]>([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch('/api/admin/get-enrollments');
        if (res.ok) { const data = await res.json(); setEnrollmentsList(data.enrollments || []); }
      } catch (err) { console.error(err); }
    };
    fetchEnrollments();
  }, []);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-sm mt-6">
      <h3 className="text-lg font-normal text-gray-800 border-b pb-2 mb-4">📈 Monitoring Course Progress</h3>
      <div className="overflow-x-auto text-xs border rounded-sm">
        <table className="w-full text-left">
          <thead><tr className="bg-gray-50 border-b p-3 text-gray-600 font-semibold"><th className="p-3">Student Name</th><th className="p-3">Course</th><th className="p-3">Progress</th><th className="p-3 text-center">Status</th></tr></thead>
          <tbody>
            {enrollmentsList?.map(e => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">
                  <p className="text-gray-900">{e.user?.name}</p><p className="text-[10px] text-gray-400 font-mono">{e.user?.email}</p>
                </td>
                <td className="p-3 text-gray-700">{e.course?.title}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 flex-grow"><div className="bg-[#0ea5e9] h-1.5 rounded-full" style={{ width: `${e.progress}%` }}></div></div>
                    <span className="font-bold text-[#0ea5e9] w-8 text-right">{e.progress}%</span>
                  </div>
                </td>
                <td className="p-3 text-center font-bold">
                  {e.status === 'COMPLETED' ? <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-sm text-[10px]">SELESAI</span> : <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-sm text-[10px]">ONGOING</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}