import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Italiana } from "next/font/google";
import "./globals.css";
import ClientBody from "@/components/ui/ClientBody";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const italiana = Italiana({ weight: "400", subsets: ["latin"], variable: "--font-italiana" });

export const metadata: Metadata = {
  title: "WedBliss — Elegant Digital Invitations for Your Big Day",
  description: "Create stunning, interactive, and beautifully crafted wedding invitations in minutes. Effortlessly share your love story with friends and family.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} ${italiana.variable}`}>
        {/* Cursor elements - Global application */}
        <div className="cursor-dot" id="cursorDot"></div>
        <div className="cursor-ring" id="cursorRing"></div>
        <div className="mouse-follower" id="mouseFollower"><div className="follower-orb"></div></div>

        <ClientBody>
          {children}
        </ClientBody>
      </body>
    </html>
  );
}
