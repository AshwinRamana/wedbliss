"use client";

import { useEffect, useState } from "react";
import { getTemplates } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────────────
// Static SVG artwork for each template (design code — not fetched from DB).
// The DB stores the live url, thumbnail_url, and is_live flag.
// When a template has a thumbnail_url in the DB, we show that image instead.
// ─────────────────────────────────────────────────────────────────────────────

// Used by checkout/templates and admin as a visual identifier
export function TemplateSVG({ id }: { id: string }) {
    switch (id) {
        case "tm-mallipoo":
            return (
                <svg width="100%" height="100%" viewBox="0 0 160 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <rect width="160" height="290" fill="#fdf6ec" />
                    {/* Top floral image area */}
                    <rect width="160" height="120" fill="#f5e9d4" />
                    <ellipse cx="80" cy="60" rx="48" ry="38" fill="rgba(251,207,232,0.4)" />
                    <circle cx="80" cy="50" r="22" fill="rgba(255,255,255,0.55)" stroke="#e8c8a0" strokeWidth="0.8" />
                    <text x="80" y="54" textAnchor="middle" fontSize="18" fill="#c8922a" opacity="0.7" fontFamily="serif">ஓம்</text>
                    {/* Garland line */}
                    <path d="M10 115 Q40 105 80 108 Q120 105 150 115" stroke="#c8a070" strokeWidth="1" fill="none" />
                    <circle cx="20" cy="110" r="3.5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <circle cx="50" cy="107" r="3.5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <circle cx="80" cy="106" r="4" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <circle cx="110" cy="107" r="3.5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <circle cx="140" cy="110" r="3.5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    {/* Text content */}
                    <text x="80" y="142" textAnchor="middle" fontSize="7" fill="#8b6040" letterSpacing="2.5" opacity="0.7">WEDDING INVITATION</text>
                    <line x1="32" y1="149" x2="128" y2="149" stroke="#c8a070" strokeWidth="0.5" opacity="0.6" />
                    <text x="80" y="168" textAnchor="middle" fontSize="16" fill="#4a2c0a" fontFamily="Georgia,serif" fontStyle="italic">Siva &amp; Hema</text>
                    <text x="80" y="180" textAnchor="middle" fontSize="6" fill="#8b6040" letterSpacing="1.5">KALYAṆAM</text>
                    <line x1="44" y1="186" x2="116" y2="186" stroke="#c8a070" strokeWidth="0.5" opacity="0.5" />
                    <text x="80" y="198" textAnchor="middle" fontSize="6.5" fill="#6b4020">12 May 2026 · 6:48 AM</text>
                    <text x="80" y="210" textAnchor="middle" fontSize="6" fill="#8b6040">Padmavathi Kalyana Mandapam</text>
                    <text x="80" y="220" textAnchor="middle" fontSize="5.5" fill="#8b6040">Tirupati Road, Chennai 600 028</text>
                    <text x="80" y="234" textAnchor="middle" fontSize="5.5" fill="#a08060">S/o Rajan &amp; Viji · D/o Kumar &amp; Thenmozhi</text>
                    {/* Bottom ornament */}
                    <circle cx="28" cy="270" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" opacity="0.7" />
                    <circle cx="80" cy="272" r="5.5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" opacity="0.6" />
                    <circle cx="132" cy="270" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" opacity="0.7" />
                </svg>
            );
        case "tm-kovil":
            return (
                <svg width="100%" height="100%" viewBox="0 0 160 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <rect width="160" height="290" fill="#0a3d25" />
                    <rect x="5" y="5" width="150" height="280" fill="none" stroke="#d4af37" strokeWidth="1.5" rx="3" />
                    {/* Temple gopuram at top */}
                    <rect x="50" y="5" width="60" height="55" fill="#0d5c35" />
                    <rect x="58" y="9" width="44" height="8" rx="1" fill="#b8960f" opacity="0.8" />
                    <rect x="62" y="16" width="36" height="7" rx="1" fill="#c8a010" opacity="0.7" />
                    <rect x="66" y="22" width="28" height="6" rx="1" fill="#d4af37" opacity="0.7" />
                    <rect x="70" y="27" width="20" height="5" rx="1" fill="#c8a010" opacity="0.6" />
                    <ellipse cx="80" cy="8" rx="5" ry="7" fill="#d4af37" opacity="0.9" />
                    {/* Om symbol */}
                    <text x="80" y="82" textAnchor="middle" fontSize="22" fill="#d4af37" fontFamily="serif">ஓம்</text>
                    {/* Names */}
                    <text x="80" y="112" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.6)" letterSpacing="1">KALYAṆAM</text>
                    <text x="80" y="132" textAnchor="middle" fontSize="15" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Karthik &amp; Priya</text>
                    <line x1="28" y1="140" x2="132" y2="140" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
                    <text x="80" y="156" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.75)">28 Feb 2026 · 9:12 AM</text>
                    <text x="80" y="168" textAnchor="middle" fontSize="6" fill="rgba(255,215,0,0.65)">Kapaleeshwarar Temple, Mylapore</text>
                    <text x="80" y="186" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.4)">திருமண அழைப்பிதழ்</text>
                    {/* Decorative leaves */}
                    <ellipse cx="18" cy="12" rx="7" ry="4" fill="#15803d" opacity="0.7" transform="rotate(-20 18 12)" />
                    <ellipse cx="142" cy="12" rx="7" ry="4" fill="#15803d" opacity="0.7" transform="rotate(20 142 12)" />
                </svg>
            );
        case "tm-tanjore":
            return (
                <svg width="100%" height="100%" viewBox="0 0 160 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <rect width="160" height="290" fill="#6b0f0f" />
                    <rect x="5" y="5" width="150" height="280" fill="none" stroke="#d4af37" strokeWidth="2" rx="2" />
                    {/* Corner gold dots */}
                    <circle cx="14" cy="14" r="6" fill="#d4af37" opacity="0.55" /><circle cx="146" cy="14" r="6" fill="#d4af37" opacity="0.55" />
                    <circle cx="14" cy="276" r="6" fill="#d4af37" opacity="0.55" /><circle cx="146" cy="276" r="6" fill="#d4af37" opacity="0.55" />
                    {/* Tanjore painting style central motif */}
                    <ellipse cx="80" cy="72" rx="26" ry="32" fill="#d4af37" opacity="0.15" />
                    <ellipse cx="80" cy="62" rx="16" ry="20" fill="#b8960f" opacity="0.3" />
                    <ellipse cx="80" cy="56" rx="11" ry="14" fill="#d4af37" opacity="0.42" />
                    <path d="M77 68 Q70 78 75 83 Q82 89 88 83" stroke="#d4af37" strokeWidth="2" fill="none" opacity="0.55" />
                    <path d="M73 38 L77 30 L80 24 L83 30 L87 38" fill="#d4af37" opacity="0.75" />
                    {/* Text */}
                    <text x="80" y="114" textAnchor="middle" fontSize="7.5" fill="#ffd700" letterSpacing="1.5" opacity="0.85">✦  KALYANAM  ✦</text>
                    <text x="80" y="136" textAnchor="middle" fontSize="14" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Arun &amp; Kavitha</text>
                    <line x1="30" y1="144" x2="130" y2="144" stroke="#d4af37" strokeWidth="0.6" opacity="0.55" />
                    <text x="80" y="160" textAnchor="middle" fontSize="6.5" fill="rgba(255,215,0,0.8)">Vivaha Muhurtham</text>
                    <text x="80" y="178" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">15 Mar 2026 · 7:48 AM</text>
                    <text x="80" y="193" textAnchor="middle" fontSize="6" fill="rgba(255,215,0,0.65)">Meenakshi Kalyana Mandapam</text>
                    <text x="80" y="204" textAnchor="middle" fontSize="6" fill="rgba(255,215,0,0.55)">Madurai</text>
                </svg>
            );
        case "tm-peacock":
            return (
                <svg width="100%" height="100%" viewBox="0 0 160 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs><radialGradient id="pcbgT" cx="50%" cy="30%"><stop offset="0%" stopColor="#1a5c70" /><stop offset="100%" stopColor="#0e1a4a" /></radialGradient></defs>
                    <rect width="160" height="290" fill="url(#pcbgT)" />
                    <rect x="5" y="5" width="150" height="280" fill="none" stroke="#14b8a6" strokeWidth="1.5" rx="2" />
                    {/* Peacock feather fan radiating from top */}
                    <line x1="80" y1="82" x2="40" y2="10" stroke="#14b8a6" strokeWidth="1.5" opacity="0.7" />
                    <line x1="80" y1="82" x2="53" y2="8" stroke="#0d9488" strokeWidth="1.5" opacity="0.75" />
                    <line x1="80" y1="82" x2="66" y2="6" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
                    <line x1="80" y1="82" x2="80" y2="5" stroke="#0d9488" strokeWidth="2" opacity="0.9" />
                    <line x1="80" y1="82" x2="94" y2="6" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
                    <line x1="80" y1="82" x2="107" y2="8" stroke="#0d9488" strokeWidth="1.5" opacity="0.75" />
                    <line x1="80" y1="82" x2="120" y2="10" stroke="#14b8a6" strokeWidth="1.5" opacity="0.7" />
                    {/* Eye circles at feather tips */}
                    <circle cx="80" cy="7" r="6" fill="#14b8a6" opacity="0.7" /><circle cx="80" cy="7" r="4" fill="#7c3aed" opacity="0.7" /><circle cx="80" cy="7" r="2" fill="#d4af37" />
                    {/* Peacock body */}
                    <line x1="80" y1="66" x2="80" y2="92" stroke="#d4af37" strokeWidth="2" opacity="0.85" />
                    <polygon points="80,60 75,72 85,72" fill="#d4af37" opacity="0.9" />
                    {/* Text */}
                    <text x="80" y="114" textAnchor="middle" fontSize="7" fill="#14b8a6" letterSpacing="1.5">✦  திருமணம்  ✦</text>
                    <text x="80" y="136" textAnchor="middle" fontSize="15" fill="#d4af37" fontFamily="Georgia,serif" fontWeight="bold">Deepak &amp; Meena</text>
                    <line x1="28" y1="144" x2="132" y2="144" stroke="#14b8a6" strokeWidth="0.5" opacity="0.5" />
                    <text x="80" y="160" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.8)">5 April 2026 · 10:24 AM</text>
                    <text x="80" y="174" textAnchor="middle" fontSize="6" fill="rgba(20,184,166,0.85)">Vel Murugan Mandapam, Chennai</text>
                </svg>
            );
        case "tm-vilakku":
            return (
                <svg width="100%" height="100%" viewBox="0 0 160 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <radialGradient id="vbgT" cx="50%" cy="50%"><stop offset="0%" stopColor="#3d1f00" /><stop offset="100%" stopColor="#1a0a00" /></radialGradient>
                        <radialGradient id="vg2T" cx="50%" cy="0%"><stop offset="0%" stopColor="rgba(255,180,0,0.28)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                    </defs>
                    <rect width="160" height="290" fill="url(#vbgT)" />
                    <ellipse cx="80" cy="80" rx="100" ry="70" fill="url(#vg2T)" />
                    <rect x="5" y="5" width="150" height="280" fill="none" stroke="#d4af37" strokeWidth="1.5" rx="2" />
                    <polygon points="5,5 20,5 5,20" fill="#d4af37" opacity="0.5" /><polygon points="155,5 140,5 155,20" fill="#d4af37" opacity="0.5" />
                    <polygon points="5,285 20,285 5,270" fill="#d4af37" opacity="0.5" /><polygon points="155,285 140,285 155,270" fill="#d4af37" opacity="0.5" />
                    {/* Vilakku lamp */}
                    <ellipse cx="80" cy="96" rx="22" ry="6" fill="#b8960f" opacity="0.85" />
                    <rect x="68" y="76" width="24" height="20" rx="4" fill="#c8922a" opacity="0.9" />
                    <ellipse cx="80" cy="76" rx="26" ry="8" fill="#d4af37" />
                    <rect x="76" y="54" width="8" height="24" rx="3" fill="#c8922a" opacity="0.85" />
                    <ellipse cx="80" cy="55" rx="18" ry="6" fill="#d4af37" opacity="0.9" />
                    <ellipse cx="80" cy="49" rx="3" ry="6" fill="#fbbf24" /><ellipse cx="80" cy="44" rx="2" ry="5" fill="white" opacity="0.85" />
                    {/* Text */}
                    <text x="80" y="126" textAnchor="middle" fontSize="7.5" fill="#fbbf24" letterSpacing="1.5">KALYANA VILAKKU</text>
                    <text x="80" y="150" textAnchor="middle" fontSize="15" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Raj &amp; Anitha</text>
                    <line x1="28" y1="158" x2="132" y2="158" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
                    <text x="80" y="182" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">22 Feb 2026 · 8:36 AM</text>
                    <text x="80" y="196" textAnchor="middle" fontSize="6" fill="rgba(255,200,80,0.7)">Bhavani Mandapam, Coimbatore</text>
                </svg>
            );
        case "tm-kanjivaram":
            return (
                <svg width="100%" height="100%" viewBox="0 0 160 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs><pattern id="sw2T" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#1a0a3d" /><line x1="0" y1="6" x2="12" y2="6" stroke="rgba(212,175,55,0.08)" strokeWidth="0.5" /><line x1="6" y1="0" x2="6" y2="12" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" /></pattern></defs>
                    <rect width="160" height="290" fill="url(#sw2T)" />
                    <rect x="5" y="5" width="150" height="280" fill="none" stroke="#d4af37" strokeWidth="2.5" rx="2" />
                    {/* Silk border stripes */}
                    <rect x="5" y="5" width="14" height="280" fill="rgba(212,175,55,0.1)" />
                    <rect x="141" y="5" width="14" height="280" fill="rgba(212,175,55,0.1)" />
                    {/* Kanjivaram mandala motif */}
                    <circle cx="80" cy="70" r="30" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.5" />
                    <circle cx="80" cy="70" r="20" fill="rgba(212,175,55,0.08)" stroke="#d4af37" strokeWidth="1" opacity="0.65" />
                    <circle cx="80" cy="70" r="8" fill="#d4af37" opacity="0.65" />
                    <circle cx="80" cy="70" r="4" fill="#b8960f" opacity="0.9" />
                    {/* Text */}
                    <text x="80" y="122" textAnchor="middle" fontSize="7" fill="#d4af37" letterSpacing="2">கல்யாணம்</text>
                    <line x1="24" y1="130" x2="136" y2="130" stroke="#d4af37" strokeWidth="0.6" opacity="0.4" />
                    <text x="80" y="152" textAnchor="middle" fontSize="15" fill="#d4af37" fontFamily="Georgia,serif" fontWeight="bold">Vikram &amp; Lavanya</text>
                    <text x="80" y="166" textAnchor="middle" fontSize="6" fill="rgba(212,175,55,0.65)" letterSpacing="1.5">VIVAHA MUHURTHAM</text>
                    <line x1="24" y1="174" x2="136" y2="174" stroke="#d4af37" strokeWidth="0.6" opacity="0.35" />
                    <text x="80" y="192" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="bold">18 June 2026 · 9:12 AM</text>
                    <text x="80" y="206" textAnchor="middle" fontSize="6" fill="rgba(212,175,55,0.7)">Kanchi Kamakshi Mandapam</text>
                    <text x="80" y="217" textAnchor="middle" fontSize="6" fill="rgba(212,175,55,0.55)">Mumbai, India</text>
                </svg>
            );
        default:
            return (
                <svg width="100%" height="100%" viewBox="0 0 160 290" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <pattern id="cubesT" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                            <rect width="16" height="16" fill="#0f172a" />
                            <circle cx="8" cy="8" r="1.5" fill="#334155" opacity="0.6" />
                        </pattern>
                    </defs>
                    <rect width="160" height="290" fill="url(#cubesT)" />
                    <rect x="6" y="6" width="148" height="278" fill="none" stroke="#334155" strokeWidth="1.5" rx="4" />
                    {/* Top image placeholder area */}
                    <rect x="6" y="6" width="148" height="120" fill="#1e293b" />
                    <circle cx="80" cy="66" r="28" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                    <text x="80" y="71" textAnchor="middle" fontSize="20" fill="#94a3b8" fontFamily="sans-serif">✨</text>
                    <text x="80" y="158" textAnchor="middle" fontSize="12" fill="#e2e8f0" fontWeight="bold">Custom Theme</text>
                    <text x="80" y="175" textAnchor="middle" fontSize="7" fill="#94a3b8" letterSpacing="1">NEWLY UPLOADED</text>
                </svg>
            );
    }
}



// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES array removed — Supabase DB is the single source of truth.
// All template data (name, tier, is_live, demo_url, thumbnail_url) comes from
// the `templates` table via getTemplates().
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Server Component — fetches template flags from Supabase at request time
// ─────────────────────────────────────────────────────────────────────────────
export default function Templates() {
    const [templates, setTemplates] = useState<Array<{
        id: string;
        name: string;
        tier: "basic" | "premium";
        desc: string;
        isLive: boolean;
        href?: string;
        thumbnailUrl: string | null;
    }>>([]);

    // Fetch all templates from Supabase — single source of truth
    useEffect(() => {
        const fetchTemplates = async () => {
            const dbTemplates = await getTemplates();

            const allTemplates = dbTemplates.map(db => ({
                id: db.id,
                name: db.name,
                tier: (db.tier as "basic" | "premium") || "basic",
                desc: db.description || "A beautifully crafted custom design.",
                isLive: db.is_live,
                href: db.demo_url ?? undefined,
                thumbnailUrl: db.thumbnail_url ?? null,
            }));

            // Sort: Live + Demo URL first, then Live, then Coming Soon
            allTemplates.sort((a, b) => {
                const aReady = a.isLive && !!a.href;
                const bReady = b.isLive && !!b.href;

                if (aReady && !bReady) return -1;
                if (!aReady && bReady) return 1;
                if (a.isLive && !b.isLive) return -1;
                if (!a.isLive && b.isLive) return 1;
                return 0;
            });

            setTemplates(allTemplates);
        };
        fetchTemplates();
    }, []);

    return (
        <section className="templates" id="templates">
            <div className="section-header">
                <div className="eyebrow">Beautiful Designs</div>
                <h2 className="sec-title">Choose Your Template</h2>
                <p className="sec-desc">Every template is designed with elegance and attention to detail. Hover to preview.</p>
            </div>
            <div className="templates-grid scrollbar-hide">
                {templates.map((t) => {
                    const isComingSoon = !t.isLive;
                    return (
                        <div className={`template-card group relative snap-center shrink-0 w-[64vw] sm:w-auto bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-xl transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-200 ${isComingSoon ? 'grayscale opacity-70' : ''}`} key={t.id}>
                            <div className="template-preview relative overflow-hidden bg-slate-50" style={{ aspectRatio: '1/1.75' }}>
                                {/* Image / SVG */}
                                {t.thumbnailUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-emerald-50/20">
                                        <TemplateSVG id={t.id} />
                                    </div>
                                )}

                                {/* Premium Glass Overlay Tray */}
                                <div className="absolute inset-x-3 bottom-3 z-20">
                                    <div className="p-5 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-serif text-xl font-black text-slate-800 leading-tight">{t.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${t.tier === 'premium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                        {t.tier}
                                                    </span>
                                                </div>
                                            </div>
                                            {t.isLive && t.href && (
                                                <a href={t.href} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/5 hover:bg-slate-800/10 rounded-full transition-colors text-slate-800">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                </a>
                                            )}
                                        </div>

                                        <a 
                                            href="/#pricing" 
                                            className="w-full py-2.5 text-center bg-slate-900 hover:bg-black text-white text-[11px] font-black rounded-xl transition-all shadow-lg"
                                        >
                                            {isComingSoon ? "Coming Soon" : "Get This Template →"}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="scroll-hint">swipe to explore designs</div>
        </section>
    );
}
