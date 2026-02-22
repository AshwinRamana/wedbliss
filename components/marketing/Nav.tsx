"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

export default function Nav() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user || null);
            setAuthLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            {/* Full-screen mobile menu overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <div
                className="mobile-menu"
                id="mobileMenu"
                style={{
                    transform: menuOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)"
                }}
            >
                <button
                    className="mobile-close"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                >✕</button>
                {/* Brand inside menu */}
                <div style={{ textAlign: "center", marginBottom: "8px" }}>
                    <Image
                        src="/Primary.png"
                        alt="WedBliss"
                        width={120}
                        height={60}
                        className="mx-auto object-contain"
                        style={{ maxHeight: "60px", width: "auto" }}
                    />
                </div>
                <a href="/#how" onClick={() => setMenuOpen(false)}>How It Works</a>
                <a href="/#templates" onClick={() => setMenuOpen(false)}>Templates</a>
                <a href="/#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
                <a href="/#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
                <a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>

                <div style={{ padding: "20px 0", display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "300px" }}>
                    {authLoading ? (
                        <div style={{ width: "100%", height: "48px", background: "rgba(0,0,0,0.05)", borderRadius: "12px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                    ) : user ? (
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{
                            border: "2px solid rgba(4,120,87,0.2)",
                            color: "var(--emerald)", padding: "12px 0", borderRadius: "12px",
                            textAlign: "center", fontWeight: 700, fontSize: "18px",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            Profile
                        </Link>
                    ) : !isAdminRoute && (
                        <>
                            <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                                border: "2px solid rgba(4,120,87,0.2)",
                                color: "var(--emerald)", padding: "12px 0", borderRadius: "12px",
                                textAlign: "center", fontWeight: 700, fontSize: "18px"
                            }}>Log In</Link>
                            <Link href="/signup" onClick={() => setMenuOpen(false)} style={{
                                background: "linear-gradient(135deg, var(--emerald), var(--emerald-light))",
                                color: "white", padding: "14px 0", borderRadius: "12px",
                                textAlign: "center", fontWeight: 700, fontSize: "18px",
                                boxShadow: "0 8px 22px rgba(4,120,87,0.25)"
                            }}>Sign Up</Link>
                        </>
                    )}
                </div>

                {/* Trust badge */}
                <div style={{
                    fontSize: "11px", fontWeight: 700, color: "#94a3b8",
                    letterSpacing: "0.5px", textAlign: "center", marginTop: "4px"
                }}>
                    500+ Couples · ₹999 · Go Live in 10 Min
                </div>
            </div>

            <nav id="nav">
                <div className="nav-inner">
                    <a href="/" className="logo" aria-label="WedBliss home">
                        <Image
                            src="/Harizontal.png"
                            alt="WedBliss"
                            width={160}
                            height={44}
                            priority
                            className="object-contain"
                            style={{ maxHeight: "44px", width: "auto" }}
                        />
                    </a>
                    <ul className="nav-links">
                        <li><a href="/#how">How It Works</a></li>
                        <li><a href="/#templates">Templates</a></li>
                        <li><a href="/#pricing">Pricing</a></li>
                        <li><a href="/#testimonials">Reviews</a></li>
                        <li><a href="/#contact">Contact</a></li>
                    </ul>

                    <div className="nav-auth">
                        {authLoading ? (
                            <div style={{ width: "80px", height: "40px", background: "rgba(0,0,0,0.05)", borderRadius: "12px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                        ) : user ? (
                            <Link href="/dashboard" className="nav-login" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                Profile
                            </Link>
                        ) : !isAdminRoute && (
                            <>
                                <Link href="/login" className="nav-login">Log In</Link>
                                <Link href="/signup" className="btn-nav"><span>Sign Up</span></Link>
                            </>
                        )}
                    </div>

                    {/* Hamburger button */}
                    <button
                        className="menu-toggle"
                        aria-label="Open menu"
                        onClick={() => setMenuOpen(true)}
                    >☰</button>
                </div>
            </nav>
        </>
    );
}
