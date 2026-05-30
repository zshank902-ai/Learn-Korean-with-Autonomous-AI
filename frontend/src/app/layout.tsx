import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#EEF2FF] text-[#1E1B4B] font-sans selection:bg-[#4F46E5] selection:text-white min-h-screen relative">
        <NavbarWrapper />
        <div className="pt-24 pb-8">
          {children}
        </div>
      </body>
    </html>
  );
}
