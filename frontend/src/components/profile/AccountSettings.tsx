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
    <div className="glass-card rounded-3xl border border-[rgba(255,255,255,0.2)] overflow-hidden mt-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      
      {/* Settings Header */}
      <div className="bg-[rgba(255,255,255,0.05)] p-6 md:p-8 text-white border-b border-[rgba(255,255,255,0.1)] backdrop-blur-sm">
        <h2 className="text-3xl font-extrabold mb-2 font-sans drop-shadow-md">
          Account Settings
        </h2>
        <p className="text-[var(--color-on-surface-variant)] font-bold">Manage your profile, email, and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="md:w-64 border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.2)] p-4 flex md:flex-col gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl font-extrabold uppercase tracking-widest text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'glass-card bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]' 
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
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
