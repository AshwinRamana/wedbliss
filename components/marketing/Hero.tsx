"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getTemplates, DbTemplate } from "@/lib/db";

export default function Hero() {
    const [liveUrls, setLiveUrls] = useState<Record<string, string | null>>({});

    useEffect(() => {
        const fetchUrls = async () => {
            const dbTemplates = await getTemplates();
            const urlMap: Record<string, string | null> = {};
            dbTemplates.forEach((t: DbTemplate) => {
                urlMap[t.id] = t.demo_url || null;
            });
            setLiveUrls(urlMap);
        };
        fetchUrls();
    }, []);

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

                        {/* Card 1 — Malli Poo (LIVE DEMO) */}
                        <div className="hero-card">
                            <div className="hc-overlay">
                                {liveUrls['tm-mallipoo'] ? (
                                    <a href={liveUrls['tm-mallipoo']} target="_blank" rel="noopener noreferrer" className="hc-btn">View Demo →</a>
                                ) : (
                                    <button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button>
                                )}
                            </div>
                            <svg width="100%" height="100%" viewBox="0 0 160 214" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                <rect width="160" height="214" fill="#fdf6ec" />
                                <circle cx="0" cy="0" r="60" fill="rgba(251,207,232,0.2)" /><circle cx="160" cy="214" r="60" fill="rgba(251,207,232,0.2)" />
                                <rect x="4" y="4" width="152" height="206" fill="none" stroke="#c8a070" strokeWidth="0.8" rx="2" />
                                <path d="M15 22 Q40 16 80 18 Q120 16 145 22" stroke="#c8a070" strokeWidth="0.8" fill="none" />
                                <circle cx="25" cy="19" r="4" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                                <circle cx="50" cy="17" r="4" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                                <circle cx="80" cy="15" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                                <circle cx="115" cy="17" r="4" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                                <circle cx="140" cy="19" r="4" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                                <text x="80" y="50" textAnchor="middle" fontSize="16" fill="#c8922a" opacity="0.45" fontFamily="serif">ஓம்</text>
                                <text x="80" y="68" textAnchor="middle" fontSize="6" fill="#8b6040" letterSpacing="3" opacity="0.65">WEDDING INVITATION</text>
                                <line x1="30" y1="74" x2="130" y2="74" stroke="#c8a070" strokeWidth="0.5" opacity="0.6" />
                                <text x="80" y="92" textAnchor="middle" fontSize="12" fill="#4a2c0a" fontFamily="Georgia,serif" fontStyle="italic">Siva &amp; Hema</text>
                                <text x="80" y="104" textAnchor="middle" fontSize="5.5" fill="#8b6040" letterSpacing="2">KALYANAM</text>
                                <line x1="40" y1="110" x2="120" y2="110" stroke="#c8a070" strokeWidth="0.5" opacity="0.5" />
                                <text x="80" y="123" textAnchor="middle" fontSize="6" fill="#6b4020">12 May 2026 · 6:48 AM</text>
                                <text x="80" y="135" textAnchor="middle" fontSize="5.5" fill="#8b6040">Padmavathi Kalyana Mandapam</text>
                                <text x="80" y="146" textAnchor="middle" fontSize="5" fill="#8b6040">Chennai 600 028</text>
                                <text x="80" y="162" textAnchor="middle" fontSize="5" fill="#a08060">S/o Rajan &amp; Viji · D/o Kumar &amp; Thenmozhi</text>
                                <circle cx="18" cy="196" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" opacity="0.7" />
                                <circle cx="142" cy="196" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" opacity="0.7" />
                            </svg>
                            <div className="hc-label"><strong>Malli Poo</strong><span>Ivory &amp; Rose Gold</span></div>
                        </div>

                        {/* Card 2 — Tanjore Gold (Coming Soon) */}
                        <div className="hero-card">
                            <div className="hc-overlay"><button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button></div>
                            <svg width="100%" height="100%" viewBox="0 0 160 214" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                <rect width="160" height="214" fill="#6b0f0f" />
                                <rect x="4" y="4" width="152" height="206" fill="none" stroke="#d4af37" strokeWidth="1.5" rx="2" />
                                <rect x="7" y="7" width="146" height="200" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" />
                                <circle cx="13" cy="13" r="6" fill="#d4af37" opacity="0.55" /><circle cx="147" cy="13" r="6" fill="#d4af37" opacity="0.55" />
                                <circle cx="13" cy="201" r="6" fill="#d4af37" opacity="0.55" /><circle cx="147" cy="201" r="6" fill="#d4af37" opacity="0.55" />
                                <ellipse cx="80" cy="48" rx="18" ry="22" fill="#d4af37" opacity="0.18" />
                                <ellipse cx="80" cy="38" rx="11" ry="15" fill="#d4af37" opacity="0.35" />
                                <ellipse cx="68" cy="32" rx="7" ry="4" fill="#c8a010" opacity="0.5" transform="rotate(-15 68 32)" />
                                <ellipse cx="92" cy="32" rx="7" ry="4" fill="#c8a010" opacity="0.5" transform="rotate(15 92 32)" />
                                <path d="M77 44 Q70 52 74 57 Q80 62 86 57" stroke="#d4af37" strokeWidth="2" fill="none" opacity="0.6" />
                                <path d="M73 22 L76 15 L80 11 L84 15 L87 22" fill="#d4af37" opacity="0.7" />
                                <text x="80" y="85" textAnchor="middle" fontSize="6.5" fill="#ffd700" fontFamily="sans-serif" letterSpacing="2">✦ KALYANAM ✦</text>
                                <text x="80" y="102" textAnchor="middle" fontSize="10.5" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Arun &amp; Kavitha</text>
                                <line x1="28" y1="108" x2="132" y2="108" stroke="#d4af37" strokeWidth="0.6" opacity="0.5" />
                                <text x="80" y="119" textAnchor="middle" fontSize="5.5" fill="rgba(255,215,0,0.75)">Vivaha Muhurtham</text>
                                <text x="80" y="131" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">15 Mar 2025 · 7:48 AM</text>
                                <text x="80" y="143" textAnchor="middle" fontSize="5.5" fill="rgba(255,215,0,0.65)">Meenakshi Kalyana Mandapam</text>
                                <text x="80" y="153" textAnchor="middle" fontSize="5" fill="rgba(255,215,0,0.5)">Mumbai, India</text>
                                <line x1="28" y1="160" x2="132" y2="160" stroke="#d4af37" strokeWidth="0.4" opacity="0.35" />
                                <text x="80" y="172" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.4)">Ramasamy &amp; Gomathi weds Shankar &amp; Valli</text>
                                <ellipse cx="60" cy="204" rx="10" ry="5" fill="#d4af37" opacity="0.18" transform="rotate(-30 60 204)" />
                                <ellipse cx="100" cy="204" rx="10" ry="5" fill="#d4af37" opacity="0.18" transform="rotate(30 100 204)" />
                            </svg>
                            <div className="hc-label"><strong>Tanjore Gold</strong><span>Crimson &amp; Gold</span></div>
                        </div>

                        {/* Card 3 — Peacock Majesty (Coming Soon) */}
                        <div className="hero-card">
                            <div className="hc-overlay"><button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button></div>
                            <svg width="100%" height="100%" viewBox="0 0 160 214" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                <defs><radialGradient id="pcBg" cx="50%" cy="30%"><stop offset="0%" stopColor="#1a5c70" /><stop offset="100%" stopColor="#0e1a4a" /></radialGradient></defs>
                                <rect width="160" height="214" fill="url(#pcBg)" />
                                <rect x="4" y="4" width="152" height="206" fill="none" stroke="#14b8a6" strokeWidth="1" rx="2" />
                                <line x1="80" y1="62" x2="32" y2="6" stroke="#14b8a6" strokeWidth="1.2" opacity="0.7" />
                                <line x1="80" y1="62" x2="52" y2="4" stroke="#0d9488" strokeWidth="1.3" opacity="0.8" />
                                <line x1="80" y1="62" x2="68" y2="4" stroke="#14b8a6" strokeWidth="1.5" opacity="0.85" />
                                <line x1="80" y1="62" x2="80" y2="4" stroke="#0d9488" strokeWidth="1.6" opacity="0.9" />
                                <line x1="80" y1="62" x2="92" y2="4" stroke="#14b8a6" strokeWidth="1.5" opacity="0.85" />
                                <line x1="80" y1="62" x2="108" y2="4" stroke="#0d9488" strokeWidth="1.3" opacity="0.8" />
                                <line x1="80" y1="62" x2="128" y2="6" stroke="#14b8a6" strokeWidth="1.2" opacity="0.7" />
                                <circle cx="80" cy="5" r="6.5" fill="#14b8a6" opacity="0.7" /><circle cx="80" cy="5" r="4" fill="#7c3aed" opacity="0.7" /><circle cx="80" cy="5" r="2" fill="#d4af37" />
                                <line x1="80" y1="46" x2="80" y2="72" stroke="#d4af37" strokeWidth="2" opacity="0.8" />
                                <polygon points="80,40 76,50 84,50" fill="#d4af37" opacity="0.9" />
                                <text x="80" y="90" textAnchor="middle" fontSize="6" fill="#14b8a6" letterSpacing="1.5">✦ திருமணம் ✦</text>
                                <text x="80" y="107" textAnchor="middle" fontSize="10.5" fill="#d4af37" fontFamily="Georgia,serif" fontWeight="bold">Deepak &amp; Meena</text>
                                <line x1="28" y1="113" x2="132" y2="113" stroke="#14b8a6" strokeWidth="0.5" opacity="0.5" />
                                <text x="80" y="124" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.7)">5 April 2025 · 10:24 AM</text>
                                <text x="80" y="135" textAnchor="middle" fontSize="6.5" fill="#d4af37">Nalla Neram</text>
                                <text x="80" y="147" textAnchor="middle" fontSize="5.5" fill="rgba(20,184,166,0.8)">Vel Murugan Mandapam, Chennai</text>
                                <text x="80" y="182" textAnchor="middle" fontSize="5.5" fill="rgba(212,175,55,0.4)">wedbliss.co/deepakmeena</text>
                            </svg>
                            <div className="hc-label"><strong>Peacock Majesty</strong><span>Teal &amp; Purple</span></div>
                        </div>

                        {/* Card 4 — Kuthu Vilakku (Coming Soon) */}
                        <div className="hero-card">
                            <div className="hc-overlay"><button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button></div>
                            <svg width="100%" height="100%" viewBox="0 0 160 214" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <radialGradient id="vbg" cx="50%" cy="50%"><stop offset="0%" stopColor="#3d1f00" /><stop offset="100%" stopColor="#1a0a00" /></radialGradient>
                                    <radialGradient id="vglow" cx="50%" cy="0%"><stop offset="0%" stopColor="rgba(255,180,0,0.28)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                                </defs>
                                <rect width="160" height="214" fill="url(#vbg)" />
                                <ellipse cx="80" cy="68" rx="80" ry="60" fill="url(#vglow)" />
                                <rect x="4" y="4" width="152" height="206" fill="none" stroke="#d4af37" strokeWidth="1.2" rx="2" />
                                <ellipse cx="80" cy="94" rx="22" ry="5" fill="#b8960f" opacity="0.8" />
                                <rect x="68" y="74" width="24" height="20" rx="3" fill="#c8922a" opacity="0.9" />
                                <ellipse cx="80" cy="74" rx="24" ry="7" fill="#d4af37" opacity="0.9" />
                                <rect x="75" y="54" width="10" height="22" rx="3" fill="#c8922a" opacity="0.8" />
                                <ellipse cx="80" cy="54" rx="18" ry="6" fill="#d4af37" opacity="0.9" />
                                <ellipse cx="70" cy="50" rx="2.5" ry="5" fill="#fbbf24" opacity="0.9" /><ellipse cx="70" cy="47" rx="1.5" ry="3.5" fill="#fef08a" /><ellipse cx="70" cy="45" rx="1" ry="2.5" fill="white" opacity="0.8" />
                                <ellipse cx="90" cy="50" rx="2.5" ry="5" fill="#fbbf24" opacity="0.9" /><ellipse cx="90" cy="47" rx="1.5" ry="3.5" fill="#fef08a" /><ellipse cx="90" cy="45" rx="1" ry="2.5" fill="white" opacity="0.8" />
                                <ellipse cx="80" cy="48" rx="3" ry="6" fill="#fbbf24" opacity="0.9" /><ellipse cx="80" cy="44" rx="1.8" ry="4.5" fill="white" opacity="0.85" />
                                <text x="80" y="114" textAnchor="middle" fontSize="6" fill="#fbbf24" letterSpacing="1.2">KALYANA VILAKKU</text>
                                <text x="80" y="130" textAnchor="middle" fontSize="10.5" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Raj &amp; Anitha</text>
                                <line x1="28" y1="136" x2="132" y2="136" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
                                <text x="80" y="159" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">22 Feb 2025 · 8:36 AM</text>
                                <text x="80" y="170" textAnchor="middle" fontSize="5.5" fill="rgba(255,200,80,0.65)">Bhavani Mandapam, Coimbatore</text>
                                <text x="80" y="202" textAnchor="middle" fontSize="5" fill="rgba(255,200,80,0.35)">wedbliss.co/rajanitha2025</text>
                            </svg>
                            <div className="hc-label"><strong>Kuthu Vilakku</strong><span>Amber &amp; Saffron</span></div>
                        </div>

                    </div>{/* end .hero-cards (desktop) */}

                    {/* ── Mobile carousel — cards embedded directly so they show on first paint ── */}
                    <div className="hero-cards-wrapper">
                        <div id="heroCarousel">

                            {/* Slide 1 — Malli Poo (LIVE DEMO) */}
                            <div className="carousel-slide">
                                <div className="carousel-card active">
                                    <svg width="100%" height="100%" viewBox="0 0 160 214" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="160" height="214" fill="#fdf6ec" />
                                        <circle cx="0" cy="0" r="60" fill="rgba(251,207,232,0.2)" /><circle cx="160" cy="214" r="60" fill="rgba(251,207,232,0.2)" />
                                        <rect x="4" y="4" width="152" height="206" fill="none" stroke="#c8a070" strokeWidth="0.8" rx="2" />
                                        <path d="M15 22 Q40 16 80 18 Q120 16 145 22" stroke="#c8a070" strokeWidth="0.8" fill="none" />
                                        <circle cx="25" cy="19" r="4" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                                        <circle cx="80" cy="15" r="5" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                                        <circle cx="140" cy="19" r="4" fill="white" stroke="#e8c8a0" strokeWidth="0.5" />
                                        <text x="80" y="50" textAnchor="middle" fontSize="16" fill="#c8922a" opacity="0.45" fontFamily="serif">ஓம்</text>
                                        <text x="80" y="68" textAnchor="middle" fontSize="6" fill="#8b6040" letterSpacing="2" opacity="0.65">WEDDING INVITATION</text>
                                        <line x1="30" y1="74" x2="130" y2="74" stroke="#c8a070" strokeWidth="0.5" opacity="0.6" />
                                        <text x="80" y="92" textAnchor="middle" fontSize="12" fill="#4a2c0a" fontFamily="Georgia,serif" fontStyle="italic">Siva &amp; Hema</text>
                                        <text x="80" y="104" textAnchor="middle" fontSize="5.5" fill="#8b6040" letterSpacing="2">KALYANAM</text>
                                        <line x1="40" y1="110" x2="120" y2="110" stroke="#c8a070" strokeWidth="0.5" opacity="0.5" />
                                        <text x="80" y="123" textAnchor="middle" fontSize="6" fill="#6b4020">12 May 2026 · 6:48 AM</text>
                                        <text x="80" y="135" textAnchor="middle" fontSize="5.5" fill="#8b6040">Padmavathi Kalyana Mandapam</text>
                                        <text x="80" y="162" textAnchor="middle" fontSize="5" fill="#a08060">S/o Rajan &amp; Viji · D/o Kumar &amp; Thenmozhi</text>
                                    </svg>
                                    <div className="hc-overlay">
                                        {liveUrls['tm-mallipoo'] ? (
                                            <a href={liveUrls['tm-mallipoo']} target="_blank" rel="noopener noreferrer" className="hc-btn">View Demo →</a>
                                        ) : (
                                            <button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Slide 2 — Tanjore Gold (Coming Soon) */}
                            <div className="carousel-slide">
                                <div className="carousel-card">
                                    <svg width="100%" height="100%" viewBox="0 0 160 214" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="160" height="214" fill="#6b0f0f" />
                                        <rect x="4" y="4" width="152" height="206" fill="none" stroke="#d4af37" strokeWidth="1.5" rx="2" />
                                        <circle cx="13" cy="13" r="6" fill="#d4af37" opacity="0.55" /><circle cx="147" cy="13" r="6" fill="#d4af37" opacity="0.55" />
                                        <circle cx="13" cy="201" r="6" fill="#d4af37" opacity="0.55" /><circle cx="147" cy="201" r="6" fill="#d4af37" opacity="0.55" />
                                        <ellipse cx="80" cy="42" rx="14" ry="18" fill="#d4af37" opacity="0.22" />
                                        <path d="M77 44 Q70 52 74 57 Q80 62 86 57" stroke="#d4af37" strokeWidth="2" fill="none" opacity="0.6" />
                                        <path d="M73 22 L76 15 L80 11 L84 15 L87 22" fill="#d4af37" opacity="0.7" />
                                        <text x="80" y="85" textAnchor="middle" fontSize="6.5" fill="#ffd700" letterSpacing="2">✦ KALYANAM ✦</text>
                                        <text x="80" y="102" textAnchor="middle" fontSize="10.5" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Arun &amp; Kavitha</text>
                                        <line x1="28" y1="108" x2="132" y2="108" stroke="#d4af37" strokeWidth="0.6" opacity="0.5" />
                                        <text x="80" y="119" textAnchor="middle" fontSize="5.5" fill="rgba(255,215,0,0.75)">Vivaha Muhurtham</text>
                                        <text x="80" y="131" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">15 Mar 2025 · 7:48 AM</text>
                                        <text x="80" y="143" textAnchor="middle" fontSize="5.5" fill="rgba(255,215,0,0.65)">Meenakshi Kalyana Mandapam, Madurai</text>
                                    </svg>
                                    <div className="hc-overlay"><button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button></div>
                                </div>
                            </div>

                            {/* Slide 3 — Peacock Majesty (Coming Soon) */}
                            <div className="carousel-slide">
                                <div className="carousel-card">
                                    <svg width="100%" height="100%" viewBox="0 0 160 214" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                        <defs><radialGradient id="mob-pcBg" cx="50%" cy="30%"><stop offset="0%" stopColor="#1a5c70" /><stop offset="100%" stopColor="#0e1a4a" /></radialGradient></defs>
                                        <rect width="160" height="214" fill="url(#mob-pcBg)" />
                                        <rect x="4" y="4" width="152" height="206" fill="none" stroke="#14b8a6" strokeWidth="1" rx="2" />
                                        <line x1="80" y1="62" x2="80" y2="4" stroke="#0d9488" strokeWidth="1.6" opacity="0.9" />
                                        <line x1="80" y1="62" x2="52" y2="4" stroke="#0d9488" strokeWidth="1.3" opacity="0.8" />
                                        <line x1="80" y1="62" x2="108" y2="4" stroke="#0d9488" strokeWidth="1.3" opacity="0.8" />
                                        <circle cx="80" cy="5" r="6.5" fill="#14b8a6" opacity="0.7" /><circle cx="80" cy="5" r="4" fill="#7c3aed" opacity="0.7" /><circle cx="80" cy="5" r="2" fill="#d4af37" />
                                        <line x1="80" y1="46" x2="80" y2="72" stroke="#d4af37" strokeWidth="2" opacity="0.8" />
                                        <polygon points="80,40 76,50 84,50" fill="#d4af37" opacity="0.9" />
                                        <text x="80" y="90" textAnchor="middle" fontSize="6" fill="#14b8a6" letterSpacing="1.5">✦ திருமணம் ✦</text>
                                        <text x="80" y="107" textAnchor="middle" fontSize="10.5" fill="#d4af37" fontFamily="Georgia,serif" fontWeight="bold">Deepak &amp; Meena</text>
                                        <line x1="28" y1="113" x2="132" y2="113" stroke="#14b8a6" strokeWidth="0.5" opacity="0.5" />
                                        <text x="80" y="124" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.7)">5 April 2025 · 10:24 AM</text>
                                        <text x="80" y="135" textAnchor="middle" fontSize="6.5" fill="#d4af37">Nalla Neram</text>
                                        <text x="80" y="147" textAnchor="middle" fontSize="5.5" fill="rgba(20,184,166,0.8)">Vel Murugan Mandapam, Chennai</text>
                                    </svg>
                                    <div className="hc-overlay"><button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button></div>
                                </div>
                            </div>

                            {/* Slide 4 — Kuthu Vilakku (Coming Soon) */}
                            <div className="carousel-slide">
                                <div className="carousel-card">
                                    <svg width="100%" height="100%" viewBox="0 0 160 214" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <radialGradient id="mob-vbg" cx="50%" cy="50%"><stop offset="0%" stopColor="#3d1f00" /><stop offset="100%" stopColor="#1a0a00" /></radialGradient>
                                            <radialGradient id="mob-vglow" cx="50%" cy="0%"><stop offset="0%" stopColor="rgba(255,180,0,0.28)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                                        </defs>
                                        <rect width="160" height="214" fill="url(#mob-vbg)" />
                                        <ellipse cx="80" cy="68" rx="80" ry="60" fill="url(#mob-vglow)" />
                                        <rect x="4" y="4" width="152" height="206" fill="none" stroke="#d4af37" strokeWidth="1.2" rx="2" />
                                        <ellipse cx="80" cy="94" rx="22" ry="5" fill="#b8960f" opacity="0.8" />
                                        <rect x="68" y="74" width="24" height="20" rx="3" fill="#c8922a" opacity="0.9" />
                                        <ellipse cx="80" cy="74" rx="24" ry="7" fill="#d4af37" opacity="0.9" />
                                        <rect x="75" y="54" width="10" height="22" rx="3" fill="#c8922a" opacity="0.8" />
                                        <ellipse cx="80" cy="54" rx="18" ry="6" fill="#d4af37" opacity="0.9" />
                                        <ellipse cx="80" cy="48" rx="3" ry="6" fill="#fbbf24" opacity="0.9" /><ellipse cx="80" cy="44" rx="1.8" ry="4.5" fill="white" opacity="0.85" />
                                        <text x="80" y="114" textAnchor="middle" fontSize="6" fill="#fbbf24" letterSpacing="1.2">KALYANA VILAKKU</text>
                                        <text x="80" y="130" textAnchor="middle" fontSize="10.5" fill="#ffd700" fontFamily="Georgia,serif" fontWeight="bold">Raj &amp; Anitha</text>
                                        <line x1="28" y1="136" x2="132" y2="136" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
                                        <text x="80" y="159" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">22 Feb 2025 · 8:36 AM</text>
                                        <text x="80" y="170" textAnchor="middle" fontSize="5.5" fill="rgba(255,200,80,0.65)">Bhavani Mandapam, Coimbatore</text>
                                    </svg>
                                    <div className="hc-overlay"><button className="hc-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button></div>
                                </div>
                            </div>

                        </div>{/* end #heroCarousel */}
                    </div>{/* end .hero-cards-wrapper */}


                </div>
            </div>
        </section>
    );
}
