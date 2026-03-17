import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Italiana } from "next/font/google";
import "./globals.css";
import ClientBodyBypass from "@/components/ui/ClientBodyBypass";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const italiana = Italiana({ weight: "400", subsets: ["latin"], variable: "--font-italiana" });

export const metadata: Metadata = {
  title: "WedBliss | Elegant Digital Wedding Invitations & WhatsApp Invites",
  description: "Create stunning, interactive digital wedding invitations in minutes. Feature-rich with live countdowns, music, gift registries, and instant WhatsApp sharing. The modern way to announce your forever.",
  keywords: ["digital wedding invitation", "online wedding card", "whatsapp wedding invite", "indian wedding website", "muhurtham countdown", "interactive wedding card"],
  authors: [{ name: "WedBliss Team" }],
  openGraph: {
    title: "WedBliss — Stunning Digital Wedding Invitations",
    description: "Elegant, interactive, and beautifully crafted for your big day. Share your love story instantly with friends and family.",
    url: "https://wedbliss.co",
    siteName: "WedBliss",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WedBliss Digital Invitation Preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WedBliss | Elegant Digital Wedding Invitations",
    description: "The modern way to announce your marriage. Interactive, elegant, and live in 10 minutes.",
    images: ["/og-image.png"],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
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
