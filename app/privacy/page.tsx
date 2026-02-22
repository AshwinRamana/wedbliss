import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-28 pb-16 relative z-10">
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 md:p-12 shadow-2xl shadow-emerald-900/5">
                    <div className="text-center mb-10 border-b border-slate-100 pb-8">
                        <h1 className="font-serif text-4xl font-black text-slate-800 mb-4">Privacy Policy</h1>
                        <p className="text-slate-500">Last updated: October 2026</p>
                    </div>

                    <div className="prose prose-emerald max-w-none text-slate-600">
                        <p>At WedBliss Digital Invitations, we take your privacy exceptionally seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our platform.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">1. Information We Collect</h3>
                        <p>When you visit the site, we collect certain information about your device, including information about your web browser, IP address, timezone, and some cookies. When making a purchase, we collect Bride, Groom, Event, and Family information solely for the purpose of generating your invitation template.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">2. Guest Data</h3>
                        <p>If you use our guest RSVP tracking tools, we promise never to sell, rent, or distribute your guests&apos; phone numbers or email addresses to any third parties.</p>

                        <h3 className="font-bold text-slate-800 text-xl mt-8 mb-4">3. Data Retention</h3>
                        <p>Your beautiful digital invitations will remain hosted and active on our servers for up to 12 months after the Wedding date, depending on your chosen &apos;Basic&apos; or &apos;Premium&apos; tier. Following the expiration term, specific Media files (Video Invites, Music) may be securely redacted.</p>

                        <p className="mt-8 italic text-sm">For comprehensive inquiries concerning our data operations, please contact us at support@wedbliss.co</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
