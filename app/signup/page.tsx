"use client";

import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/ui/Loader";

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState<"details" | "otp">("details");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        dob: ""
    });
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email && formData.phone && formData.dob) {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/send-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email, type: "signup" })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to send OTP");

                setStep("otp");
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const finalOtp = otp.join("");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    otp: finalOtp,
                    name: formData.name,
                    phone: formData.phone
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid OTP");

            // Quietly establish a real Supabase session using the securely generated dummy password
            if (data.sessionPassword) {
                let sessionError = null;
                let retries = 3;

                while (retries > 0) {
                    const { error } = await supabase.auth.signInWithPassword({
                        email: formData.email,
                        password: data.sessionPassword
                    });

                    if (!error) {
                        sessionError = null;
                        break;
                    }

                    sessionError = error;
                    retries -= 1;
                    if (retries > 0) await new Promise(res => setTimeout(res, 1000));
                }

                if (sessionError) {
                    console.error("Session establishment failed after retries:", sessionError);
                    throw new Error("Registration succeeded but auto-login failed. Please go to Login.");
                }
            }

            router.push("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            const digits = value.replace(/\D/g, "").split("").slice(0, 4);
            const newOtp = [...otp];
            digits.forEach((d, i) => newOtp[i] = d);
            setOtp(newOtp);
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            const nextInput = document.getElementById(`signup-otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 flex items-center justify-center w-full px-4 pt-28 pb-16">
                {loading && <Loader fullScreen text={step === "details" ? "Sending OTP securely..." : "Creating Account..."} />}
                <div className="relative w-full max-w-md">

                    {/* Floating Orbs for Auth visual consistency */}
                    <div className="orb orb1" style={{ top: "-100px", left: "-50px", width: "300px", height: "300px", opacity: 0.5 }}></div>
                    <div className="orb orb2" style={{ bottom: "-100px", right: "-50px", width: "250px", height: "250px", opacity: 0.5 }}></div>

                    {/* Auth Card */}
                    <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-900/5">
                        <div className="text-center mb-8">
                            <h1 className="font-serif text-3xl font-black text-slate-800 mb-2">
                                Create Account
                            </h1>
                            <p className="text-slate-500 text-sm">
                                {step === "details" ? "Join WedBliss to create your invitation" : `Verification code sent to ${formData.email}`}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50/50 border border-red-200 rounded-xl flex items-center gap-3">
                                <span className="text-red-500 font-bold">⚠️</span>
                                <p className="text-sm font-bold text-red-700">{error}</p>
                            </div>
                        )}

                        {step === "details" ? (
                            <form className="flex flex-col gap-4" onSubmit={handleSendOTP}>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
                                        placeholder="Karthik Kumar"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="phone" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone No</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="dob" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date of Birth</label>
                                        <input
                                            type="date"
                                            id="dob"
                                            required
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
                                        />
                                    </div>
                                </div>

                                <button disabled={loading} type="submit" className="mt-4 w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                                    {loading ? "Sending..." : "Continue to Verification"}
                                </button>
                            </form>
                        ) : (
                            <form
                                className="flex flex-col gap-5"
                                onSubmit={handleVerifyOTP}
                            >
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Verification Code</label>
                                    <div className="flex gap-3 justify-between">
                                        {[0, 1, 2, 3].map((index) => (
                                            <input
                                                key={index}
                                                id={`signup-otp-${index}`}
                                                type="text"
                                                maxLength={4}
                                                value={otp[index]}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                className="w-14 h-14 text-center text-2xl font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button disabled={loading} type="submit" className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                                    {loading ? "Verifying..." : "Verify & Create Account"}
                                </button>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => setStep("details")}
                                    className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 mt-2"
                                >
                                    ← Edit details
                                </button>
                            </form>
                        )}

                        <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account?{" "}
                                <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
