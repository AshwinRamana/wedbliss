"use client";

import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type DomainRecord = {
    id: string;
    user_email: string;
    subdomain: string;
    domain_status: string | null;
    cloudfront_id: string | null;
    created_at: string;
    bride_first: string | null;
    groom_first: string | null;
};

export default function LiveDomainsSection() {
    const [domains, setDomains] = useState<DomainRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const fetchDomains = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/domains`);
            const data = await res.json();
            setDomains(data.domains || []);
        } catch {
            console.error("Failed to fetch domains");
        }
        setLoading(false);
    };

    useEffect(() => { fetchDomains(); }, []);

    const handleRemove = async (id: string, subdomain: string) => {
        if (!confirm(`Are you sure you want to remove ${subdomain}.wedbliss.co?\n\nThis will:\n• Remove CloudFront alias\n• Clear DNS records (when Namecheap is connected)\n• Remove domain from the database`)) return;

        setRemovingId(id);
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/domains/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setDomains(prev => prev.filter(d => d.id !== id));
            } else {
                alert("Failed to remove domain: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            alert("Network error removing domain");
        }
        setRemovingId(null);
    };

    const statusBadge = (status: string | null) => {
        const styles: Record<string, string> = {
            active: "text-emerald-700 bg-emerald-50 border-emerald-200",
            provisioning: "text-blue-700 bg-blue-50 border-blue-200",
            pending: "text-amber-700 bg-amber-50 border-amber-200",
            failed: "text-red-700 bg-red-50 border-red-200",
        };
        return styles[status || "pending"] || styles.pending;
    };

    return (
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-lg text-slate-800">Live Domains</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage active wedding invitation subdomains on wedbliss.co</p>
                </div>
                <button onClick={fetchDomains} className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors border border-emerald-100">
                    ↻ Refresh
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold border-b border-slate-200">Subdomain</th>
                            <th className="p-4 font-bold border-b border-slate-200">Couple</th>
                            <th className="p-4 font-bold border-b border-slate-200">User</th>
                            <th className="p-4 font-bold border-b border-slate-200">Status</th>
                            <th className="p-4 font-bold border-b border-slate-200">Created</th>
                            <th className="p-4 font-bold border-b border-slate-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading…</td></tr>
                        ) : domains.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-3xl">🌐</span>
                                        <span className="font-medium">No live domains yet.</span>
                                        <span className="text-xs">Domains will appear here as users complete checkout with a subdomain.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : domains.map(d => (
                            <tr key={d.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                <td className="p-4">
                                    <a href={`https://${d.subdomain}.wedbliss.co`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">
                                        {d.subdomain}.wedbliss.co
                                    </a>
                                </td>
                                <td className="p-4 font-bold text-slate-800">
                                    {d.bride_first && d.groom_first ? `${d.bride_first} & ${d.groom_first}` : "—"}
                                </td>
                                <td className="p-4 text-slate-500 font-mono text-xs">{d.user_email}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border ${statusBadge(d.domain_status)}`}>
                                        {d.domain_status || "pending"}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500 text-xs">{new Date(d.created_at).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleRemove(d.id, d.subdomain)}
                                        disabled={removingId === d.id}
                                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100 disabled:opacity-50"
                                    >
                                        {removingId === d.id ? "Removing…" : "Remove Domain"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
