"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import { useState, useEffect, Suspense, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function CheckoutFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get("plan") || "basic";
    const template = searchParams.get("template") || "unknown";
    const isPremium = plan === "premium";

    // Steps: 1:Couple, 2:Events, 3:Family, 4:Domain (both plans), 5:Media (premium only)
    const totalSteps = isPremium ? 5 : 4;
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // ── Form State ──
    const [brideFirst, setBrideFirst] = useState("");
    const [brideLast, setBrideLast] = useState("");
    const [brideQual, setBrideQual] = useState("");
    const [groomFirst, setGroomFirst] = useState("");
    const [groomLast, setGroomLast] = useState("");
    const [groomQual, setGroomQual] = useState("");

    // Events
    const [weddingDate, setWeddingDate] = useState("");
    const [weddingTime, setWeddingTime] = useState("");
    const [weddingVenue, setWeddingVenue] = useState("");
    const [weddingMap, setWeddingMap] = useState("");
    const [receptionDate, setReceptionDate] = useState("");
    const [receptionTime, setReceptionTime] = useState("");
    const [receptionVenue, setReceptionVenue] = useState("");

    // Family
    const [brideParents, setBrideParents] = useState("");
    const [brideGrands, setBrideGrands] = useState("");
    const [groomParents, setGroomParents] = useState("");
    const [groomGrands, setGroomGrands] = useState("");
    const [bestWishes, setBestWishes] = useState("");

    // Media (Premium)
    const [musicTrack, setMusicTrack] = useState("Traditional Nadaswaram & Thavil");

    // Domain
    const [subdomain, setSubdomain] = useState("");
    const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
    const [domainChecking, setDomainChecking] = useState(false);
    const [domainError, setDomainError] = useState("");

    // Get logged-in user email
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserEmail(data.user.email || null);
        });
    }, []);

    // ── Domain Availability Check ──
    const checkDomain = useCallback(async (value: string) => {
        if (!value || value.length < 3) {
            setDomainAvailable(null);
            setDomainError("");
            return;
        }
        setDomainChecking(true);
        setDomainError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/domains/check?subdomain=${encodeURIComponent(value)}`);
            const data = await res.json();
            if (data.error) {
                setDomainError(data.error);
                setDomainAvailable(false);
            } else {
                setDomainAvailable(data.available);
                if (!data.available) setDomainError("This subdomain is already taken.");
            }
        } catch {
            setDomainError("Unable to check availability.");
            setDomainAvailable(null);
        }
        setDomainChecking(false);
    }, []);

    // Debounced domain check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (subdomain) checkDomain(subdomain);
        }, 500);
        return () => clearTimeout(timer);
    }, [subdomain, checkDomain]);

    // ── Step Labels ──
    const stepLabels = isPremium
        ? ["Couple", "Events", "Family", "Domain", "Media"]
        : ["Couple", "Events", "Family", "Domain"];

    // Domain step index
    const domainStep = isPremium ? 4 : 4;
    const mediaStep = 5;

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            // Final submit — save to DB
            setSaving(true);
            try {
                const events = [
                    { type: "wedding", date: weddingDate, time: weddingTime, venue: weddingVenue, mapLink: weddingMap },
                    ...(receptionDate || receptionVenue ? [{ type: "reception", date: receptionDate, time: receptionTime, venue: receptionVenue }] : [])
                ];

                const payload = {
                    user_email: userEmail,
                    plan,
                    template_id: template !== "unknown" ? template : null,
                    subdomain: subdomain || null,
                    data: {
                        metadata: {
                            plan,
                            template_id: template !== "unknown" ? template : "tm-mallipoo",
                            createdAt: new Date().toISOString()
                        },
                        couple: {
                            bride: { firstName: brideFirst, lastName: brideLast, parents: brideParents, grandparents: brideGrands },
                            groom: { firstName: groomFirst, lastName: groomLast, parents: groomParents, grandparents: groomGrands },
                            storyMessage: bestWishes
                        },
                        events,
                        media: isPremium ? { backgroundMusicUrl: musicTrack } : undefined
                    }
                };

                const res = await fetch(`${BACKEND_URL}/api/invitations`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Failed to save");

                // Store invitation ID for payment flow
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("invitation_id", result.invitation.id);
                    sessionStorage.setItem("invitation_subdomain", subdomain || "");
                }

                router.push(`/checkout/payment?plan=${plan}&template=${template}`);
            } catch (err) {
                alert("Error saving invitation: " + (err instanceof Error ? err.message : "Unknown error"));
            }
            setSaving(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-slate-100 border-2 border-slate-300 shadow-sm rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400";
    const inputClassAmber = "w-full px-4 py-3 bg-slate-100 border-2 border-slate-300 shadow-sm rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800 placeholder:text-slate-400";

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-28 pb-16 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4">
                        Step 3 of 4
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 mb-4">
                        Wedding Details
                    </h1>
                    <p className="text-slate-700 max-w-2xl mx-auto">
                        Fill in the details to customize your invitation. Don&apos;t worry, you can always {isPremium ? "edit this later." : "preview before paying."}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 -translate-y-1/2 rounded transition-all duration-500" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>

                    {stepLabels.map((label, idx) => {
                        const s = idx + 1;
                        const isActive = s === step;
                        const isDone = s < step;
                        return (
                            <div key={label} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${isActive ? "bg-white border-emerald-500 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
                                    isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                                        "bg-white border-slate-300 text-slate-400"
                                    }`}>
                                    {isDone ? "✓" : s}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-emerald-700" : isDone ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-900/5">
                    <form onSubmit={handleNext}>

                        {/* STEP 1: COUPLE DETAILS */}
                        {step === 1 && (
                            <div className="transition-opacity duration-500">
                                <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Bride & Groom Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 p-3 rounded-lg text-center">Bride&apos;s Details</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">First Name *</label>
                                            <input type="text" required className={inputClass} placeholder="Aanya" value={brideFirst} onChange={e => setBrideFirst(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Last Name</label>
                                            <input type="text" className={inputClass} placeholder="Krishnan" value={brideLast} onChange={e => setBrideLast(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Educational/Professional Qualification</label>
                                            <input type="text" className={inputClass} placeholder="B.Tech, Software Engineer" value={brideQual} onChange={e => setBrideQual(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-widest bg-amber-50 p-3 rounded-lg text-center">Groom&apos;s Details</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">First Name *</label>
                                            <input type="text" required className={inputClassAmber} placeholder="Vikram" value={groomFirst} onChange={e => setGroomFirst(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Last Name</label>
                                            <input type="text" className={inputClassAmber} placeholder="Rajan" value={groomLast} onChange={e => setGroomLast(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Educational/Professional Qualification</label>
                                            <input type="text" className={inputClassAmber} placeholder="MBA, Entrepreneur" value={groomQual} onChange={e => setGroomQual(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: EVENT DETAILS */}
                        {step === 2 && (
                            <div className="transition-opacity duration-500">
                                <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Event Details</h2>
                                <p className="text-sm text-slate-700 mb-6">Enter the venue and timing details for your events.</p>

                                <div className="flex flex-col gap-8">
                                    <div className="p-6 border border-emerald-100 bg-emerald-50/30 rounded-2xl flex flex-col gap-4">
                                        <h3 className="font-bold text-lg text-emerald-800">Wedding / Muhurtham</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-700 uppercase">Date *</label>
                                                <input type="date" required className={inputClass} value={weddingDate} onChange={e => setWeddingDate(e.target.value)} />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-700 uppercase">Time *</label>
                                                <input type="time" required className={inputClass} value={weddingTime} onChange={e => setWeddingTime(e.target.value)} />
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-xs font-bold text-slate-700 uppercase">Venue Name & Address *</label>
                                                <textarea required rows={2} className={inputClass + " resize-none"} placeholder="Sri Krishna Mahal, 123 Temple Road, Chennai" value={weddingVenue} onChange={e => setWeddingVenue(e.target.value)}></textarea>
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-xs font-bold text-slate-700 uppercase">Google Maps Link</label>
                                                <input type="url" className={inputClass} placeholder="https://maps.google.com/..." value={weddingMap} onChange={e => setWeddingMap(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-amber-100 bg-amber-50/30 rounded-2xl flex flex-col gap-4">
                                        <h3 className="font-bold text-lg text-amber-800">Reception</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-700 uppercase">Date</label>
                                                <input type="date" className={inputClass} value={receptionDate} onChange={e => setReceptionDate(e.target.value)} />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-700 uppercase">Time</label>
                                                <input type="time" className={inputClass} value={receptionTime} onChange={e => setReceptionTime(e.target.value)} />
                                            </div>
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-xs font-bold text-slate-700 uppercase">Venue (if different)</label>
                                                <textarea rows={2} className={inputClass + " resize-none"} placeholder="Leave blank if same as wedding..." value={receptionVenue} onChange={e => setReceptionVenue(e.target.value)}></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: FAMILY */}
                        {step === 3 && (
                            <div className="transition-opacity duration-500">
                                <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Family & Hosts</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Bride&apos;s Parents</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Parents&apos; Names</label>
                                            <textarea rows={2} className={inputClass + " resize-none"} placeholder="Mr. Krishnan & Mrs. Lakshmi" value={brideParents} onChange={e => setBrideParents(e.target.value)}></textarea>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Grandparents (Optional)</label>
                                            <textarea rows={2} className={inputClass + " resize-none"} value={brideGrands} onChange={e => setBrideGrands(e.target.value)}></textarea>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-widest">Groom&apos;s Parents</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Parents&apos; Names</label>
                                            <textarea rows={2} className={inputClassAmber + " resize-none"} placeholder="Mr. Rajan & Mrs. Revathi" value={groomParents} onChange={e => setGroomParents(e.target.value)}></textarea>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Grandparents (Optional)</label>
                                            <textarea rows={2} className={inputClassAmber + " resize-none"} value={groomGrands} onChange={e => setGroomGrands(e.target.value)}></textarea>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Best Compliments / Inviting From</label>
                                            <textarea rows={3} className={inputClass + " resize-none"} placeholder="Near and Dear Relatives & Friends" value={bestWishes} onChange={e => setBestWishes(e.target.value)}></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: DOMAIN CONFIGURATION */}
                        {step === domainStep && (
                            <div className="transition-opacity duration-500">
                                <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Choose Your Invitation Link</h2>
                                <p className="text-sm text-slate-700 mb-8">Pick a unique subdomain for your wedding invitation. Your guests will visit this link.</p>

                                <div className="flex flex-col gap-6">
                                    <div className="p-6 border border-emerald-100 bg-emerald-50/30 rounded-2xl">
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-3 block">Your Invitation URL</label>
                                        <div className="flex items-center gap-0">
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-3.5 bg-white border-2 border-r-0 border-slate-300 rounded-l-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400 text-lg font-medium"
                                                placeholder="aanya-vikram"
                                                value={subdomain}
                                                onChange={e => {
                                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                                    setSubdomain(val);
                                                }}
                                                maxLength={30}
                                            />
                                            <div className="px-4 py-3.5 bg-slate-800 text-white font-bold rounded-r-xl border-2 border-slate-800 text-lg whitespace-nowrap">
                                                .wedbliss.co
                                            </div>
                                        </div>

                                        {/* Availability feedback */}
                                        <div className="mt-3 h-6">
                                            {domainChecking && (
                                                <span className="text-sm text-slate-500 flex items-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></div>
                                                    Checking availability...
                                                </span>
                                            )}
                                            {!domainChecking && domainAvailable === true && subdomain.length >= 3 && (
                                                <span className="text-sm text-emerald-600 font-bold flex items-center gap-2">
                                                    ✓ {subdomain}.wedbliss.co is available!
                                                </span>
                                            )}
                                            {!domainChecking && domainAvailable === false && (
                                                <span className="text-sm text-red-500 font-bold flex items-center gap-2">
                                                    ✕ {domainError || "Not available"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                        <h4 className="font-bold text-slate-800 mb-2 text-sm">💡 Tips for a great URL</h4>
                                        <ul className="text-xs text-slate-600 flex flex-col gap-1.5">
                                            <li>• Use your names: <span className="font-mono text-emerald-600">aanya-vikram</span></li>
                                            <li>• Add the year: <span className="font-mono text-emerald-600">aanya-vikram-2026</span></li>
                                            <li>• Keep it short & memorable</li>
                                            <li>• Only lowercase letters, numbers, and hyphens</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: MEDIA (PREMIUM ONLY) */}
                        {step === mediaStep && isPremium && (
                            <div className="transition-opacity duration-500">
                                <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Premium Media Content</h2>
                                <p className="text-sm text-slate-700 mb-8">Elevate your invitation with custom media, exclusively available on your Premium plan.</p>

                                <div className="flex flex-col gap-8">
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="w-full md:w-1/3 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                                            <span className="text-3xl mb-2 block">📹</span>
                                            <h4 className="font-bold text-slate-800">Couple&apos;s Video Invite</h4>
                                            <p className="text-xs text-slate-700 mt-2">Upload a short, heartfelt video greeting your guests.</p>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col gap-4 pt-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Upload Video (MP4)</label>
                                            <input type="file" accept="video/mp4" className="w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors cursor-pointer" />
                                            <p className="text-xs text-slate-400">Max file size: 20MB. Note: You can skip this and upload it later from your dashboard.</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6 items-start border-t border-slate-100 pt-8">
                                        <div className="w-full md:w-1/3 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                                            <span className="text-3xl mb-2 block">🎵</span>
                                            <h4 className="font-bold text-slate-800">Background Music</h4>
                                            <p className="text-xs text-slate-700 mt-2">Choose the ambient music for your invitation.</p>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col gap-4 pt-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Select Track</label>
                                            <select className={inputClass} value={musicTrack} onChange={e => setMusicTrack(e.target.value)}>
                                                <option>Traditional Nadaswaram & Thavil</option>
                                                <option>Classical Carnatic Flute</option>
                                                <option>Soft Piano Instrumental</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
                            {step > 1 ? (
                                <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 text-slate-700 font-bold hover:text-slate-800 transition-colors">
                                    ← Back
                                </button>
                            ) : <div></div>}

                            <button
                                type="submit"
                                disabled={saving || (step === domainStep && subdomain.length >= 3 && domainAvailable === false)}
                                className={`px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 transition-all ${saving ? "opacity-60 cursor-wait" : ""}`}
                            >
                                {saving ? "Saving..." : step === totalSteps ? "Save & Proceed to Payment" : "Next Step →"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function CheckoutForm() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-700">Loading form environment...</div>}>
            <CheckoutFormContent />
        </Suspense>
    );
}
