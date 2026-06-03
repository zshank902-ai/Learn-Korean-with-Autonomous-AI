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
    <div className="sahara-card rounded-3xl border border-[var(--color-outline-variant)] overflow-hidden mt-8 shadow-sm font-sans">
      
      {/* Settings Header */}
      <div className="bg-[var(--color-surface)] p-6 md:p-8 text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)]">
        <h2 className="text-3xl font-extrabold mb-2 font-serif drop-shadow-sm">
          Account Settings
        </h2>
        <p className="text-[var(--color-on-surface-variant)] font-bold">Manage your profile, email, and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="md:w-64 border-b md:border-b-0 md:border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 flex md:flex-col gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_8px_rgba(194,101,42,0.3)] border border-[var(--color-primary)]' 
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface)] border border-transparent hover:text-[var(--color-on-surface)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 md:p-10 min-h-[500px] bg-[var(--color-surface)]">
          {activeTab === 'profile' && <ProfileInfoTab />}
          {activeTab === 'email' && <EmailTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
