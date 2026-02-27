"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/lib/db";
import type { DbOrder } from "@/lib/db";

export default function PaymentsPage() {
    const [orders, setOrders] = useState<DbOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const dbOrders = await getOrders();
            setOrders(dbOrders);
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const totalRevenue = orders
        .filter(o => o.status === "success" && o.amount_paise)
        .reduce((sum, o) => sum + o.amount_paise!, 0) / 100;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Reports</h1>
                    <p className="text-slate-500 mt-1">Populated by Razorpay webhook → Supabase</p>
                </div>
                <div className="text-right">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Verified Revenue</span>
                    <span className="text-3xl font-black text-amber-600">₹{totalRevenue.toLocaleString("en-IN")}</span>
                </div>
            </div>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-auto max-h-[800px]">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-slate-200">
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-200">Transaction ID</th>
                                <th className="p-4 font-bold border-b border-slate-200">User / Couple</th>
                                <th className="p-4 font-bold border-b border-slate-200">Plan</th>
                                <th className="p-4 font-bold border-b border-slate-200">Amount</th>
                                <th className="p-4 font-bold border-b border-slate-200">Status</th>
                                <th className="p-4 font-bold border-b border-slate-200">Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading payments…</td></tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">📭</span>
                                            <span className="font-medium">No payment records yet.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.map(o => (
                                <tr key={o.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                    <td className="p-4 font-mono text-xs text-slate-500">{o.transaction_id ?? "—"}</td>
                                    <td className="p-4 font-bold text-slate-800">
                                        {o.couple_name ?? "—"}
                                        <div className="text-xs font-normal text-slate-500 mt-0.5">{o.user_email}</div>
                                    </td>
                                    <td className="p-4"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">{o.plan ?? "—"}</span></td>
                                    <td className="p-4 font-bold text-slate-700">{o.amount_paise ? `₹${(o.amount_paise / 100).toLocaleString("en-IN")}` : "—"}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border ${o.status === "success" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                                                o.status === "failed" ? "text-red-700 bg-red-50 border-red-200" :
                                                    "text-amber-700 bg-amber-50 border-amber-200"
                                            }`}>{o.status ?? "—"}</span>
                                    </td>
                                    <td className="p-4 text-xs text-slate-500">
                                        {o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
