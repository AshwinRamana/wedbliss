"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import { TemplateSVG } from "@/components/marketing/Templates";
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

    const isPremium = plan === "premium";
    const amount = isPremium ? 1999 : 999;
    const planName = isPremium ? "Premium Plan" : "Basic Plan";

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

                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok) {
                        router.push("/dashboard?payment=success");
                    } else {
                        throw new Error(verifyData.message || "Payment verification failed");
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
                setError(response.error.description);
                setLoading(false);
            });
            rzp.open();

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Nav />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-28 pb-16 relative z-10 flex flex-col items-center">
                <div className="text-center mb-10 max-w-xl mx-auto">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4">
                        Step 3 of 4: Payment
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-800 mb-2">Secure Payment</h1>
                    <p className="text-slate-500 text-sm">Review your details and complete the payment to launch your wedding website.</p>
                </div>

                <div className="w-full max-w-lg bg-white/60 backdrop-blur-xl border border-white/40 rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10">
                    <div className="flex flex-col gap-8">
                        {/* Selected Plan Info */}
                        <div className="flex items-center gap-6 p-6 bg-white/40 rounded-3xl border border-white/20">
                            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner">
                                <TemplateSVG id={templateId} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-serif text-xl font-bold text-slate-800">{planName}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">₹{amount} Total</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                                        Selected Template: {templateId.replace('tm-', '')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Details Table */}
                        <div className="flex flex-col gap-4 px-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Order Details</h4>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100/50">
                                <span className="text-sm font-medium text-slate-600">{planName} Subscription</span>
                                <span className="text-sm font-bold text-slate-800">₹{amount}.00</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100/50">
                                <span className="text-sm font-medium text-slate-600">GST / Taxes (Included)</span>
                                <span className="text-sm font-bold text-slate-800">₹0.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="text-base font-black text-slate-800">Total Amount Due</span>
                                <span className="text-2xl font-black text-emerald-700">₹{amount}.00</span>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className={`w-full py-4 text-center text-white text-sm font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3
                                ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 active:scale-95'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    Complete Secure Payment
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-4 py-2">
                             <Image src="https://cdn.razorpay.com/static/assets/logo/payment_method.svg" alt="Razorpay Support" width={200} height={20} className="opacity-70 object-contain h-4 w-auto" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    256-bit SSL secured payment processing
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-emerald-700">Initializing Secure Checkout...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
