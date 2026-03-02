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

    // Steps: 1:Couple+Parents, 2:Events, 3:Notes+Media, 4:Domain
    const totalSteps = 4;
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // ── Couple & Parents ──
    const [brideFirst, setBrideFirst] = useState("");
    const [brideFather, setBrideFather] = useState("");
    const [brideMother, setBrideMother] = useState("");
    const [groomFirst, setGroomFirst] = useState("");
    const [groomFather, setGroomFather] = useState("");
    const [groomMother, setGroomMother] = useState("");

    // ── Events (add/remove) ──
    const [eventsList, setEventsList] = useState([
        { id: "ev-1", title: "Wedding / Muhurtham", date: "", startTime: "", endTime: "", venueName: "", googleMapsUrl: "" },
    ]);

    const handleEventChange = (index: number, field: string, value: string) => {
        const newEvents = [...eventsList];
        newEvents[index] = { ...newEvents[index], [field]: value };
        setEventsList(newEvents);
    };

    const addEvent = () => {
        setEventsList([...eventsList, { id: `ev-${Date.now()}`, title: "", date: "", startTime: "", endTime: "", venueName: "", googleMapsUrl: "" }]);
    };

    const removeEvent = (index: number) => {
        const newEvents = [...eventsList];
        newEvents.splice(index, 1);
        setEventsList(newEvents);
    };

    // ── Notes from Couple ──
    const [brideNotes, setBrideNotes] = useState("");
    const [groomNotes, setGroomNotes] = useState("");

    // ── Media (available to ALL plans — sections shown only if uploaded) ──
    const [videoUrl, setVideoUrl] = useState("");
    const [videoUploading, setVideoUploading] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // ── Domain ──
    const [subdomain, setSubdomain] = useState("");
    const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
    const [domainChecking, setDomainChecking] = useState(false);
    const [domainError, setDomainError] = useState("");

    const getCoupleName = () => subdomain || `${brideFirst}-${groomFirst}`.toLowerCase();

    // ── S3 Upload Handlers ──
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        if (photos.length >= 4) { alert("Maximum 4 photos allowed."); return; }

        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) { alert("File must be less than 5MB"); return; }

        setUploading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/upload/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&couplename=${encodeURIComponent(getCoupleName())}`);
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to generate upload URL");

            const uploadRes = await fetch(data.signedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
            if (!uploadRes.ok) throw new Error("Failed to upload to S3");
            setPhotos(prev => [...prev, data.publicUrl]);
        } catch (err: unknown) {
            alert("Upload error: " + (err instanceof Error ? err.message : String(err)));
        }
        setUploading(false);
        e.target.value = '';
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        if (file.size > 30 * 1024 * 1024) { alert("Video must be less than 30MB."); return; }

        setVideoUploading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/upload/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&couplename=${encodeURIComponent(getCoupleName())}`);
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to generate upload URL");

            const uploadRes = await fetch(data.signedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
            if (!uploadRes.ok) throw new Error("Failed to upload video to S3");
            setVideoUrl(data.publicUrl);
        } catch (err: unknown) {
            alert("Video upload error: " + (err instanceof Error ? err.message : String(err)));
        }
        setVideoUploading(false);
        e.target.value = '';
    };

    // Get logged-in user email
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserEmail(data.user.email || null);
        });
    }, []);

    // ── Domain Availability Check ──
    const checkDomain = useCallback(async (value: string) => {
        if (!value || value.length < 3) { setDomainAvailable(null); setDomainError(""); return; }
        setDomainChecking(true);
        setDomainError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/domains/check?subdomain=${encodeURIComponent(value)}`);
            const data = await res.json();
            if (data.error) { setDomainError(data.error); setDomainAvailable(false); }
            else { setDomainAvailable(data.available); if (!data.available) setDomainError("This subdomain is already taken."); }
        } catch { setDomainError("Unable to check availability."); setDomainAvailable(null); }
        setDomainChecking(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { if (subdomain) checkDomain(subdomain); }, 500);
        return () => clearTimeout(timer);
    }, [subdomain, checkDomain]);

    // ── Step Labels ──
    const stepLabels = ["Couple & Parents", "Events", "Notes & Media", "Domain"];

    // ── Submit Handler ──
    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            // Final submit — save to DB
            setSaving(true);
            try {
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
                            bride: { firstName: brideFirst, fatherName: brideFather, motherName: brideMother, notes: brideNotes || undefined },
                            groom: { firstName: groomFirst, fatherName: groomFather, motherName: groomMother, notes: groomNotes || undefined },
                        },
                        events: eventsList,
                        gallery: photos.length > 0 ? { images: photos } : undefined,
                        media: videoUrl ? { videoUrl } : undefined
                    }
                };

                const res = await fetch(`${BACKEND_URL}/api/invitations`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Failed to save");

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
                        Step {step} of {totalSteps}
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 mb-4">
                        Wedding Details
                    </h1>
                    <p className="text-slate-700 max-w-2xl mx-auto">
                        Fill in the details to customize your invitation.
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

                        {/* ═══════════════ STEP 1: COUPLE & PARENTS ═══════════════ */}
                        {step === 1 && (
                            <div className="transition-opacity duration-500">
                                <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Couple & Family Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Bride Side */}
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 p-3 rounded-lg text-center">Bride&apos;s Details</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Bride Name *</label>
                                            <input type="text" required className={inputClass} placeholder="Priya" value={brideFirst} onChange={e => setBrideFirst(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Father&apos;s Name *</label>
                                            <input type="text" required className={inputClass} placeholder="Krishnaswamy" value={brideFather} onChange={e => setBrideFather(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Mother&apos;s Name *</label>
                                            <input type="text" required className={inputClass} placeholder="Kamakshi" value={brideMother} onChange={e => setBrideMother(e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Groom Side */}
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-widest bg-amber-50 p-3 rounded-lg text-center">Groom&apos;s Details</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Groom Name *</label>
                                            <input type="text" required className={inputClassAmber} placeholder="Karthik" value={groomFirst} onChange={e => setGroomFirst(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Father&apos;s Name *</label>
                                            <input type="text" required className={inputClassAmber} placeholder="Ramasamy" value={groomFather} onChange={e => setGroomFather(e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Mother&apos;s Name *</label>
                                            <input type="text" required className={inputClassAmber} placeholder="Saraswathi" value={groomMother} onChange={e => setGroomMother(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══════════════ STEP 2: EVENTS ═══════════════ */}
                        {step === 2 && (
                            <div className="transition-opacity duration-500">
                                <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Event Details</h2>
                                <p className="text-sm text-slate-700 mb-6">Add your wedding events. You can add or remove events as needed.</p>

                                <div className="flex flex-col gap-8">
                                    {eventsList.map((event, index) => (
                                        <div key={event.id} className={`p-6 border rounded-2xl flex flex-col gap-4 relative ${index % 2 === 0 ? 'border-emerald-100 bg-emerald-50/30' : 'border-amber-100 bg-amber-50/30'}`}>
                                            <div className="flex justify-between items-center">
                                                <input
                                                    type="text"
                                                    className={`font-bold text-lg bg-transparent border-b border-slate-300 focus:outline-none focus:border-emerald-500 ${index % 2 === 0 ? 'text-emerald-800' : 'text-amber-800'}`}
                                                    value={event.title}
                                                    onChange={e => handleEventChange(index, "title", e.target.value)}
                                                    placeholder="Event Name *"
                                                    required
                                                />
                                                {eventsList.length > 1 && (
                                                    <button type="button" onClick={() => removeEvent(index)} className="text-red-500 hover:text-red-700 text-sm font-bold border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-bold text-slate-700 uppercase">Date *</label>
                                                    <input type="date" required className={inputClass} value={event.date} onChange={e => handleEventChange(index, "date", e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-bold text-slate-700 uppercase">From Time *</label>
                                                        <input type="time" required className={inputClass} value={event.startTime} onChange={e => handleEventChange(index, "startTime", e.target.value)} />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-xs font-bold text-slate-700 uppercase">To Time *</label>
                                                        <input type="time" required className={inputClass} value={event.endTime} onChange={e => handleEventChange(index, "endTime", e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-xs font-bold text-slate-700 uppercase">Event Location *</label>
                                                    <input type="text" required className={inputClass} placeholder="Sri Krishna Mahal, Chennai" value={event.venueName} onChange={e => handleEventChange(index, "venueName", e.target.value)} />
                                                </div>
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-xs font-bold text-slate-700 uppercase">Google Maps Link (Optional)</label>
                                                    <input type="url" className={inputClass} placeholder="https://maps.google.com/..." value={event.googleMapsUrl} onChange={e => handleEventChange(index, "googleMapsUrl", e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addEvent}
                                        className="w-full py-4 border-2 border-dashed border-emerald-300 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl leading-none">+</span> Add Another Event
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ═══════════════ STEP 3: NOTES & MEDIA ═══════════════ */}
                        {step === 3 && (
                            <div className="transition-opacity duration-500">
                                <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Notes & Media</h2>
                                <p className="text-sm text-slate-700 mb-8">Add personal notes and upload photos/videos. Gallery and video sections will appear in your invitation only if you upload them.</p>

                                {/* Notes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-emerald-700 uppercase">Notes from Bride (Optional)</label>
                                        <textarea rows={3} className={inputClass + " resize-none"} placeholder="A heartfelt message for your guests..." value={brideNotes} onChange={e => setBrideNotes(e.target.value)}></textarea>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-amber-700 uppercase">Notes from Groom (Optional)</label>
                                        <textarea rows={3} className={inputClassAmber + " resize-none"} placeholder="A heartfelt message for your guests..." value={groomNotes} onChange={e => setGroomNotes(e.target.value)}></textarea>
                                    </div>
                                </div>

                                {/* Photo Upload */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
                                    <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">📸 Photo Gallery <span className="text-xs font-normal text-slate-500">(Optional — shown only if uploaded)</span></h4>
                                    <p className="text-xs text-slate-500 mb-4">Upload up to 4 photos to feature in your invitation.</p>

                                    <div className="flex flex-wrap gap-4 mb-3">
                                        {photos.map((url, i) => (
                                            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-200 group">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setPhotos(photos.filter((_, index) => index !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">✕</button>
                                            </div>
                                        ))}
                                        {uploading && (
                                            <div className="w-24 h-24 rounded-lg border-2 border-emerald-300 border-dashed flex items-center justify-center bg-emerald-50">
                                                <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>

                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={photos.length >= 4 || uploading}
                                        className="w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                                    />
                                </div>

                                {/* Video Upload */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                    <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">📹 Video Invitation <span className="text-xs font-normal text-slate-500">(Optional — shown only if uploaded)</span></h4>
                                    <p className="text-xs text-slate-500 mb-4">Upload a short video greeting (Max 30MB).</p>

                                    {videoUrl ? (
                                        <div className="relative w-full max-w-sm rounded-lg overflow-hidden border-2 border-slate-200">
                                            <video src={videoUrl} controls className="w-full h-auto max-h-48 object-cover bg-black" />
                                            <button type="button" onClick={() => setVideoUrl("")} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md hover:bg-red-600 transition-colors">✕</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <input type="file" accept="video/mp4,video/quicktime" onChange={handleVideoUpload} disabled={videoUploading}
                                                className="w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
                                            />
                                            {videoUploading && <p className="text-xs text-indigo-600 font-bold animate-pulse">Uploading video... Please wait.</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ═══════════════ STEP 4: DOMAIN ═══════════════ */}
                        {step === 4 && (
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
                                                placeholder="priya-karthik"
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
                                            <li>• Use your names: <span className="font-mono text-emerald-600">priya-karthik</span></li>
                                            <li>• Add the year: <span className="font-mono text-emerald-600">priya-karthik-2026</span></li>
                                            <li>• Keep it short & memorable</li>
                                            <li>• Only lowercase letters, numbers, and hyphens</li>
                                        </ul>
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
                                disabled={saving || (step === 4 && subdomain.length >= 3 && domainAvailable === false)}
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
