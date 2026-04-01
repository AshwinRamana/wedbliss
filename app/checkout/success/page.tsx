"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id") || `WB-${Math.floor(100000 + Math.random() * 900000)}`;

    return (
        <div className="min-h-screen flex flex-col justify-between relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            {/* Celebration Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[10%] left-[15%] w-4 h-4 bg-gold rounded-full blur-[1px] animate-float"></div>
                <div className="absolute top-[30%] right-[20%] w-3 h-3 bg-emerald-500 rounded-full blur-[1px] animate-float-delayed"></div>
                <div className="absolute bottom-[20%] left-[25%] w-5 h-5 bg-amber-400 rounded-full blur-[1px] animate-float"></div>
            </div>

            <Nav />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-40 pb-20 relative z-10 flex flex-col items-center">
                <div className="w-full max-w-lg bg-white/50 backdrop-blur-3xl border border-white/60 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] p-10 sm:p-14 text-center relative overflow-hidden">
                    {/* Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold via-emerald-500 to-gold"></div>

                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner border border-emerald-200 animate-bounce-slow">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <div className="inline-block px-4 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-6">
                        Payment Successful
                    </div>

                    <h1 className="font-serif text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">Congratulations!</h1>
                    <p className="text-slate-500 text-lg font-medium mb-10">
                        Your wedding website is now authorized and ready for the grand launch. We&apos;ve sent the receipt to your email.
                    </p>

                    <div className="bg-slate-50/80 rounded-3xl p-6 mb-12 border border-slate-100 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Order ID</span>
                            <span className="text-slate-800">{orderId}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200/50">
                            <span>Status</span>
                            <span className="text-emerald-600">Active</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link
                            href="/dashboard"
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-black rounded-3xl transition-all shadow-[0_20px_40px_-12px_rgba(5,150,105,0.4)] active:scale-[0.98]"
                        >
                            Go to Dashboard
                        </Link>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Starting your journey with WedBliss
                        </p>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
                    {[
                        { title: "Personalize", desc: "Add your photos and story." },
                        { title: "Invite", desc: "Share your custom link." },
                        { title: "Manage", desc: "Track RSVPs in real-time." }
                    ].map((step, i) => (
                        <div key={i} className="text-center p-6 bg-white/30 rounded-[32px] border border-white/40">
                             <h4 className="font-serif text-lg font-black text-slate-800 mb-2">{step.title}</h4>
                             <p className="text-sm text-slate-500 font-medium">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-24px); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 1s; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-700 font-black uppercase tracking-widest animate-pulse">Confirming Celebration...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
