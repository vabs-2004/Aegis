import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AEGIS — Adaptive C-UAS Threat Simulation Trainer",
  description: "AI-Enabled Counter-UAS Cognitive Decision Trainer and Adaptive Threat Simulator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0E0D] text-[#E8ECE7] antialiased selection:bg-[#8CA8B8]/30 selection:text-[#E8ECE7]">
        {children}
      </body>
    </html>
  );
}
