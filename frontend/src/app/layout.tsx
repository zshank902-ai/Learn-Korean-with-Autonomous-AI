import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

const ebGaramond = EB_Garamond({ subsets: ["latin"], variable: "--font-serif" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="en" className={`${ebGaramond.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen relative overflow-x-hidden bg-[var(--color-background)] text-[var(--color-on-background)] selection:bg-[var(--color-primary-container)] selection:text-white">
        <NavbarWrapper />
        <div className="pt-24 pb-8">
          {children}
        </div>
      </body>
    </html>
  );
}
