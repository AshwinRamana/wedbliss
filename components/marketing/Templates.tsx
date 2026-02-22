import Link from "next/link";
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
                <svg width="100%" height="100%" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="240" fill="#fdf6ec" />
                    <circle cx="0" cy="0" r="80" fill="rgba(251,207,232,0.15)" /><circle cx="320" cy="240" r="80" fill="rgba(251,207,232,0.15)" />
                    <rect x="8" y="8" width="304" height="224" fill="none" stroke="#c8a070" strokeWidth="1" rx="2" />
                    <path d="M30 28 Q80 18 160 20 Q240 18 290 28" stroke="#c8a070" strokeWidth="1" fill="none" />
                    <circle cx="50" cy="24" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <circle cx="90" cy="20" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <circle cx="160" cy="18" r="6" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <circle cx="230" cy="20" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <circle cx="270" cy="24" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                    <text x="160" y="62" textAnchor="middle" fontSize="20" fill="#c8922a" opacity="0.45" fontFamily="serif">ஓம்</text>
                    <text x="160" y="88" textAnchor="middle" fontSize="8" fill="#8b6040" letterSpacing="3" opacity="0.65">WEDDING INVITATION</text>
                    <line x1="80" y1="95" x2="240" y2="95" stroke="#c8a070" strokeWidth="0.5" opacity="0.6" />
                    <text x="160" y="116" textAnchor="middle" fontSize="15" fill="#4a2c0a" fontFamily="Georgia,serif" fontStyle="italic">Siva &amp; Hema</text>
                    <text x="160" y="129" textAnchor="middle" fontSize="7" fill="#8b6040" letterSpacing="2">KALYANAM</text>
                    <line x1="100" y1="136" x2="220" y2="136" stroke="#c8a070" strokeWidth="0.5" opacity="0.5" />
                    <text x="160" y="151" textAnchor="middle" fontSize="7.5" fill="#6b4020">12 May 2026 · 6:48 AM</text>
                    <text x="160" y="164" textAnchor="middle" fontSize="7" fill="#8b6040">Padmavathi Kalyana Mandapam</text>
                    <text x="160" y="176" textAnchor="middle" fontSize="6.5" fill="#8b6040">Tirupati Road, Chennai 600 028</text>
                    <text x="160" y="193" textAnchor="middle" fontSize="6.5" fill="#a08060">S/o Rajan &amp; Viji · D/o Kumar &amp; Thenmozhi</text>
                    <circle cx="28" cy="218" r="6" fill="white" stroke="#e8c8a0" strokeWidth="0.5" opacity="0.7" />
                    <circle cx="292" cy="218" r="6" fill="white" stroke="#e8c8a0" strokeWidth="0.5" opacity="0.7" />
                </svg>
            );
        case "tm-kovil":
            return (
                <svg width="100%" height="100%" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="240" fill="#0a3d25" />
                    <rect x="8" y="8" width="304" height="224" fill="none" stroke="#d4af37" strokeWidth="1.5" rx="2" />
                    <path d="M100 8 L100 70 Q100 88 118 93 L160 98 L202 93 Q220 88 220 70 L220 8" fill="#0d5c35" stroke="#d4af37" strokeWidth="1" />
                    <rect x="120" y="16" width="80" height="11" rx="2" fill="#b8960f" opacity="0.7" />
                    <rect x="128" y="26" width="64" height="9" rx="2" fill="#c8a010" opacity="0.6" />
                    <rect x="136" y="34" width="48" height="8" rx="2" fill="#d4af37" opacity="0.6" />
                    <rect x="144" y="41" width="32" height="7" rx="2" fill="#c8a010" opacity="0.5" />
                    <ellipse cx="160" cy="14" rx="6" ry="9" fill="#d4af37" opacity="0.9" />
                    <text x="160" y="120" textAnchor="middle" fontSize="22" fill="#d4af37" fontFamily="serif">ஓம்</text>
                    <text x="160" y="142" textAnchor="middle" fontSize="11" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Karthik &amp; Priya</text>
                    <text x="160" y="155" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.6)" letterSpacing="1">KALYANAM</text>
                    <line x1="80" y1="162" x2="240" y2="162" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
                    <text x="160" y="173" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.75)">28 Feb 2026 · 9:12 AM Nalla Neram</text>
                    <text x="160" y="185" textAnchor="middle" fontSize="7" fill="rgba(255,215,0,0.65)">Kapaleeshwarar Temple, Mylapore</text>
                    <text x="160" y="200" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.38)">திருமண அழைப்பிதழ்</text>
                    <ellipse cx="30" cy="16" rx="8" ry="5" fill="#15803d" opacity="0.6" transform="rotate(-20 30 16)" />
                    <ellipse cx="290" cy="16" rx="8" ry="5" fill="#15803d" opacity="0.6" transform="rotate(20 290 16)" />
                    <circle cx="30" cy="195" r="5" fill="#d4af37" opacity="0.3" />
                    <circle cx="290" cy="195" r="5" fill="#d4af37" opacity="0.3" />
                </svg>
            );
        case "tm-tanjore":
            return (
                <svg width="100%" height="100%" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="240" fill="#6b0f0f" />
                    <rect x="6" y="6" width="308" height="228" fill="none" stroke="#d4af37" strokeWidth="2" rx="2" />
                    <circle cx="20" cy="20" r="8" fill="#d4af37" opacity="0.55" /><circle cx="300" cy="20" r="8" fill="#d4af37" opacity="0.55" />
                    <circle cx="20" cy="220" r="8" fill="#d4af37" opacity="0.55" /><circle cx="300" cy="220" r="8" fill="#d4af37" opacity="0.55" />
                    <ellipse cx="160" cy="52" rx="22" ry="28" fill="#d4af37" opacity="0.18" />
                    <ellipse cx="160" cy="40" rx="14" ry="18" fill="#b8960f" opacity="0.35" />
                    <ellipse cx="160" cy="34" rx="10" ry="12" fill="#d4af37" opacity="0.4" />
                    <path d="M157 42 Q150 52 155 57 Q162 63 168 57" stroke="#d4af37" strokeWidth="2.5" fill="none" opacity="0.55" />
                    <path d="M152 22 L156 15 L160 10 L164 15 L168 22" fill="#d4af37" opacity="0.7" />
                    <text x="160" y="92" textAnchor="middle" fontSize="9" fill="#ffd700" letterSpacing="2" opacity="0.8">✦ KALYANAM ✦</text>
                    <text x="160" y="112" textAnchor="middle" fontSize="13" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Arun &amp; Kavitha</text>
                    <line x1="70" y1="119" x2="250" y2="119" stroke="#d4af37" strokeWidth="0.7" opacity="0.5" />
                    <text x="160" y="133" textAnchor="middle" fontSize="7.5" fill="rgba(255,215,0,0.75)">Vivaha Muhurtham</text>
                    <text x="160" y="147" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">15 Mar 2026 · 7:48 AM</text>
                    <text x="160" y="162" textAnchor="middle" fontSize="7" fill="rgba(255,215,0,0.65)">Meenakshi Kalyana Mandapam, Madurai</text>
                </svg>
            );
        case "tm-peacock":
            return (
                <svg width="100%" height="100%" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                    <defs><radialGradient id="pcbgT" cx="50%" cy="30%"><stop offset="0%" stopColor="#1a5c70" /><stop offset="100%" stopColor="#0e1a4a" /></radialGradient></defs>
                    <rect width="320" height="240" fill="url(#pcbgT)" />
                    <rect x="7" y="7" width="306" height="226" fill="none" stroke="#14b8a6" strokeWidth="1.5" rx="2" />
                    <line x1="160" y1="72" x2="98" y2="8" stroke="#14b8a6" strokeWidth="1.5" opacity="0.7" /><line x1="160" y1="72" x2="118" y2="6" stroke="#0d9488" strokeWidth="1.5" opacity="0.75" />
                    <line x1="160" y1="72" x2="140" y2="6" stroke="#14b8a6" strokeWidth="2" opacity="0.8" /><line x1="160" y1="72" x2="160" y2="6" stroke="#0d9488" strokeWidth="2" opacity="0.9" />
                    <line x1="160" y1="72" x2="180" y2="6" stroke="#14b8a6" strokeWidth="2" opacity="0.8" /><line x1="160" y1="72" x2="202" y2="6" stroke="#0d9488" strokeWidth="1.5" opacity="0.75" />
                    <line x1="160" y1="72" x2="222" y2="8" stroke="#14b8a6" strokeWidth="1.5" opacity="0.7" />
                    <circle cx="160" cy="7" r="8" fill="#14b8a6" opacity="0.7" /><circle cx="160" cy="7" r="5" fill="#7c3aed" opacity="0.7" /><circle cx="160" cy="7" r="2.5" fill="#d4af37" />
                    <line x1="160" y1="56" x2="160" y2="84" stroke="#d4af37" strokeWidth="2.5" opacity="0.8" />
                    <polygon points="160,50 155,62 165,62" fill="#d4af37" opacity="0.9" />
                    <text x="160" y="105" textAnchor="middle" fontSize="8" fill="#14b8a6" letterSpacing="2">✦ திருமணம் ✦</text>
                    <text x="160" y="124" textAnchor="middle" fontSize="13" fill="#d4af37" fontFamily="Georgia,serif" fontWeight="bold">Deepak &amp; Meena</text>
                    <line x1="80" y1="131" x2="240" y2="131" stroke="#14b8a6" strokeWidth="0.5" opacity="0.5" />
                    <text x="160" y="144" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.75)">5 April 2026 · 10:24 AM Nalla Neram</text>
                    <text x="160" y="157" textAnchor="middle" fontSize="7" fill="rgba(20,184,166,0.8)">Vel Murugan Mandapam, Chennai</text>
                </svg>
            );
        case "tm-vilakku":
            return (
                <svg width="100%" height="100%" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="vbgT" cx="50%" cy="50%"><stop offset="0%" stopColor="#3d1f00" /><stop offset="100%" stopColor="#1a0a00" /></radialGradient>
                        <radialGradient id="vg2T" cx="50%" cy="0%"><stop offset="0%" stopColor="rgba(255,180,0,0.26)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                    </defs>
                    <rect width="320" height="240" fill="url(#vbgT)" />
                    <ellipse cx="160" cy="90" rx="130" ry="80" fill="url(#vg2T)" />
                    <rect x="7" y="7" width="306" height="226" fill="none" stroke="#d4af37" strokeWidth="1.5" rx="2" />
                    <polygon points="7,7 20,7 7,20" fill="#d4af37" opacity="0.5" /><polygon points="313,7 300,7 313,20" fill="#d4af37" opacity="0.5" />
                    <polygon points="7,233 20,233 7,220" fill="#d4af37" opacity="0.5" /><polygon points="313,233 300,233 313,220" fill="#d4af37" opacity="0.5" />
                    <ellipse cx="160" cy="100" rx="28" ry="6" fill="#b8960f" opacity="0.8" />
                    <rect x="146" y="76" width="28" height="24" rx="4" fill="#c8922a" opacity="0.9" />
                    <ellipse cx="160" cy="76" rx="30" ry="9" fill="#d4af37" />
                    <rect x="155" y="54" width="10" height="24" rx="3" fill="#c8922a" opacity="0.8" />
                    <ellipse cx="160" cy="54" rx="22" ry="7" fill="#d4af37" opacity="0.9" />
                    <ellipse cx="160" cy="48" rx="3" ry="6.5" fill="#fbbf24" /><ellipse cx="160" cy="43" rx="2" ry="5" fill="white" opacity="0.85" />
                    <text x="160" y="122" textAnchor="middle" fontSize="9" fill="#fbbf24" letterSpacing="1.5">KALYANA VILAKKU</text>
                    <text x="160" y="142" textAnchor="middle" fontSize="13" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Raj &amp; Anitha</text>
                    <line x1="75" y1="149" x2="245" y2="149" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
                    <text x="160" y="175" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">22 Feb 2026 · 8:36 AM</text>
                    <text x="160" y="188" textAnchor="middle" fontSize="7" fill="rgba(255,200,80,0.65)">Bhavani Mandapam, Coimbatore</text>
                </svg>
            );
        case "tm-kanjivaram":
            return (
                <svg width="100%" height="100%" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="sw2T" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#1a0a3d" /><line x1="0" y1="8" x2="16" y2="8" stroke="rgba(212,175,55,0.08)" strokeWidth="0.5" /><line x1="8" y1="0" x2="8" y2="16" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" /></pattern></defs>
                    <rect width="320" height="240" fill="url(#sw2T)" />
                    <rect x="6" y="6" width="308" height="228" fill="none" stroke="#d4af37" strokeWidth="3" rx="2" />
                    <rect x="6" y="6" width="22" height="228" fill="rgba(212,175,55,0.1)" />
                    <rect x="292" y="6" width="22" height="228" fill="rgba(212,175,55,0.1)" />
                    <circle cx="160" cy="52" r="28" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.5" />
                    <circle cx="160" cy="52" r="18" fill="rgba(212,175,55,0.1)" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
                    <circle cx="160" cy="52" r="6" fill="#d4af37" opacity="0.6" />
                    <text x="160" y="98" textAnchor="middle" fontSize="8" fill="#d4af37" letterSpacing="2.5">கல்யாணம்</text>
                    <line x1="60" y1="105" x2="260" y2="105" stroke="#d4af37" strokeWidth="0.7" opacity="0.4" />
                    <text x="160" y="123" textAnchor="middle" fontSize="14" fill="#d4af37" fontFamily="Georgia,serif" fontWeight="bold">Vikram &amp; Lavanya</text>
                    <text x="160" y="136" textAnchor="middle" fontSize="7" fill="rgba(212,175,55,0.6)" letterSpacing="1.5">VIVAHA MUHURTHAM</text>
                    <line x1="60" y1="143" x2="260" y2="143" stroke="#d4af37" strokeWidth="0.7" opacity="0.35" />
                    <text x="160" y="157" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">18 June 2026 · 9:12 AM</text>
                    <text x="160" y="170" textAnchor="middle" fontSize="7" fill="rgba(212,175,55,0.65)">Kanchi Kamakshi Mandapam</text>
                    <text x="160" y="182" textAnchor="middle" fontSize="7" fill="rgba(212,175,55,0.5)">Mumbai, India</text>
                </svg>
            );
        default:
            return (
                <svg width="100%" height="100%" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="240" fill="#fdf6ec" />
                    <text x="160" y="120" textAnchor="middle" fontSize="14" fill="#8b6040">Template Preview</text>
                </svg>
            );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback static array (used by Hero.tsx and as a code reference).
