import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface-container-highest)] dark:bg-[var(--color-surface-dim)] w-full mt-auto flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-8 border-t border-[var(--color-outline-variant)]/40 z-10">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <span className="font-serif font-bold text-lg text-[var(--color-primary)]">K-Mastery</span>
        <span className="font-sans text-sm text-[var(--color-secondary)] dark:text-[#cec6be]">
          © {new Date().getFullYear()} Sahara Korean Learning. Crafted with tradition.
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#" className="font-sans text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:underline transition-all opacity-100 hover:opacity-80">
          Privacy Policy
        </a>
        <a href="#" className="font-sans text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:underline transition-all opacity-100 hover:opacity-80">
          Terms of Service
        </a>
        <a href="#" className="font-sans text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:underline transition-all opacity-100 hover:opacity-80">
          Cultural Credits
        </a>
      </div>
    </footer>
  );
}
