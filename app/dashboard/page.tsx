"use client";

import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/ui/Loader";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Profile state
    const [profileName, setProfileName] = useState("");
    const [profileDob, setProfileDob] = useState("");
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [profileEditing, setProfileEditing] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase.auth.getSession();
            const u = data.session?.user || null;
            setUser(u);
            if (u) {
                setProfileName(u.user_metadata?.name || "");
                setProfileDob(u.user_metadata?.dob || "");
            }
            setLoading(false);
        };
        fetchSession();
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleProfileSave = async () => {
        if (!profileName.trim()) {
            setProfileMsg({ type: "error", text: "Name cannot be empty." });
            return;
        }
        setProfileSaving(true);
        setProfileMsg(null);
        const { error } = await supabase.auth.updateUser({
            data: { name: profileName.trim(), dob: profileDob },
        });
        setProfileSaving(false);
        if (error) {
            setProfileMsg({ type: "error", text: error.message });
        } else {
            setProfileMsg({ type: "success", text: "Profile updated successfully." });
            setProfileEditing(false);
            // refresh local user state
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user || null);
            setTimeout(() => setProfileMsg(null), 3000);
        }
    };

    if (loading) return <Loader fullScreen text="Loading Data..." />;

    const displayName = profileName ? profileName.split(" ")[0] : "";
    const initials = profileName
        ? profileName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : (user?.email?.[0] ?? "U").toUpperCase();

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-28 pb-16 relative z-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                        <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 mb-2">
                            Welcome Back{displayName ? <span className="text-emerald-700">, {displayName}!</span> : "!"}
                        </h1>
                        <p className="text-slate-500">Manage your digital invitations and profile here.</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <button onClick={handleLogout} className="px-5 py-3 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors uppercase tracking-wider">
                            Logout
                        </button>
                        <Link href="/#pricing" className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 transition-all">
                            + Create New Invite
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-6">

                    {/* ── Profile Card ─────────────────────────────────────── */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-xl shadow-emerald-900/5">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-serif text-2xl font-bold text-slate-800">My Profile</h2>
                            {!profileEditing && (
                                <button
                                    onClick={() => setProfileEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black font-serif shadow-lg shadow-emerald-500/25">
                                    {initials}
                                </div>

                                {/* Fields */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    {/* Name */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                        {profileEditing ? (
                                            <input
                                                type="text"
                                                value={profileName}
                                                onChange={e => setProfileName(e.target.value)}
                                                placeholder="Your full name"
                                                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                                            />
                                        ) : (
                                            <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-800 font-medium min-h-[42px]">
                                                {profileName || <span className="text-slate-400 italic">Not set</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email (read-only — controlled by Supabase Auth) */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-600 font-medium min-h-[42px] flex items-center gap-2">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 flex-shrink-0">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            <span className="truncate">{user?.email}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">Email is managed by authentication and cannot be changed here.</p>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                                        {profileEditing ? (
                                            <input
                                                type="date"
                                                value={profileDob}
                                                onChange={e => setProfileDob(e.target.value)}
                                                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                                            />
                                        ) : (
                                            <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-800 font-medium min-h-[42px]">
                                                {profileDob
                                                    ? new Date(profileDob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                                                    : <span className="text-slate-400 italic">Not set</span>
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/* Member Since */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</label>
                                        <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-600 font-medium min-h-[42px]">
                                            {user?.created_at
                                                ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                                                : "—"
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save / Cancel */}
                            {profileEditing && (
                                <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setProfileEditing(false); setProfileMsg(null); }}
                                            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleProfileSave}
                                            disabled={profileSaving}
                                            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                                        >
                                            {profileSaving ? "Saving…" : "Save Changes"}
                                        </button>
                                    </div>
                                    {profileMsg && (
                                        <p className={`text-sm font-medium px-4 py-2.5 rounded-xl ${profileMsg.type === "success" ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                                            {profileMsg.text}
                                        </p>
                                    )}
                                </div>
                            )}
                            {profileMsg && !profileEditing && (
                                <p className={`mt-4 text-sm font-medium px-4 py-2 rounded-xl inline-block ${profileMsg.type === "success" ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                                    {profileMsg.text}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Invitations Card ─────────────────────────────────── */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-xl shadow-emerald-900/5">
                        <div className="p-6 md:p-8 border-b border-slate-100">
                            <h2 className="font-serif text-2xl font-bold text-slate-800">Your Invitations</h2>
                        </div>
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="w-20 h-20 mb-6 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner shadow-emerald-200/50">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Invitations Yet</h3>
                            <p className="text-slate-500 max-w-sm mb-8">Choose a beautiful template and your digital wedding invitation will appear here.</p>
                            <Link href="/checkout/templates" className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
                                Browse Templates
                            </Link>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
