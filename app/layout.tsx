import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Italiana } from "next/font/google";
import "./globals.css";
import ClientBodyBypass from "@/components/ui/ClientBodyBypass";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const italiana = Italiana({ weight: "400", subsets: ["latin"], variable: "--font-italiana" });

export const metadata: Metadata = {
  title: "WedBliss — Elegant Digital Invitations for Your Big Day",
  description: "Create stunning, interactive, and beautifully crafted wedding invitations in minutes. Effortlessly share your love story with friends and family.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (window.location.hostname.startsWith('admin.') && !window.location.pathname.startsWith('/admin')) {
              window.location.replace('/admin' + (window.location.pathname === '/' ? '' : window.location.pathname));
            }
          `
        }} />
      </head>
      <body className={`${playfair.variable} ${dmSans.variable} ${italiana.variable}`}>
        {/* Cursor elements - Global application */}
        <div className="cursor-dot" id="cursorDot"></div>
        <div className="cursor-ring" id="cursorRing"></div>
        <div className="mouse-follower" id="mouseFollower"><div className="follower-orb"></div></div>

        <ClientBodyBypass>
          {children}
        </ClientBodyBypass>
      </body>
    </html>
  );
}
