"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Handlebars from "handlebars";
import { getInvitationData } from "@/lib/db";

export default function Home() {
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIt = async () => {
      let host = window.location.hostname;
      let subdomain = "default";

      if (host.includes("localhost") || host.includes("127.0.0.1")) {
        // Allow testing via ?s=subdomain
        const urlParams = new URLSearchParams(window.location.search);
        subdomain = urlParams.get("s") || "default";
      } else {
        subdomain = host.split(".")[0];
      }

      // Fetch from Supabase
      let data = await getInvitationData(subdomain);

      // Fallback to static dummy data if not found
      if (!data) {
        data = {
          metadata: { plan: "basic", template_id: "tm-mallipoo", createdAt: new Date().toISOString() },
          couple: {
            bride: { firstName: "Priya", fatherName: "Krishnaswamy", motherName: "Kamakshi", notes: "Can't wait to start this beautiful journey together!" },
            groom: { firstName: "Karthik", fatherName: "Ramasamy", motherName: "Saraswathi", notes: "Forever and always, my love." },
          },
          events: [
            {
              id: "ev-1",
              title: "Muhurtham",
              date: "28 February 2026",
              startTime: "8:24 AM",
              endTime: "10:48 AM",
              venueName: "Sri Murugan Kalyana Mandapam",
              googleMapsUrl: "https://maps.google.com/?q=Sri+Murugan+Kalyana+Mandapam"
            }
          ],
          gallery: { images: [] },
          media: { videoUrl: "" }
        };
      }
      setInviteData(data);
      setLoading(false);
    };

    fetchIt();
  }, []);

  // Compile the Handlebars template if available
  const compiledHtml = (() => {
    if (!inviteData?.templateHtml) return null;
    try {
      const template = Handlebars.compile(inviteData.templateHtml);
      return template(inviteData);
    } catch (e) {
      console.error("Handlebars compilation failed:", e);
      return null;
    }
  })();

  // Use a ref to inject HTML and execute scripts AFTER the DOM is ready
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scriptsInjected = React.useRef(false);

  useEffect(() => {
    if (!containerRef.current || !compiledHtml || scriptsInjected.current) return;
    scriptsInjected.current = true;

    // 1. Inject the compiled HTML into the container
    containerRef.current.innerHTML = compiledHtml;

    // 2. Inject the universal Add-to-Calendar ICS utility (runs before template scripts)
    const calScript = document.createElement("script");
    calScript.text = `
      window.addToCalendar = function(title, dateStr, startTime, endTime, venue, coupleNames) {
        try {
          // Parse date - handles formats like "28 February 2026" or "2026-02-28"
          var eventDate = new Date(dateStr);
          if (isNaN(eventDate.getTime())) {
            // Try DD Month YYYY format
            var parts = dateStr.split(/[\\\\s,]+/);
            eventDate = new Date(parts.slice(0,3).join(' '));
          }
          if (isNaN(eventDate.getTime())) {
            alert('Could not parse event date: ' + dateStr);
            return;
          }
          
          // Parse time (e.g., "8:24 AM" or "10:48 AM")
          function parseTime(timeStr) {
            var match = timeStr.match(/(\\\\d{1,2}):(\\\\d{2})\\\\s*(AM|PM)?/i);
            if (!match) return { h: 0, m: 0 };
            var h = parseInt(match[1]);
            var m = parseInt(match[2]);
            var period = (match[3] || '').toUpperCase();
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            return { h: h, m: m };
          }
          
          var start = parseTime(startTime);
          var end = parseTime(endTime);
          
          var dtStart = new Date(eventDate);
          dtStart.setHours(start.h, start.m, 0);
          var dtEnd = new Date(eventDate);
          dtEnd.setHours(end.h, end.m, 0);
          
          // Format to ICS datetime (YYYYMMDDTHHmmSS)
          function toICS(d) {
            return d.getFullYear().toString() +
              String(d.getMonth()+1).padStart(2,'0') +
              String(d.getDate()).padStart(2,'0') + 'T' +
              String(d.getHours()).padStart(2,'0') +
              String(d.getMinutes()).padStart(2,'0') + '00';
          }
          
          var names = coupleNames || '';
          var eventSummary = names ? title + ' - ' + names : title;
          var eventDesc = names 
            ? 'Wedding event: ' + title + ' of ' + names + ' at ' + (venue || '')
            : 'Wedding event: ' + title + ' at ' + (venue || '');
          
          var icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//WedBliss//Wedding Invitation//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'DTSTART:' + toICS(dtStart),
            'DTEND:' + toICS(dtEnd),
            'SUMMARY:' + eventSummary,
            'LOCATION:' + (venue || ''),
            'DESCRIPTION:' + eventDesc,
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
          ].join('\\\\r\\\\n');
          
          var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          var url = URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.href = url;
          link.download = title.replace(/[^a-zA-Z0-9]/g, '_') + '.ics';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch(err) {
          alert('Error creating calendar event: ' + err.message);
        }
      };
    `;
    document.body.appendChild(calScript);

    // 3. Extract and re-execute all <script> tags from the compiled HTML
    //    (dangerouslySetInnerHTML and innerHTML both ignore script execution)
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach(oldScript => {
      const newScript = document.createElement("script");
      // Copy attributes
      Array.from(oldScript.attributes).forEach(attr =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // 4. Also inject templateJs if available (separate JS stored in DB)
    if (inviteData?.templateJs) {
      const jsScript = document.createElement("script");
      jsScript.text = inviteData.templateJs;
      document.body.appendChild(jsScript);
    }
  }, [compiledHtml, inviteData?.templateJs]);

  if (loading || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6ec] text-[#a67c52]">
        <div className="animate-pulse font-serif text-xl italic tracking-widest">Unfolding your invitation...</div>
      </div>
    );
  }

  // 1. GENERATIVE UI ENGINE (Handlebars)
  if (compiledHtml) {
    return (
      <>
        {inviteData.templateCss && <style dangerouslySetInnerHTML={{ __html: inviteData.templateCss }} />}
        <div ref={containerRef} />
      </>
    );
  }

  // 2. FALLBACK/LEGACY ENGINE (React)
  // If no HTML is stored, render the hardcoded template React tree
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
