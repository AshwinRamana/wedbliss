"use client";

import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export default function CheckoutSuccess() {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            {windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.15} colors={['#10b981', '#fbbf24', '#f59e0b', '#047857', '#ffffff']} />}
            <Nav />

            <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pt-28 pb-16 relative z-10">
                <div className="bg-white/90 backdrop-blur border border-emerald-900/10 rounded-[40px] p-10 md:p-16 max-w-2xl w-full text-center shadow-2xl shadow-emerald-900/10 relative overflow-hidden">

                    {/* Decorative Ring */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 border-[30px] border-emerald-50 rounded-full opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 border-[20px] border-amber-50 rounded-full opacity-50"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center text-white text-5xl mb-8 shadow-xl shadow-emerald-500/30 animate-bounce">
                            ✓
                        </div>

                        <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                            Congratulations on <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-emerald-600">Your Upcoming Wedding!</span>
                        </h1>

                        <p className="text-slate-600 text-lg mb-10 max-w-md mx-auto">
                            Your payment was successful and your digital invitation is ready! You can now view it, share it, or make further edits from your dashboard.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <Link
                                href="/dashboard"
                                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                            <Link
                                href="#"
                                onClick={(e) => { e.preventDefault(); alert("Mock Link: Preview Invitation") }}
                                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                View Live Invite <span>↗</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
