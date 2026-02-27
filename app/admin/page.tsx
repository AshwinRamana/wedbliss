"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getOrders } from "@/lib/db";
import type { DbOrder } from "@/lib/db";

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<DbOrder[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [invitations, setInvitations] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [dbOrders, { data: dbInvs }] = await Promise.all([
                getOrders(),
                supabase.from('invitations').select('*').order('created_at', { ascending: false })
            ]);
            setOrders(dbOrders);
            setInvitations(dbInvs || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Derived Metrics
    // ─────────────────────────────────────────────────────────────────────────
    const activeUsersCount = new Set([
        ...invitations.map(inv => inv.user_email).filter(Boolean),
        ...orders.map(o => o.user_email).filter(Boolean)
    ]).size;

    const totalRevenue = orders
        .filter(o => o.status === "success" && o.amount_paise)
        .reduce((sum, o) => sum + o.amount_paise!, 0) / 100;

    const metrics = [
        { label: "Active Users", color: "bg-blue-50", value: loading ? "—" : activeUsersCount.toString(), sub: "Unique emails with orders/invites" },
        { label: "Live Invitations", color: "bg-emerald-50", value: loading ? "—" : invitations.length.toString(), sub: "Total invitations created" },
        { label: "Total Revenue", color: "bg-amber-50", value: loading ? "—" : `₹${totalRevenue.toLocaleString("en-IN")}`, sub: "From successful orders" },
        { label: "Support Tickets", color: "bg-purple-50", value: "0", sub: "No ticketing system connected yet" },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Real-time metrics for the WedBliss platform.</p>
            </div>

            {/* ── Metrics Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map(m => (
                    <div key={m.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${m.color} rounded-bl-full -z-0`}></div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">{m.label}</span>
                        <span className={`text-4xl font-black relative z-10 ${m.value === "—" ? "text-slate-300" : "text-slate-700"}`}>{m.value}</span>
                        <span className="text-xs font-medium text-slate-400 relative z-10">{m.sub}</span>
                    </div>
                ))}
            </div>

            {/* You can add charts or latest activities here later */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mt-4">
                <h2 className="font-bold text-lg text-slate-800 mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <button onClick={() => window.location.href = '/admin/template-creator'} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-2">
                        ✨ Create New AI Template
                    </button>
                    <button onClick={() => window.location.href = '/admin/live-websites'} className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors">
                        View Live Websites
                    </button>
                </div>
            </div>
        </div>
    );
}
