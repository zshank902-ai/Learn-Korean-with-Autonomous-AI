import type { Metadata } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import NavigationLayout from "@/components/NavigationLayout";

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
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen flex flex-col md:flex-row bg-[var(--color-background)] text-[var(--color-on-background)] selection:bg-[var(--color-primary-container)] selection:text-white">
        <NavigationLayout>
          {children}
        </NavigationLayout>
      </body>
    </html>
  );
}
