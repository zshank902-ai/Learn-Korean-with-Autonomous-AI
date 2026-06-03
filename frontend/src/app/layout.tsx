import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "K-Mastery | AI-Powered Korean Learning",
  description: "Master TOPIK Level 1-6 with immersive AI scenarios and gamified roadmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen relative overflow-x-hidden selection:bg-[var(--color-primary-container)] selection:text-white">
        <NavbarWrapper />
        <div className="pt-24 pb-8">
          {children}
        </div>
      </body>
    </html>
  );
}
