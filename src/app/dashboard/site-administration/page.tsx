import React from 'react';

export default function SiteAdministrationPage() {
  const tabs = ['Site administration', 'Users', 'Courses', 'Grades', 'Plugins', 'Appearance', 'Server', 'Reports', 'Development'];
  
  return (
    <div className="flex flex-col min-h-full font-sans bg-[#f4f6f8]">
      <div className="p-4 md:p-8 space-y-6 flex-grow">
        
        {/* Header */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <h1 className="text-3xl font-light text-[#2b3a4a] mb-4">Site administration</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
            <span className="cursor-pointer hover:underline">Dashboard</span>
            <span>/</span>
            <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded-sm">Site administration</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-6 px-6 overflow-x-auto">
            {tabs.map((tab, idx) => (
              <button 
                key={tab} 
                className={`py-4 text-sm font-medium border-b-2 ${idx === 0 ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Content Area */}
        <div className="bg-white border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Search Box */}
            <div className="md:col-span-3 mb-4">
              <input 
                type="text" 
                placeholder="Search administration settings..." 
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              />
            </div>

            {/* General Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-normal text-gray-700 border-b pb-2">General</h3>
              <ul className="space-y-2 text-sm text-[#0ea5e9]">
                <li className="hover:underline cursor-pointer">▶ Site settings</li>
                <li className="hover:underline cursor-pointer">▶ Registration</li>
                <li className="hover:underline cursor-pointer">▶ Advanced features</li>
              </ul>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-normal text-gray-700 border-b pb-2">Security</h3>
              <ul className="space-y-2 text-sm text-[#0ea5e9]">
                <li className="hover:underline cursor-pointer">▶ Site security settings</li>
                <li className="hover:underline cursor-pointer">▶ HTTP security</li>
                <li className="hover:underline cursor-pointer">▶ Notifications</li>
              </ul>
            </div>

            {/* Front Page Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-normal text-gray-700 border-b pb-2">Front page</h3>
              <ul className="space-y-2 text-sm text-[#0ea5e9]">
                <li className="hover:underline cursor-pointer">▶ Front page settings</li>
                <li className="hover:underline cursor-pointer">▶ Front page roles</li>
                <li className="hover:underline cursor-pointer">▶ Backup settings</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
      
      {/* Footer (sama dengan halaman sebelumnya) */}
      <footer className="bg-[#eef2f6] border-t border-gray-200 mt-10 p-8 text-center text-sm text-gray-500">
        © 2026 PT Xapiens Teknologi Indonesia - Learning Management System
      </footer>
    </div>
  );
}