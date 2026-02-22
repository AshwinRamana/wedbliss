"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Note: In Supabase, if you haven't set up SMTP yet, the default `signInWithPassword` 
            // works immediately if the user was created in the Supabase Auth dashboard with a password.
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (signInError) throw signInError;

            // Immediately route into the admin dashboard if successful
            router.push("/admin");

        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || "Invalid Admin Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Dark Mode Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/40 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl relative z-10">

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold font-serif text-2xl shadow-lg shadow-emerald-500/20 mx-auto mb-4">
                        V
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">WedBliss Command Center</h1>
                    <p className="text-slate-400 text-sm">Secure Portal Access</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
                        <p className="text-sm font-bold text-red-400 text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleAdminLogin} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Master Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white placeholder-slate-600"
                            placeholder="admin@wedbliss.co"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Superuser Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white placeholder-slate-600"
                            placeholder="••••••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? "Authenticating..." : "Establish Secure Link →"}
                    </button>
                </form>

            </div>
        </div>
    );
}
