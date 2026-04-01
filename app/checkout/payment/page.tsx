"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import { TemplateSVG } from "@/components/marketing/Templates";
import { getTemplateById, DbTemplate } from "@/lib/db";
import Script from "next/script";
import Image from "next/image";

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayError {
    error: {
        description: string;
        code: string;
        source: string;
        step: string;
        reason: string;
        metadata: Record<string, unknown>;
    };
}

function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const plan = (searchParams.get("plan") || "basic").toLowerCase();
    const templateId = searchParams.get("template") || "tm-mallipoo";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [templateData, setTemplateData] = useState<DbTemplate | null>(null);

    const isPremium = plan === "premium";
    const amount = isPremium ? 1999 : 999;
    const planName = isPremium ? "Premium Plan" : "Basic Plan";

    useEffect(() => {
        const fetchTemplate = async () => {
            const data = await getTemplateById(templateId);
            setTemplateData(data);
        };
        fetchTemplate();
    }, [templateId]);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Create order on our backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/payment/order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, currency: "INR" })
            });

            const order = await res.json();
            if (!res.ok) throw new Error(order.error || "Failed to create order");

            // 2. Initialize Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SSI2d05Jgq5kXc", 
                amount: order.amount,
                currency: order.currency,
                name: "WedBliss",
                description: `Payment for ${planName}`,
                image: "/logo.png",
                order_id: order.id,
                handler: async function (response: RazorpayResponse) {
                    // 3. Verify on backend
                    const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/payment/verify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    await verifyRes.json();
                    if (verifyRes.ok) {
                        router.push(`/checkout/success?order_id=${response.razorpay_order_id}`);
                    } else {
                        router.push("/checkout/failure");
                    }
                },
                modal: {
                    ondismiss: function() {
                        router.push("/checkout/failure");
                    }
                },
                prefill: {
                    name: "", 
                    email: "",
                    contact: ""
                },
                notes: {
                    plan: plan,
                    templateId: templateId
                },
                theme: {
                    color: "#047857" 
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: RazorpayError) {
                console.error("Payment failed", response.error);
                router.push("/checkout/failure");
            });
            rzp.open();

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between overflow-hidden relative" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            {/* Mesh Gradient Overlay */}
            <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/40 rounded-full blur-[120px]"></div>
            </div>

            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Nav />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-32 pb-20 relative z-10 flex flex-col items-center">
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100/60 border border-emerald-200/50 text-emerald-800 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
                        Confirm & Launch
                    </div>
                    <h1 className="font-serif text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">Final Step: Payment</h1>
                    <p className="text-slate-500 text-base font-medium">Review your order and launch your beautiful wedding invitation.</p>
                </div>

                <div className="w-full max-w-xl bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] overflow-hidden p-8 sm:p-12 relative">
                    {/* Glass Shine */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>

                    <div className="flex flex-col gap-10 relative z-10">
                        {/* Selected Template & Plan */}
                        <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-white/30 rounded-[32px] border border-white/40 shadow-sm transition-all hover:bg-white/50">
                            <div className="w-28 h-36 rounded-2xl bg-white overflow-hidden flex items-center justify-center border border-slate-200 shadow-xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500 scale-105">
                                {templateData?.thumbnail_url ? (
                                    <Image src={templateData.thumbnail_url} alt={templateData.name} width={112} height={144} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="scale-[1.2]">
                                        <TemplateSVG id={templateId} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/50 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 mb-2">
                                        {planName}
                                    </span>
                                    <h3 className="font-serif text-2xl font-black text-slate-800 tracking-tight">
                                        {templateData?.name || templateId.replace('tm-', '').replace(/-/g, ' ')} Template
                                    </h3>
                                    <p className="text-sm font-bold text-slate-400">Professional Digital Invitation</p>
                                </div>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="flex flex-col gap-5 px-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Summary</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-slate-500">{planName} (Lifetime Access)</span>
                                    <span className="font-black text-slate-800 underline decoration-emerald-500/30 underline-offset-4">₹{amount}.00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-slate-500">Processing & Taxes</span>
                                    <span className="font-black text-emerald-600">Included</span>
                                </div>
                                <div className="pt-6 mt-2 border-t border-slate-200/50 flex justify-between items-center">
                                    <span className="text-lg font-black text-slate-900 tracking-tight">Total Payment</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{amount}.00</span>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Ready to launch</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-5 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-xs font-bold animate-shake">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {error}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-6">
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className={`group relative w-full py-5 text-center text-white text-base font-black rounded-3xl transition-all shadow-[0_20px_40px_-12px_rgba(5,150,105,0.4)] overflow-hidden
                                    ${loading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'}
                                `}
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative flex items-center justify-center gap-4">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Securing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                            Complete Order
                                        </>
                                    )}
                                </div>
                            </button>

                            <div className="flex flex-col items-center gap-4 py-4 border-t border-slate-100/50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">We support all payment methods</span>
                                <div className="w-full flex justify-center transform scale-125">
                                    <Image src="https://cdn.razorpay.com/static/assets/logo/payment_method.svg" alt="Razorpay Support" width={320} height={40} className="opacity-90 object-contain h-6 w-auto grayscale contrast-[1.2] hover:grayscale-0 transition-all duration-700 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-slate-400">
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border border-white/60">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        SSL Secure Processing
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border border-white/60">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        Verified by Razorpay
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-700 font-bold uppercase tracking-widest animate-pulse">Initializing Secure Checkout...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
