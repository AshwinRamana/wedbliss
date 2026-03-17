"use client";

import Link from "next/link";
import { Suspense } from "react";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";

function FailureContent() {
    return (
        <div className="min-h-screen flex flex-col justify-between relative" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-40 pb-20 relative z-10 flex flex-col items-center">
                <div className="w-full max-w-lg bg-white/50 backdrop-blur-3xl border border-white/60 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] p-10 sm:p-14 text-center relative overflow-hidden">
                    {/* Top Accent (Red for Error) */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-orange-400 to-red-400"></div>

                    {/* Error Icon */}
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner border border-red-100 animate-pulse">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>

                    <div className="inline-block px-4 py-1 rounded-full bg-red-100/50 border border-red-200 text-red-800 text-[10px] font-black uppercase tracking-widest mb-6">
                        Payment Declined
                    </div>

                    <h1 className="font-serif text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">Oops! Something went wrong.</h1>
                    <p className="text-slate-500 text-lg font-medium mb-12">
                        We couldn't process your payment. This could be due to a network error or insufficient funds. Don't worry, your progress is saved!
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link
                            href="/checkout/payment"
                            className="w-full py-5 bg-slate-900 hover:bg-black text-white text-base font-black rounded-3xl transition-all shadow-2xl active:scale-[0.98]"
                        >
                            Retry Secure Payment
                        </Link>
                        <Link 
                            href="/dashboard"
                            className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Back to dashboard
                        </Link>
                    </div>
                </div>

                <div className="mt-12 text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 bg-white/50 px-6 py-3 rounded-full border border-white/60">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    Your transaction attempt was kept secure
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function FailurePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-red-700 font-bold uppercase tracking-widest animate-pulse">Retrying...</div>}>
            <FailureContent />
        </Suspense>
    );
}