// The landing page Templates section fetches live data from Supabase.
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATES = [
    { id: "tm-mallipoo", name: "Malli Poo", tier: "basic" as const, desc: "Jasmine-inspired minimal design. Ivory and soft rose gold.", isLive: false, href: undefined as string | undefined },
    { id: "tm-kovil", name: "Kovil Gopuram", tier: "basic" as const, desc: "Temple architecture with rising sun. Forest green & 24k gold.", isLive: false, href: undefined as string | undefined },
    { id: "tm-tanjore", name: "Tanjore Gold", tier: "basic" as const, desc: "Classic crimson and gold with Tanjore art. Regal and traditional.", isLive: false, href: undefined as string | undefined },
    { id: "tm-peacock", name: "Peacock Majesty", tier: "premium" as const, desc: "Lord Muruga's peacock with Vel motif. Teal and gold.", isLive: false, href: undefined as string | undefined },
    { id: "tm-vilakku", name: "Kuthu Vilakku", tier: "premium" as const, desc: "Traditional oil lamp with warm amber glow. Festive and bright.", isLive: false, href: undefined as string | undefined },
    { id: "tm-kanjivaram", name: "Kanjivaram Silk", tier: "premium" as const, desc: "Silk saree weave patterns. Deep navy & zari gold borders.", isLive: false, href: undefined as string | undefined },
];

