import Image from "next/image";

import { headers } from "next/headers";
import { getInvitationData } from "@/lib/db";

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Extract subdomain (e.g., hema-siva.wedbliss.co -> hema-siva)
  // For local testing, handle localhost:3001
  let subdomain = "default";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    // Allow testing via ?s=subdomain
    const url = new URL(`http://${host}${headersList.get("x-invoke-path") || "/"}`);
    subdomain = url.searchParams.get("s") || "default";
  } else {
    subdomain = host.split(".")[0];
  }

  // Fetch from Supabase
  let inviteData = await getInvitationData(subdomain);

  // Fallback to static dummy data if not found
  if (!inviteData) {
    inviteData = {
      metadata: { plan: "basic", template_id: "tm-mallipoo", createdAt: new Date().toISOString() },
      couple: {
        bride: { firstName: "Hema", lastName: "", parents: "D/o Kumar & Thenmozhi" },
        groom: { firstName: "Siva", lastName: "", parents: "S/o Rajan & Viji" },
        storyMessage: "We joyfully invite you to share in our happiness as we unite in marriage."
      },
      events: [
        {
          id: "ev-1",
          type: "muhurtham",
          title: "Muhurtham",
          date: "12 May 2026",
          time: "6:48 AM - 8:30 AM",
          venueName: "Padmavathi Kalyana Mandapam",
          venueAddress: "123 Tirupati Road, Chennai 600 028"
        }
      ],
      gallery: { images: [] },
      media: { videoUrl: "" }
    };
  }

  return (
    <main className="min-h-screen bg-[#fdf6ec] text-[#4a2c0a] font-sans selection:bg-[#e8c8a0] selection:text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">

        {/* Decorative corner florals - SVG placeholders for jasmine look */}
        <div className="absolute top-0 left-0 p-8 opacity-40 mix-blend-multiply">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="#c8a070" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M50 10 C60 40 90 50 90 50 C60 60 50 90 50 90 C40 60 10 50 10 50 C40 40 50 10 50 10 Z" fill="#fff" stroke="#c8a070" strokeWidth="1" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 p-8 opacity-40 mix-blend-multiply rotate-180">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="#c8a070" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M50 10 C60 40 90 50 90 50 C60 60 50 90 50 90 C40 60 10 50 10 50 C40 40 50 10 50 10 Z" fill="#fff" stroke="#c8a070" strokeWidth="1" />
          </svg>
        </div>

        <div className="z-10 bg-white/40 backdrop-blur-sm p-12 md:p-20 rounded-[40px] border border-[#e8c8a0] shadow-xl shadow-[#e8c8a0]/20 max-w-2xl w-full">
          <div className="mb-6 opacity-60">
            <span className="text-sm tracking-[0.3em] uppercase font-semibold text-[#8b6040]">Wedding Invitation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif italic mb-8 mt-2 text-[#6b4020]">
            {inviteData.couple.groom.firstName} <span className="text-3xl mx-2 text-[#c8a070]">&amp;</span> {inviteData.couple.bride.firstName}
          </h1>

          <div className="w-24 h-[1px] bg-[#c8a070] mx-auto mb-8 opacity-50"></div>

          <p className="text-lg md:text-xl text-[#8b6040] mb-10 max-w-lg mx-auto leading-relaxed">
            {inviteData.couple.storyMessage}
          </p>

          <div className="inline-block bg-[#fff] px-8 py-4 rounded-full border border-[#e8c8a0] shadow-sm">
            <p className="text-xl font-medium text-[#6b4020]">{inviteData.events[0]?.date}</p>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-20 px-8 bg-white text-center border-t border-[#e8c8a0]/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif italic text-[#c8a070] mb-12">The Details</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-8 bg-[#fdf6ec] rounded-3xl border border-[#e8c8a0]/50">
              <h3 className="text-sm tracking-[0.2em] uppercase font-bold text-[#8b6040] mb-4">{inviteData.events[0]?.title}</h3>
              <p className="text-2xl text-[#6b4020] font-serif mb-2">{inviteData.events[0]?.time}</p>
              <p className="text-[#8b6040]">{inviteData.events[0]?.date}</p>
            </div>

            <div className="p-8 bg-[#fdf6ec] rounded-3xl border border-[#e8c8a0]/50">
              <h3 className="text-sm tracking-[0.2em] uppercase font-bold text-[#8b6040] mb-4">Venue</h3>
              <p className="text-xl text-[#6b4020] font-serif mb-2">{inviteData.events[0]?.venueName}</p>
              <p className="text-[#8b6040] text-sm leading-relaxed">{inviteData.events[0]?.venueAddress || ''}</p>
            </div>
          </div>

          {/* Premium Events rendering (if more than 1 event) */}
          {inviteData.events.length > 1 && (
            <div className="mt-12 space-y-8">
              {inviteData.events.slice(1).map((ev: any, idx: number) => (
                <div key={idx} className="p-8 bg-white/60 rounded-3xl border border-[#e8c8a0]/30 shadow-sm max-w-2xl mx-auto flex flex-col md:flex-row gap-6 md:gap-12 text-left">
                  <div className="flex-1">
                    <h3 className="text-sm tracking-[0.2em] uppercase font-bold text-[#8b6040] mb-2">{ev.title}</h3>
                    <p className="text-[#8b6040] mb-1">{ev.date}</p>
                    <p className="text-xl text-[#6b4020] font-serif">{ev.time}</p>
                  </div>
                  <div className="flex-1 md:border-l border-[#e8c8a0]/30 md:pl-8">
                    <h3 className="text-sm tracking-[0.2em] uppercase font-bold text-[#8b6040] mb-2">Venue</h3>
                    <p className="text-lg text-[#6b4020] font-serif mb-1">{ev.venueName}</p>
                    <p className="text-[#8b6040] text-sm leading-relaxed">{ev.venueAddress || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-sm text-[#8b6040] opacity-80">
            <p>With blessings from</p>
            <p className="mt-2 font-medium">{inviteData.couple.groom.parents} &nbsp; | &nbsp; {inviteData.couple.bride.parents}</p>
          </div>
        </div>
      </section>

      {/* Footer / Powered By */}
      <footer className="py-8 text-center bg-[#fdf6ec]">
        <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-xs uppercase tracking-widest font-bold">Powered by Vaazh</span>
        </a>
      </footer>

    </main>
  );
}
