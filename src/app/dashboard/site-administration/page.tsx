'use client';

import React, { useState } from 'react';

// Mengimpor kepingan-kepingan komponen yang sudah kita pisah kawan!
import UsersTab from './components/UsersTab';
import CoursesTab from './components/CoursesTab';
import EnrollmentsTab from './components/EnrollmentsTab';
import GradesTab from './components/GradesTab';

export default function SiteAdministrationPage() {
  const [activeTab, setActiveTab] = useState('Users');
  const tabs = ['Site administration', 'Users', 'Courses', 'Enrollments & Progress', 'Grades'];

  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* HEADER */}
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm">
          <h1 className="text-3xl font-light text-[#2b3a4a] mb-4">Site administration</h1>
          <div className="flex text-sm text-gray-500 gap-2">
            <span>Dashboard</span> <span>/</span> <span className="text-gray-800 bg-gray-100 px-2 rounded-sm">Site administration</span>
          </div>
        </div>

        {/* TAB MENU NAVIGATION */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex space-x-6 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button 
                key={tab} type="button" disabled={tab === 'Site administration'} onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition ${
                  tab === 'Site administration' ? 'text-gray-400 font-bold border-transparent mr-4 cursor-default' :
                  activeTab === tab ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* AREA RENDER MODULAR KAWAN */}
        {activeTab === 'Users' && <UsersTab />}
        {activeTab === 'Courses' && <CoursesTab />}
        {activeTab === 'Enrollments & Progress' && <EnrollmentsTab />}
        {activeTab === 'Grades' && <GradesTab />}

      </div>
    </div>
  );
}