// ─────────────────────────────────────────────────────────────────────────────
// Server Component — fetches template flags from Supabase at request time
// ─────────────────────────────────────────────────────────────────────────────
export default async function Templates() {
    // Fetch live template registry from Supabase
    const dbTemplates = await getTemplates();

    // Merge DB data (is_live, demo_url, thumbnail_url) onto the static SVG list by ID
    const merged = TEMPLATES.map(t => {
        const db = dbTemplates.find(d => d.id === t.id);
        return {
            ...t,
            isLive: db?.is_live ?? t.isLive,
            href: db?.demo_url ?? undefined,
            thumbnailUrl: db?.thumbnail_url ?? null,
            desc: db?.description ?? t.desc,
        };
    });

    return (
        <section className="templates" id="templates">
            <div className="section-header">
                <div className="eyebrow">Beautiful Designs</div>
                <h2 className="sec-title">Choose Your Template</h2>
                <p className="sec-desc">Every template is designed with elegance and attention to detail. Hover to preview.</p>
            </div>
            <div className="templates-grid">
                {merged.map((t) => (
                    <div className="template-card" key={t.id}>
                        <div className="template-preview">
                            {/* Hover overlay */}
                            <div className="tprev-overlay">
                                {t.isLive && t.href ? (
                                    <a href={t.href} target="_blank" rel="noopener noreferrer" className="tprev-btn">
                                        View Demo →
                                    </a>
                                ) : (
                                    <button className="tprev-btn" style={{ opacity: 0.6, cursor: "not-allowed" }}>
                                        Coming Soon
                                    </button>
                                )}
                            </div>

                            {/* If admin set a thumbnail_url, show the real image; else fall back to SVG */}
                            {t.thumbnailUrl ? (
                                <img src={t.thumbnailUrl} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <TemplateSVG id={t.id} />
                            )}
                        </div>
                        <div className="t-info">
                            <div className="t-name" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                {t.name}
                                {t.isLive && (
                                    <span style={{
                                        fontSize: "10px", background: "#d1fae5", color: "#065f46",
                                        padding: "2px 8px", borderRadius: "999px", fontWeight: 700,
                                        letterSpacing: "0.05em", textTransform: "uppercase"
                                    }}>Live Demo</span>
                                )}
                            </div>
                            <p className="t-desc">{t.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="scroll-hint">swipe to explore</div>
        </section>
    );
}
