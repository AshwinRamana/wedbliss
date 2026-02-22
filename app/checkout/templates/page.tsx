"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { TEMPLATES, TemplateSVG } from "@/components/marketing/Templates";
import { getTemplates } from "@/lib/db";
import type { DbTemplate } from "@/lib/db";

type MergedTemplate = typeof TEMPLATES[0] & { thumbnailUrl?: string | null };



function TemplateSelectionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get("plan") || "basic";

    const isPremium = plan === "premium";

    const [user, setUser] = useState<User | null>(null);
    const [mergedTemplates, setMergedTemplates] = useState<MergedTemplate[]>(TEMPLATES);

    useEffect(() => {
        const init = async () => {
            // Fetch session
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user || null);

            // Fetch live template flags from Supabase and merge
            const dbTemplates = await getTemplates();
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
            setMergedTemplates(merged);
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

    const availableTemplates = mergedTemplates.filter(t => isPremium ? true : t.tier === "basic");

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-28 pb-16 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4">
                        Step 1 of 4
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 mb-4">
                        Choose Your Template
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        {isPremium
                            ? "You selected the Premium plan. You have unrestricted access to all our exquisite templates."
                            : "You selected the Basic plan. Here are the beautiful templates included in your package."}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availableTemplates.map((tmpl) => {
                        const isComingSoon = !tmpl.isLive;
                        return (
                            <div key={tmpl.id} className={`group relative bg-white/60 backdrop-blur-md border rounded-3xl overflow-hidden shadow-xl flex flex-col transition-all ${isComingSoon
                                    ? "border-slate-200/40 opacity-60 cursor-not-allowed"
                                    : "border-slate-200/60 shadow-slate-200/50 hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-500/30"
                                }`}>
                                {/* Template Thumbnail */}
                                <div className="w-full h-64 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                                    {(tmpl as MergedTemplate).thumbnailUrl ? (
                                        <img src={(tmpl as MergedTemplate).thumbnailUrl!} alt={tmpl.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <TemplateSVG id={tmpl.id} />
                                    )}
                                    {tmpl.tier === "premium" && (
                                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20 shadow-lg">
                                            Premium
                                        </div>
                                    )}
                                    {/* Coming Soon overlay */}
                                    {isComingSoon && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs font-bold tracking-widest uppercase">
                                                Coming Soon
                                            </span>
                                        </div>
                                    )}
                                    {/* Live demo link */}
                                    {!isComingSoon && (tmpl as MergedTemplate).href && (
                                        <a href={(tmpl as MergedTemplate).href!} target="_blank" rel="noopener noreferrer"
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-800/80 backdrop-blur-sm rounded-full text-white text-xs font-bold border border-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Live Demo →
                                        </a>
                                    )}
                                </div>

                                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-slate-800">{tmpl.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1 capitalize">{tmpl.tier} Tier · {isPremium ? "Animated & Musical" : "Standard Layout"}</p>
                                    </div>
                                    {isComingSoon ? (
                                        <div className="w-full py-3 text-center bg-slate-100 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed select-none border border-slate-200">
                                            Coming Soon
                                        </div>
                                    ) : (
                                        <Link
                                            href={user ? `/checkout/form?plan=${plan}&template=${tmpl.id}` : `/checkout/auth?plan=${plan}&template=${tmpl.id}`}
                                            className="w-full block py-3 text-center bg-slate-100 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl transition-colors border border-transparent hover:border-emerald-200"
                                        >
                                            Select & Continue
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!isPremium && (
                    <div className="mt-16 text-center">
                        <div className="inline-block p-6 bg-white/50 backdrop-blur border border-amber-200 rounded-3xl max-w-xl mx-auto shadow-xl shadow-amber-900/5">
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
