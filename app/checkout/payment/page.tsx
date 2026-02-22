"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import { useState, Suspense } from "react";
import Link from "next/link";

function CheckoutPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = searchParams.get("plan") || "basic";

    const isPremium = plan === "premium";
    const amount = isPremium ? 1999 : 999;
    const gst = Math.round(amount * 0.18);
    const total = amount + gst;

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        if (!agreedToTerms) return alert("Please agree to the Terms & Conditions.");

        setIsProcessing(true);
        // Simulate Razorpay Gateway Opening Delay
        setTimeout(async () => {
            // After successful payment, provision subdomain if configured
            try {
                const invitationId = typeof window !== "undefined" ? sessionStorage.getItem("invitation_id") : null;
                const subdomain = typeof window !== "undefined" ? sessionStorage.getItem("invitation_subdomain") : null;

                if (invitationId && subdomain) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/domains/provision`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ invitation_id: invitationId, subdomain })
                    });
                }
            } catch (err) {
                console.error("Domain provisioning error:", err);
            }

            router.push(`/checkout/success`);
        }, 2000);
    };

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-28 pb-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left Side: Order Summary */}
                <div>
                    <div className="mb-8">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4">
                            Step 4 of 4
                        </div>
                        <h1 className="font-serif text-4xl font-black text-slate-800 mb-2">Checkout</h1>
                        <p className="text-slate-500">Review your order details and complete your payment securely.</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl shadow-emerald-900/5 mb-8">
                        <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-4 mb-4">Order Summary</h3>

                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg capitalize">WedBliss {plan} Plan</h4>
                                <p className="text-sm text-slate-500">{isPremium ? "Unlimited Events, Custom Music, Video Invite" : "2 Events, Template Choice"}</p>
                            </div>
                            <div className="font-bold text-slate-800">₹{amount}</div>
                        </div>

                        <div className="flex justify-between items-center mb-6 text-sm text-slate-500">
                            <span>GST (18%)</span>
                            <span>₹{gst}</span>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                            <span className="font-bold text-slate-800 text-lg">Total Amount</span>
                            <span className="font-black text-2xl text-emerald-600">₹{total}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Gateway Trigger & Terms */}
                <div className="bg-white/90 backdrop-blur-xl border border-emerald-900/10 rounded-3xl p-8 shadow-2xl shadow-emerald-900/10 relative overflow-hidden">

                    {/* Decorative Top Banner */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>

                    <h3 className="font-serif text-2xl font-bold text-slate-800 mb-6">Payment Details</h3>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 flex items-center justify-center gap-4">
                        {/* Secure Checkout Badges */}
                        <div className="flex flex-col items-center gap-2 border-r border-slate-200 pr-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">🔒</div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Secure</span>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-sm font-bold text-slate-700">Powered by Razorpay</p>
                            <p className="text-xs text-slate-500">Cards, UPI, NetBanking accepted.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-8">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="peer w-5 h-5 appearance-none border-2 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/30 focus:outline-none checked:bg-emerald-500 checked:border-emerald-500 transition-colors"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                />
                                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-slate-600 leading-tight">
                                I agree to the <Link href="/terms" className="text-emerald-600 hover:underline font-semibold" target="_blank">Terms & Conditions</Link>, <Link href="/privacy" className="text-emerald-600 hover:underline font-semibold" target="_blank">Privacy Policy</Link>, and <Link href="/refunds" className="text-emerald-600 hover:underline font-semibold" target="_blank">Refund Policy</Link>.
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={!agreedToTerms || isProcessing}
                        className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${!agreedToTerms || isProcessing
                            ? "bg-slate-300 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(4,120,87,0.3)]"
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Opening Gateway...
                            </>
                        ) : (
                            `Pay ₹${total} Securely`
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">You will be securely redirected to the payment gateway.</p>
                </div>

            </main>

            <Footer />
        </div>
    );
}

export default function CheckoutPayment() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-700">Loading checkout...</div>}>
            <CheckoutPaymentContent />
        </Suspense>
    );
}
