"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Loader from "@/components/ui/Loader";

function CheckoutAuthContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get("plan") || "basic";
    const template = searchParams.get("template") || "unknown";

    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/send-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, type: "login" })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to send OTP");

                setStep("otp");
            } catch (err: unknown) {
                const error = err as Error;
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const finalOtp = otp.join("");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: finalOtp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid OTP");

            // Quietly establish a real Supabase session using the securely generated dummy password
            if (data.sessionPassword) {
                let sessionError = null;
                let retries = 3;

                while (retries > 0) {
                    const { error } = await supabase.auth.signInWithPassword({
                        email: email,
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
                    throw new Error("Login succeeded but session creation failed. Please try again.");
                }
            }

            // Redirect to the mega form, passing along the context
            router.push(`/checkout/form?plan=${plan}&template=${template}`);
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message);
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
            const nextInput = document.getElementById(`checkout-otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pt-28 pb-16 relative z-10">
                {loading && <Loader fullScreen text={step === "email" ? "Sending OTP securely..." : "Authenticating..."} />}
                <div className="text-center mb-8">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4">
                        Step 2 of 4
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 mb-4">
                        Verify to Continue
                    </h1>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="orb orb3" style={{ top: "-100px", left: "-50px", width: "300px", height: "300px", opacity: 0.5 }}></div>
                    <div className="orb orb2" style={{ bottom: "-100px", right: "-50px", width: "250px", height: "250px", opacity: 0.5 }}></div>

                    <div className="relative z-10 bg-white border border-emerald-900/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-900/5">

                        {error && (
                            <div className="mb-6 p-4 bg-red-50/50 border border-red-200 rounded-xl flex items-center gap-3 relative z-20">
                                <span className="text-red-500 font-bold">⚠️</span>
                                <p className="text-sm font-bold text-red-700">{error}</p>
                            </div>
                        )}

                        {step === "email" ? (
                            <form className="flex flex-col gap-4 relative z-20" onSubmit={handleSendOTP}>
                                <div className="text-center mb-6">
                                    <p className="text-slate-600 font-medium">Enter your email address. We&apos;ll send you an OTP to quickly sign you in.</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                                    <div className="flex border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-slate-100">
                                        <div className="px-4 py-3 bg-slate-200 border-r-2 border-slate-300 text-slate-700 font-bold select-none text-xl">✉</div>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 focus:outline-none text-slate-900 tracking-wide font-medium bg-transparent"
                                            placeholder="couple@example.com"
                                        />
                                    </div>
                                </div>
                                <button disabled={loading} type="submit" className="mt-4 w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                                    {loading ? "Sending..." : "Get OTP"}
                                </button>
                            </form>
                        ) : (
                            <form className="flex flex-col gap-5 relative z-20" onSubmit={handleVerify}>
                                <div className="text-center mb-6">
                                    <p className="text-slate-600 font-medium">We sent a 4-digit code to <br /><span className="font-bold text-slate-800">{email}</span></p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-3 justify-center">
                                        {[0, 1, 2, 3].map((index) => (
                                            <input
                                                key={index}
                                                id={`checkout-otp-${index}`}
                                                type="text"
                                                maxLength={4}
                                                value={otp[index]}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                className="w-14 h-14 text-center text-2xl font-bold bg-slate-100 border-2 border-slate-300 shadow-sm rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button disabled={loading} type="submit" className="mt-4 w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                                    {loading ? "Verifying..." : "Verify Code"}
                                </button>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => setStep("email")}
                                    className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 mt-2 text-center"
                                >
                                    ← Edit Email
                                </button>
                            </form>
                        )}

                        <div className="mt-8 pt-6 border-t border-slate-200/60 text-center relative z-20">
                            <p className="text-sm text-slate-500">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                    Sign up first
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

export default function CheckoutAuth() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-700">Loading auth...</div>}>
            <CheckoutAuthContent />
        </Suspense>
    );
}
