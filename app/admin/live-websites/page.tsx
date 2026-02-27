"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LiveDomainsSection from "@/components/admin/LiveDomainsSection";

export default function LiveWebsitesPage() {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [invitations, setInvitations] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: dbInvs } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });
            setInvitations(dbInvs || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Live Websites & Domains</h1>
                <p className="text-slate-500 mt-1">Track actively deployed AWS websites and manage their domains.</p>
            </div>

            <LiveDomainsSection />

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-4">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                    <h2 className="font-bold text-lg text-slate-800">Wedding Invitations Database</h2>
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">{invitations.length} Created</span>
                </div>
                <div className="overflow-auto max-h-[600px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-200">Couple / User</th>
                                <th className="p-4 font-bold border-b border-slate-200">Domain</th>
                                <th className="p-4 font-bold border-b border-slate-200">Template / Plan</th>
                                <th className="p-4 font-bold border-b border-slate-200">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading invitations…</td></tr>
                            ) : invitations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400">
                                        No invitations found.
                                    </td>
                                </tr>
                            ) : invitations.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">
                                            {inv.data?.couple?.bride?.firstName || "Unknown"} &amp; {inv.data?.couple?.groom?.firstName || "Unknown"}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">{inv.user_email}</div>
                                    </td>
                                    <td className="p-4">
                                        {inv.subdomain ? (
                                            <a href={`http://${inv.subdomain}.wedbliss.co`} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 hover:underline">
                                                {inv.subdomain}.wedbliss.co
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 italic">No domain</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-mono text-xs text-slate-600">{inv.template_id}</div>
                                        <div className={`mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${inv.plan === "premium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                                            {inv.plan}
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-slate-500">
                                        {new Date(inv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
