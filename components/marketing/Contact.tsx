import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
    return (
        <section id="contact-us" className="py-24 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 rounded-l-[100px] -z-10 hidden lg:block" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
            <div className="absolute top-12 left-1/2 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">Get in Touch</span>
                    <h2 className="text-4xl md:text-5xl font-black font-serif text-slate-800 mb-6 tracking-tight">We&apos;d love to hear from you</h2>
                    <p className="text-lg text-slate-500">Have questions about our templates, pricing, or need help setting up your invitation? Our team is directly reachable and ready to assist.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Contact Card 1 */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 group flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                            <Mail className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Email Us</h3>
                        <p className="text-slate-500 text-sm mb-6 flex-1">Reach out for any query and we&apos;ll get back to you within 24 hours.</p>
                        <a href="mailto:info@wedbliss.co" className="font-bold text-lg text-emerald-600 hover:text-emerald-700">info@wedbliss.co</a>
                    </div>

                    {/* Contact Card 2 */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 group flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                            <Phone className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Call Us</h3>
                        <p className="text-slate-500 text-sm mb-6 flex-1">Available regarding ongoing setups or troubleshooting critical issues.</p>
                        <a href="tel:+918122357677" className="font-bold text-lg text-indigo-600 hover:text-indigo-700">+91 81223 57677</a>
                    </div>

                    {/* Contact Card 3 */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 group flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                            <MapPin className="w-8 h-8 text-amber-500 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Location</h3>
                        <p className="text-slate-500 text-sm mb-6 flex-1">Based in India, serving happy couples worldwide digitally.</p>
                        <span className="font-bold text-lg text-amber-500">Tamil Nadu, India</span>
                    </div>
                </div>

                <div className="mt-16 text-center max-w-2xl mx-auto bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
                    <p className="text-slate-600 font-medium mb-4">Looking for immediate answers regarding billing?</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/terms" className="px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Terms of Service</Link>
                        <Link href="/refunds" className="px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 font-bold rounded-xl text-sm transition-colors shadow-sm">Refund Policy</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
