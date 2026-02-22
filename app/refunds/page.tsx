import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Link from "next/link";

export default function RefundPolicy() {
    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-28 pb-16 relative z-10">
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 md:p-12 shadow-2xl shadow-emerald-900/5">
                    <div className="text-center mb-10 border-b border-slate-100 pb-8">
                        <h1 className="font-serif text-4xl font-black text-slate-800 mb-4">Refund Policy</h1>
                        <p className="text-slate-500">Last updated: October 2026</p>
                    </div>

                    <div className="prose prose-emerald max-w-none text-slate-600">
                        <p>Thank you for choosing WedBliss Digital Invitations. Please read our carefully tailored refund policy designed to be fair to both our users and our template designers.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">1. Post-Live Refunds</h3>
                        <p>Since WedBliss delivers a bespoke digital product instantly generated via your inputs, <strong>we do not offer refunds once an invitation has been paid for and published live.</strong> We provide unrestricted previews prior to the payment gateway so you can review your design in full.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">2. Duplicate Charges</h3>
                        <p>If you experience a technical error such as a duplicate charge or interrupted payment session via Razorpay, please contact our support team immediately. Verified duplicate charges will be refunded to the original payment method within 5-7 business days.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">3. Plan Upgrades</h3>
                        <p>If you initially purchased the Basic plan and wish to upgrade to Premium, please contact support for a prorated upgrade link. We do not refund the Basic plan, but rather apply its value toward your new Premium tier.</p>

                        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                            <p className="font-bold text-slate-700 mb-2">Need help with a payment?</p>
                            <Link href="/#contact" className="text-emerald-600 hover:text-emerald-700 font-bold">Contact Support Team →</Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
