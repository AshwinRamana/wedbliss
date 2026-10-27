import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// One static page serves every couple's subdomain, and link crawlers
// (WhatsApp, iMessage, Facebook) never run the invitation's JavaScript —
// so the share preview must be a fixed "You're invited" card. Without these
// tags WhatsApp falls back to showing the favicon, blown up.
const SHARE_TITLE = "You're Invited · A Wedding Invitation";
const SHARE_DESCRIPTION = "Tap to open your wedding invitation — the date, venue and celebrations, all in one place.";
const SHARE_IMAGE = "https://www.wedbliss.co/og-invite.jpg";

export const metadata: Metadata = {
  title: SHARE_TITLE,
  description: SHARE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "WedBliss",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: "You're invited — a wedding invitation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
