"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { TemplateSVG } from "@/components/marketing/Templates";
import { getTemplates } from "@/lib/db";

type TemplateItem = {
    id: string;
    name: string;
    tier: "basic" | "premium";
    desc: string;
    isLive: boolean;
    href?: string;
    thumbnailUrl: string | null;
};

function TemplateSelectionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get("plan") || "basic";

    const isPremium = plan === "premium";

    const [user, setUser] = useState<User | null>(null);
    const [allTemplates, setAllTemplates] = useState<TemplateItem[]>([]);

    // Tap-to-select state — gives instant tactile feedback on touch devices
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            // Fetch session
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user || null);

            // Fetch all templates from Supabase — single source of truth
            const dbTemplates = await getTemplates();
            const mapped: TemplateItem[] = dbTemplates.map(db => ({
                id: db.id,
                name: db.name,
                tier: (db.tier as "basic" | "premium") || "basic",
                desc: db.description || "A beautifully crafted custom design.",
                isLive: db.is_live,
                href: db.demo_url ?? undefined,
                thumbnailUrl: db.thumbnail_url ?? null,
            }));

            // Sort: Live + Demo URL first, then Live, then Coming Soon
            mapped.sort((a, b) => {
                const aReady = a.isLive && !!a.href;
                const bReady = b.isLive && !!b.href;

                if (aReady && !bReady) return -1;
                if (!aReady && bReady) return 1;
                if (a.isLive && !b.isLive) return -1;
                if (!a.isLive && b.isLive) return 1;
                return 0;
            });

            setAllTemplates(mapped);
        };
        init();

        // Intercept back button
        const handlePopState = (e: PopStateEvent) => {
            e.preventDefault();
            router.push("/#pricing");
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [router]);

    const availableTemplates = allTemplates.filter(t => t.tier === plan);

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-28 pb-16 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4">
                        Step 1 of 4
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-3">
                        Choose Your Template
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
                        {isPremium
                            ? "You selected the Premium plan. You have unrestricted access to all our exquisite templates."
                            : "You selected the Basic plan. Here are the beautiful templates included in your package."}
                    </p>
                </div>

                {/* Main Content Area */}
                <div className="relative">
                    {/* Responsive Grid/Carousel: Snap-scroll on mobile, Grid on desktop */}
                    <div className="flex sm:grid flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory gap-5 sm:gap-6 pb-8 sm:pb-0 px-4 sm:px-0 -mx-4 sm:mx-0 scrollbar-hide">
                        {availableTemplates.map((tmpl) => {
                            const isComingSoon = !tmpl.isLive;
                            const isSelected = selectedId === tmpl.id;
                            return (
                                <div
                                    key={tmpl.id}
                                    onClick={() => { if (!isComingSoon) setSelectedId(tmpl.id); }}
                                    className={`group relative snap-center shrink-0 w-[85vw] sm:w-auto sm:flex-1 min-w-[280px] bg-white border rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 ${isComingSoon
                                        ? "opacity-50 cursor-not-allowed grayscale"
                                        : isSelected
                                            ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-[1.03] z-20"
                                            : "border-slate-100 hover:border-emerald-200 hover:-translate-y-2"
                                        }`}>
                                    
                                    {/* Portrait Art Piece (1:1.75) */}
                                    <div className="w-full relative bg-slate-50 overflow-hidden" style={{ aspectRatio: '1/1.75' }}>
                                        {tmpl.thumbnailUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={tmpl.thumbnailUrl!} alt={tmpl.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-emerald-50/30">
                                                <TemplateSVG id={tmpl.id} />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-5 left-5 z-20">
                                            {tmpl.tier === "premium" && (
                                                <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold border border-white/20">
                                                    Premium Design
                                                </div>
                                            )}
                                        </div>

                                        {/* Premium Glass Info Overlay */}
                                        <div className="absolute inset-x-3 bottom-3 z-30">
                                            <div className="p-5 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-serif text-xl font-black text-slate-800 leading-tight">{tmpl.name}</h3>
                                                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">{tmpl.tier} Collection</p>
                                                    </div>
                                                    {!isComingSoon && tmpl.href && (
                                                        <a href={tmpl.href} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800/10 hover:bg-slate-800/20 rounded-full transition-colors">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                        </a>
                                                    )}
                                                </div>

                                                {isComingSoon ? (
                                                    <div className="w-full py-3 text-center bg-slate-100 text-slate-400 font-bold rounded-xl text-xs sm:text-sm cursor-not-allowed border border-slate-200">
                                                        Arriving Soon
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={user ? `/checkout/form?plan=${plan}&template=${tmpl.id}` : `/checkout/auth?plan=${plan}&template=${tmpl.id}`}
                                                        className={`w-full py-3.5 text-center font-black rounded-2xl transition-all text-sm shadow-xl ${
                                                            isSelected 
                                                            ? "bg-emerald-600 text-white shadow-emerald-200 scale-100" 
                                                            : "bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-100"
                                                        }`}
                                                    >
                                                        {isSelected ? "Confirm Selection →" : "Select Template"}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selection Indicators */}
                                        {isSelected && (
                                            <div className="absolute inset-0 border-[6px] border-emerald-500/30 rounded-[32px] pointer-events-none z-10" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {!isPremium && (
                    <div className="mt-12 text-center">
                        <div className="inline-block p-5 sm:p-6 bg-white/50 backdrop-blur border border-amber-200 rounded-3xl max-w-xl mx-auto shadow-xl shadow-amber-900/5">
                            <h3 className="font-serif text-lg font-bold text-slate-800 mb-2">Want more options?</h3>
                            <p className="text-sm text-slate-600 mb-4">Upgrade to Premium to unlock Custom Colors, Video Invites, Music selection, and beautiful animated templates.</p>
                            <Link href="/#pricing" className="text-sm font-bold text-amber-600 hover:text-amber-700">← Change Plan to Premium</Link>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default function TemplateSelection() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-700">Loading templates...</div>}>
            <TemplateSelectionContent />
        </Suspense>
    );
}
