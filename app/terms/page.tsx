import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-28 pb-16 relative z-10">
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 md:p-12 shadow-2xl shadow-emerald-900/5">
                    <div className="text-center mb-10 border-b border-slate-100 pb-8">
                        <h1 className="font-serif text-4xl font-black text-slate-800 mb-4">Terms & Conditions</h1>
                        <p className="text-slate-500">Last updated: October 2026</p>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>Welcome to WedBliss Digital Invitations. By accessing or using our websites and services, you agree to comply with and be bound by the following Terms and Conditions.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">1. License & Usage</h3>
                        <p>When you purchase a Basic or Premium plan, WedBliss grants you a limited, non-exclusive, non-transferable license to generate and share one tailored invitation site. Reselling templates or codebase extraction is strictly prohibited.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">2. User Uploaded Content</h3>
                        <p>You agree not to upload Video Invites or Music that infringe on third-party copyrights or contain vulgarity. WedBliss reserves the right to suspend invitations that violate community content guidelines.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">3. Availability</h3>
                        <p>We strive for 99.9% uptime for your live invitations. However, WedBliss is not liable for temporary hosting outages caused by upstream provider failures.</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
