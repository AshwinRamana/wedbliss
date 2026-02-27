"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { LayoutDashboard, Users, Globe, Wand2, LayoutTemplate, IndianRupee, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "ashwinramana7@gmail.com";

    // ── Auth Guard ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (pathname?.startsWith('/admin/login')) {
            setLoading(false);
            return;
        }
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.replace("/admin/login"); return; }
            if (ADMIN_EMAIL && session.user.email !== ADMIN_EMAIL) {
                setAccessDenied(true); setLoading(false); return;
            }
            setUser(session.user);
            setLoading(false);
        };
        checkAdmin();
    }, [pathname, router, ADMIN_EMAIL]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (pathname?.startsWith('/admin/login')) {
        return <>{children}</>;
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-emerald-500 font-bold">
            Establishing Secure Link...
        </div>
    );

    if (accessDenied) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans p-4 text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-slate-400 mb-8 max-w-md">Your email does not have master administrative privileges.</p>
            <button onClick={handleSignOut} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all">Sign Out to Retry</button>
        </div>
    );

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Customers", href: "/admin/customers", icon: Users },
        { label: "Live Websites", href: "/admin/live-websites", icon: Globe },
        { label: "Template Studio", href: "/admin/template-creator", icon: Wand2 },
        { label: "Template Manager", href: "/admin/template-manager", icon: LayoutTemplate },
        { label: "Payments", href: "/admin/payments", icon: IndianRupee },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex text-sm">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-50">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex flex-shrink-0 items-center justify-center text-white font-bold font-serif shadow-lg shadow-emerald-600/20">V</div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">WedBliss Admin</span>
                        <span className="text-[10px] text-slate-500 mt-1 truncate max-w-[150px]">{user?.email}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${isActive
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}>
                                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
