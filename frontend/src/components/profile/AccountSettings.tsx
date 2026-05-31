"use client";

import React, { useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';
import ProfileInfoTab from './ProfileInfoTab';
import EmailTab from './EmailTab';
import SecurityTab from './SecurityTab';

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'security'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: <User size={20} /> },
    { id: 'email', label: 'Email', icon: <Mail size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
  ] as const;

  return (
    <div className="bg-white rounded-3xl border-4 border-[#1E1B4B] overflow-hidden mt-8"
         style={{ boxShadow: '8px 8px 0px #1E1B4B' }}>
      
      {/* Settings Header */}
      <div className="bg-[#1E1B4B] p-6 md:p-8 text-white">
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          Account Settings
        </h2>
        <p className="text-white/60 font-bold">Manage your profile, email, and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-[#1E1B4B] bg-[#EEF2FF] p-4 flex md:flex-col gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#4F46E5] text-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_#1E1B4B]' 
                  : 'text-[#1E1B4B]/60 hover:bg-[#1E1B4B]/5 border-2 border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 md:p-10 min-h-[500px]">
          {activeTab === 'profile' && <ProfileInfoTab />}
          {activeTab === 'email' && <EmailTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
