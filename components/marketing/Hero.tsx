"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { getTemplates, DbTemplate } from "@/lib/db";
import { TemplateSVG } from "./Templates";

export default function Hero() {
    const [liveUrls, setLiveUrls] = useState<Record<string, string | null>>({});
    const [heroTemplates, setHeroTemplates] = useState<DbTemplate[]>([]);

    // Carousel state
    const [currentIdx, setCurrentIdx] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const fetchUrls = async () => {
            const dbTemplates = await getTemplates();
            const urlMap: Record<string, string | null> = {};
            dbTemplates.forEach((t: DbTemplate) => {
                urlMap[t.id] = t.demo_url || null;
            });
            setLiveUrls(urlMap);
            setHeroTemplates(dbTemplates.filter(t => t.is_hero));
        };
        fetchUrls();
    }, []);

    // Carousel Auto-play logic
    useEffect(() => {
        if (heroTemplates.length <= 1) return;

        const startAutoPlay = () => {
            if (autoTimerRef.current) clearInterval(autoTimerRef.current);
            autoTimerRef.current = setInterval(() => {
                setCurrentIdx((prev: number) => (prev + 1) % Math.min(4, heroTemplates.length));
            }, 3500);
        };

        startAutoPlay();

        return () => {
            if (autoTimerRef.current) clearInterval(autoTimerRef.current);
        };
    }, [heroTemplates.length]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
        if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null || heroTemplates.length <= 1) return;
        const touchEnd = e.changedTouches[0].clientX;
        const dx = touchEnd - touchStart;
        const total = Math.min(4, heroTemplates.length);

        if (dx < -40) {
            // Swipe left -> next
            setCurrentIdx((prev: number) => (prev + 1) % total);
        } else if (dx > 40) {
            // Swipe right -> prev
            setCurrentIdx((prev: number) => (prev - 1 + total) % total);
        }

        setTouchStart(null);

        // Restart autoplay
        if (autoTimerRef.current) clearInterval(autoTimerRef.current);
        autoTimerRef.current = setInterval(() => {
            setCurrentIdx((prev: number) => (prev + 1) % total);
        }, 3500);
    };

    return (
        <section className="hero">
            <div className="orb orb1"></div>
            <div className="orb orb2"></div>
            <div className="orb orb3"></div>
            {/* Kolam - Left Middle, 50% visible */}
            <div className="hero-kolam hero-kolam-left">
                <Image src="/kolam.png" alt="" width={500} height={500} priority style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            {/* Kolam - Center */}
            <div className="hero-kolam hero-kolam-center">
                <Image src="/kolam.png" alt="" width={500} height={500} priority style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            {/* Kolam - Right Middle, 50% visible */}
            <div className="hero-kolam hero-kolam-right">
                <Image src="/kolam.png" alt="" width={500} height={500} priority style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            {/* vilakku — top-left edge */}
            <div className="td td1">
                <svg width="48" height="66" viewBox="0 0 52 72" fill="none" opacity="0.30">
                    <ellipse cx="26" cy="68" rx="13" ry="4" fill="#d4af37" opacity="0.5" />
                    <rect x="22" y="35" width="8" height="27" rx="2" fill="#c8922a" opacity="0.8" />
                    <ellipse cx="26" cy="35" rx="16" ry="6" fill="#d4af37" />
                    <path d="M20 35 Q16 29 20 23 Q24 17 26 19 Q28 17 32 23 Q36 29 32 35" fill="#b8730a" opacity="0.85" />
                    <ellipse cx="26" cy="23" rx="7" ry="10" fill="#e8a020" opacity="0.7" />
                    <ellipse cx="26" cy="13" rx="4" ry="7" fill="#ffd700" opacity="0.9" />
                    <ellipse cx="26" cy="11" rx="2.5" ry="5" fill="#fff3a0" />
                    <ellipse cx="26" cy="9" rx="1.5" ry="3" fill="white" opacity="0.8" />
                    <rect x="18" y="60" width="16" height="4" rx="2" fill="#c8922a" opacity="0.6" />
                </svg>
            </div>

            {/* thali — above the headline text */}
            <div className="td td2">
                <svg width="46" height="52" viewBox="0 0 50 60" fill="none" opacity="0.26">
                    <path d="M8 4 Q25 2 42 4 Q46 20 42 36 Q36 52 25 56 Q14 52 8 36 Q4 20 8 4" stroke="#d4af37" strokeWidth="2" fill="none" strokeDasharray="4 2" />
                    <circle cx="25" cy="52" r="7" fill="#d4af37" opacity="0.9" />
                    <circle cx="25" cy="52" r="4.5" fill="#b8960f" opacity="0.7" />
                    <text x="25" y="55.5" textAnchor="middle" fontSize="7" fill="#ffd700" fontFamily="serif">ஓம்</text>
                    <path d="M10 8 Q25 6 40 8" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.5" />
                </svg>
            </div>

            {/* coconut — top-right */}
            <div className="td td3">
                <svg width="36" height="50" viewBox="0 0 40 54" fill="none" opacity="0.28">
                    <path d="M20 18 Q14 8 6 4" stroke="#15803d" strokeWidth="2" fill="none" />
                    <path d="M20 18 Q20 6 18 0" stroke="#16a34a" strokeWidth="2" fill="none" />
                    <path d="M20 18 Q26 8 34 4" stroke="#15803d" strokeWidth="2" fill="none" />
                    <circle cx="6" cy="4" r="3.5" fill="#fbbf24" opacity="0.8" />
                    <circle cx="18" cy="0" r="3.5" fill="white" opacity="0.9" />
                    <circle cx="34" cy="4" r="3.5" fill="#fbbf24" opacity="0.8" />
                    <ellipse cx="20" cy="36" rx="15" ry="17" fill="#78350f" opacity="0.75" />
                    <ellipse cx="20" cy="36" rx="12" ry="14" fill="#92400e" opacity="0.4" />
                    <circle cx="16" cy="34" r="2" fill="#451a03" opacity="0.6" />
                    <circle cx="22" cy="32" r="2" fill="#451a03" opacity="0.6" />
                    <circle cx="19" cy="38" r="2" fill="#451a03" opacity="0.6" />
                </svg>
            </div>

            {/* kolam — right mid */}
            <div className="td td4">
                <svg width="60" height="60" viewBox="0 0 70 70" fill="none" opacity="0.20">
                    <circle cx="35" cy="35" r="32" stroke="#d4af37" strokeWidth="0.8" fill="none" strokeDasharray="3 2" />
                    <circle cx="35" cy="35" r="22" stroke="#d4af37" strokeWidth="0.8" fill="none" />
                    <circle cx="35" cy="35" r="12" stroke="#f59e0b" strokeWidth="1" fill="none" />
                    <circle cx="35" cy="35" r="4" fill="#d4af37" opacity="0.6" />
                    <circle cx="35" cy="3" r="2" fill="#d4af37" opacity="0.7" />
                    <circle cx="35" cy="67" r="2" fill="#d4af37" opacity="0.7" />
                    <circle cx="3" cy="35" r="2" fill="#d4af37" opacity="0.7" />
                    <circle cx="67" cy="35" r="2" fill="#d4af37" opacity="0.7" />
                    <circle cx="12" cy="12" r="2" fill="#d4af37" opacity="0.6" />
                    <circle cx="58" cy="12" r="2" fill="#d4af37" opacity="0.6" />
                    <circle cx="12" cy="58" r="2" fill="#d4af37" opacity="0.6" />
                    <circle cx="58" cy="58" r="2" fill="#d4af37" opacity="0.6" />
                    <ellipse cx="35" cy="18" rx="4" ry="9" fill="#d4af37" opacity="0.25" />
                    <ellipse cx="35" cy="52" rx="4" ry="9" fill="#d4af37" opacity="0.25" />
                    <ellipse cx="18" cy="35" rx="9" ry="4" fill="#d4af37" opacity="0.25" />
                    <ellipse cx="52" cy="35" rx="9" ry="4" fill="#d4af37" opacity="0.25" />
                </svg>
            </div>

            {/* nadaswaram — left mid */}
            <div className="td td5">
                <svg width="60" height="28" viewBox="0 0 64 30" fill="none" opacity="0.22">
                    <path d="M4 14 L48 14 Q56 14 60 20 Q62 24 60 26 L4 26 Q2 20 4 14Z" fill="#92400e" opacity="0.8" />
                    <path d="M4 14 L48 14 Q56 14 60 10 Q62 6 60 4 L4 4 Q2 10 4 14Z" fill="#78350f" opacity="0.7" />
                    <ellipse cx="60" cy="15" rx="6" ry="12" fill="#b8960f" opacity="0.7" />
                    <circle cx="16" cy="15" r="2" fill="#fcd34d" opacity="0.6" />
                    <circle cx="24" cy="15" r="2" fill="#fcd34d" opacity="0.6" />
                    <circle cx="32" cy="15" r="2" fill="#fcd34d" opacity="0.6" />
                    <circle cx="40" cy="15" r="2" fill="#fcd34d" opacity="0.6" />
                    <rect x="8" y="4" width="2" height="22" rx="1" fill="#d4af37" opacity="0.5" />
                    <rect x="44" y="4" width="2" height="22" rx="1" fill="#d4af37" opacity="0.5" />
                    <rect x="0" y="13" width="6" height="4" rx="2" fill="#d4af37" opacity="0.6" />
                </svg>
            </div>

            {/* agni — below left text block */}
            <div className="td td6">
                <svg width="38" height="50" viewBox="0 0 44 54" fill="none" opacity="0.26">
                    <ellipse cx="22" cy="50" rx="14" ry="4" fill="#92400e" opacity="0.6" />
                    <rect x="10" y="42" width="24" height="8" rx="2" fill="#78350f" opacity="0.5" />
                    <path d="M22 42 Q16 34 20 26 Q22 20 22 16 Q22 20 24 26 Q28 34 22 42" fill="#f59e0b" opacity="0.8" />
                    <path d="M16 40 Q10 32 14 22 Q18 14 16 8 Q20 16 18 26 Q16 34 16 40" fill="#ef4444" opacity="0.6" />
                    <path d="M28 40 Q34 32 30 22 Q26 14 28 8 Q24 16 26 26 Q28 34 28 40" fill="#ef4444" opacity="0.6" />
                    <ellipse cx="22" cy="20" rx="5" ry="8" fill="#fbbf24" opacity="0.7" />
                    <ellipse cx="22" cy="14" rx="3" ry="6" fill="#fef08a" opacity="0.8" />
                    <ellipse cx="22" cy="10" rx="2" ry="4" fill="white" opacity="0.6" />
                </svg>
            </div>

            {/* thoranam — bottom-left */}
            <div className="td td7">
                <svg width="72" height="32" viewBox="0 0 80 36" fill="none" opacity="0.25">
                    <path d="M2 6 Q40 2 78 6" stroke="#92400e" strokeWidth="1.5" fill="none" />
                    <ellipse cx="10" cy="18" rx="5" ry="14" fill="#15803d" opacity="0.7" transform="rotate(-8 10 18)" />
                    <ellipse cx="22" cy="20" rx="5" ry="14" fill="#16a34a" opacity="0.65" transform="rotate(-3 22 20)" />
                    <ellipse cx="34" cy="22" rx="5" ry="14" fill="#15803d" opacity="0.7" />
                    <ellipse cx="46" cy="22" rx="5" ry="14" fill="#16a34a" opacity="0.65" transform="rotate(3 46 22)" />
                    <ellipse cx="58" cy="20" rx="5" ry="14" fill="#15803d" opacity="0.7" transform="rotate(5 58 20)" />
                    <ellipse cx="70" cy="18" rx="5" ry="14" fill="#16a34a" opacity="0.65" transform="rotate(8 70 18)" />
                    <circle cx="4" cy="6" r="5" fill="#f59e0b" opacity="0.8" />
                    <circle cx="40" cy="4" r="5.5" fill="#ef4444" opacity="0.7" />
                    <circle cx="76" cy="6" r="5" fill="#f59e0b" opacity="0.8" />
                </svg>
            </div>

            {/* maalai — bottom center */}
            <div className="td td8">
                <svg width="62" height="40" viewBox="0 0 64 44" fill="none" opacity="0.27">
                    <path d="M4 8 Q15 20 32 22 Q49 20 60 8" stroke="#047857" strokeWidth="1.5" fill="none" />
                    <circle cx="4" cy="8" r="5" fill="white" opacity="0.9" />
                    <circle cx="4" cy="8" r="3" fill="#fefce8" />
                    <circle cx="16" cy="15" r="4.5" fill="white" opacity="0.85" />
                    <circle cx="28" cy="20" r="5" fill="white" />
                    <circle cx="28" cy="20" r="3" fill="#fefce8" />
                    <circle cx="32" cy="22" r="5.5" fill="white" />
                    <circle cx="32" cy="22" r="3.5" fill="#fef9c3" />
                    <circle cx="46" cy="20" r="5" fill="white" opacity="0.85" />
                    <circle cx="56" cy="15" r="4.5" fill="white" opacity="0.85" />
                    <circle cx="60" cy="8" r="5" fill="white" />
                    <ellipse cx="8" cy="28" rx="4" ry="8" fill="#15803d" opacity="0.6" transform="rotate(-20 8 28)" />
                    <ellipse cx="24" cy="34" rx="4" ry="8" fill="#16a34a" opacity="0.55" transform="rotate(-5 24 34)" />
                    <ellipse cx="40" cy="34" rx="4" ry="8" fill="#15803d" opacity="0.55" transform="rotate(5 40 34)" />
                    <ellipse cx="56" cy="28" rx="4" ry="8" fill="#16a34a" opacity="0.6" transform="rotate(20 56 28)" />
                    <circle cx="16" cy="14" r="4" fill="#f59e0b" opacity="0.7" />
                    <circle cx="48" cy="14" r="4" fill="#f59e0b" opacity="0.7" />
                </svg>
            </div>

            {/* vilakku small — bottom-right */}
            <div className="td td9">
                <svg width="34" height="46" viewBox="0 0 44 60" fill="none" opacity="0.24">
                    <ellipse cx="22" cy="56" rx="10" ry="3" fill="#d4af37" opacity="0.5" />
                    <rect x="18" y="32" width="8" height="20" rx="2" fill="#c8922a" opacity="0.8" />
                    <ellipse cx="22" cy="32" rx="14" ry="5" fill="#d4af37" />
                    <path d="M16 32 Q12 26 16 21 Q20 16 22 18 Q24 16 28 21 Q32 26 28 32" fill="#b8730a" opacity="0.85" />
                    <ellipse cx="22" cy="21" rx="6" ry="9" fill="#e8a020" opacity="0.7" />
                    <ellipse cx="22" cy="12" rx="3.5" ry="6" fill="#ffd700" opacity="0.9" />
                    <ellipse cx="22" cy="10" rx="2" ry="4" fill="#fff3a0" />
                    <ellipse cx="22" cy="8" rx="1.2" ry="3" fill="white" opacity="0.8" />
                </svg>
            </div>

            {/* coconut small — left of headline */}
            <div className="td td10">
                <svg width="30" height="38" viewBox="0 0 36 48" fill="none" opacity="0.20">
                    <path d="M18 14 Q12 6 5 2" stroke="#15803d" strokeWidth="1.8" fill="none" />
                    <path d="M18 14 Q18 5 17 0" stroke="#16a34a" strokeWidth="1.8" fill="none" />
                    <path d="M18 14 Q24 6 31 2" stroke="#15803d" strokeWidth="1.8" fill="none" />
                    <circle cx="5" cy="2" r="3" fill="#fbbf24" opacity="0.7" />
                    <circle cx="17" cy="0" r="3" fill="white" opacity="0.8" />
                    <circle cx="31" cy="2" r="3" fill="#fbbf24" opacity="0.7" />
                    <ellipse cx="18" cy="32" rx="13" ry="15" fill="#78350f" opacity="0.7" />
                    <circle cx="14" cy="30" r="1.8" fill="#451a03" opacity="0.5" />
                    <circle cx="20" cy="28" r="1.8" fill="#451a03" opacity="0.5" />
                    <circle cx="17" cy="34" r="1.8" fill="#451a03" opacity="0.5" />
                </svg>
            </div>

            <div className="hero-content">
                <div className="hero-left">
                    <div className="hero-badge"><span className="sparkle">✨</span> Digital Wedding Invitations</div>
                    <h1 className="hero-h1">Create stunning <span className="grad">wedding</span> invitations in minutes</h1>
                    <p className="hero-sub">Interactive, elegant, and beautifully crafted. Live countdowns, music, maps, and WhatsApp sharing. Starting at just ₹999.</p>
                    <div className="hero-cta">
                        <a href="#pricing" className="btn-h primary"><span>Create Your Invitation</span></a>
                        <a href="#templates" className="btn-h secondary">View Templates</a>
                    </div>
                    <div className="hero-stats">
                        <div><div className="stat-num">500+</div><div className="stat-lbl">Couples Celebrated</div></div>
                        <div><div className="stat-num">10 Min</div><div className="stat-lbl">Go Live Time</div></div>
                        <div><div className="stat-num">₹999</div><div className="stat-lbl">Starting Price</div></div>
                    </div>
                </div>

                <div className="hero-right">

                    {/* ── Desktop 2-col grid (hidden on mobile via CSS) ── */}
                    <div className="hero-cards">
                        {heroTemplates.length === 0 ? (
                            /* Skeleton loading cards */
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="hero-card bg-slate-100/10 animate-pulse border border-slate-200/10 rounded-xl" style={{ height: "214px" }} />
                            ))
                        ) : (
                            heroTemplates.slice(0, 4).map(t => (
                                <div key={t.id} className="hero-card relative overflow-hidden">
                                    <div className="hc-overlay z-20">
                                        {liveUrls[t.id] ? (
                                            <a href={liveUrls[t.id]!} target="_blank" rel="noopener noreferrer" className="hc-btn">View Demo →</a>
                                        ) : (
                                            <button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button>
                                        )}
                                    </div>
                                    <div className="w-full h-full absolute inset-0 z-0 bg-slate-100">
                                        {t.thumbnail_url ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <TemplateSVG id={t.id} />
                                        )}
                                    </div>
                                    <div className="hc-label z-10">
                                        <strong>{t.name}</strong>
                                        <span>{t.tier === "premium" ? "Premium Design" : "Basic Design"}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>{/* end .hero-cards (desktop) */}

                    {/* ── Mobile carousel — cards embedded directly so they show on first paint ── */}
                    <div className="hero-cards-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                        <div id="heroCarousel">
                            {heroTemplates.length === 0 ? (
                                <div className="carousel-slide">
                                    <div className="carousel-card active bg-slate-100/10 animate-pulse border border-slate-200/10 rounded-xl" style={{ height: "214px" }} />
                                </div>
                            ) : (
                                heroTemplates.slice(0, 4).map((t, idx) => {
                                    const total = Math.min(4, heroTemplates.length);
                                    let diff = idx - currentIdx;
                                    if (diff > total / 2) diff -= total;
                                    if (diff < -total / 2) diff += total;

                                    let translateX = 0, translateZ = 0, rotateY = 0, opacity = 1, zIndex = 10;
                                    const isActive = diff === 0;

                                    if (isActive) {
                                        translateX = 0; translateZ = 0; rotateY = 0; opacity = 1; zIndex = 10;
                                    } else if (diff === 1 || diff === -3) {
                                        translateX = 65; translateZ = -60; rotateY = -12; opacity = 0.8; zIndex = 5;
                                    } else if (diff === -1 || diff === 3) {
                                        translateX = -65; translateZ = -60; rotateY = 12; opacity = 0.8; zIndex = 5;
                                    } else {
                                        translateX = 0; translateZ = -140; rotateY = 0; opacity = 0; zIndex = 1;
                                    }

                                    return (
                                        <div
                                            key={t.id}
                                            className="carousel-slide"
                                            style={{
                                                transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                                                opacity,
                                                zIndex,
                                            }}
                                        >
                                            <div className={`carousel-card ${isActive ? 'active' : ''} relative overflow-hidden bg-slate-100`}>
                                                <div className="w-full h-full absolute inset-0 z-0 bg-slate-100">
                                                    {t.thumbnail_url ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <TemplateSVG id={t.id} />
                                                    )}
                                                </div>
                                                <div className="hc-overlay z-20 relative">
                                                    {liveUrls[t.id] ? (
                                                        <a href={liveUrls[t.id]!} target="_blank" rel="noopener noreferrer" className="hc-btn">View Demo →</a>
                                                    ) : (
                                                        <button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>{/* end #heroCarousel */}
                    </div>{/* end .hero-cards-wrapper */}


                </div>
            </div>
        </section>
    );
}
