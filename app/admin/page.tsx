"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { TEMPLATES, TemplateSVG } from "@/components/marketing/Templates";
import { getTemplates, upsertTemplate, deleteTemplate, getOrders } from "@/lib/db";
import type { DbTemplate, DbOrder } from "@/lib/db";
import LiveDomainsSection from "@/components/admin/LiveDomainsSection";

// ─────────────────────────────────────────────────────────────────────────────
// Merged type (static SVG artwork + live DB flags)
// ─────────────────────────────────────────────────────────────────────────────
type MergedTemplate = {
    id: string;
    name: string;
    tier: "basic" | "premium";
    desc: string;
    isLive: boolean;
    href: string | null;
    thumbnailUrl: string | null;
};

function mergeWithStatic(dbRows: DbTemplate[]): MergedTemplate[] {
    return TEMPLATES.map(t => {
        const db = dbRows.find(d => d.id === t.id);
        return {
            id: t.id,
            name: db?.name ?? t.name,
            tier: (db?.tier ?? t.tier) as "basic" | "premium",
            desc: db?.description ?? t.desc,
            isLive: db?.is_live ?? false,
            href: db?.demo_url ?? null,
            thumbnailUrl: db?.thumbnail_url ?? null,
        };
    });
}

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    // Data
    const [templates, setTemplates] = useState<MergedTemplate[]>([]);
    const [orders, setOrders] = useState<DbOrder[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    // UI state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ href: "", thumbnailUrl: "", isLive: false });
    const [saveMsg, setSaveMsg] = useState<{ id: string; msg: string } | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newTpl, setNewTpl] = useState({ id: "", name: "", tier: "basic" as "basic" | "premium", desc: "", href: "", thumbnailUrl: "" });
    const [addSaving, setAddSaving] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    // ── Auth Guard ─────────────────────────────────────────────────────────────
    useEffect(() => {
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
    }, [router, ADMIN_EMAIL]);

    // ── Fetch live data from Supabase ─────────────────────────────────────────
    useEffect(() => {
        if (loading || accessDenied) return;
        const fetchData = async () => {
            setDataLoading(true);
            const [dbTemplates, dbOrders] = await Promise.all([getTemplates(), getOrders()]);
            setTemplates(mergeWithStatic(dbTemplates));
            setOrders(dbOrders);
            setDataLoading(false);
        };
        fetchData();
    }, [loading, accessDenied]);

    // ── Template CRUD ─────────────────────────────────────────────────────────
    const openEdit = (t: MergedTemplate) => {
        setEditingId(t.id);
        setForm({ href: t.href ?? "", thumbnailUrl: t.thumbnailUrl ?? "", isLive: t.isLive });
    };

    const saveEdit = async (id: string) => {
        setSavingId(id);
        const { error } = await upsertTemplate({
            id,
            is_live: form.isLive,
            demo_url: form.href || null,
            thumbnail_url: form.thumbnailUrl || null,
        });
        setSavingId(null);
        if (error) {
            setSaveMsg({ id, msg: "✗ " + error });
        } else {
            setTemplates(prev => prev.map(t => t.id === id
                ? { ...t, isLive: form.isLive, href: form.href || null, thumbnailUrl: form.thumbnailUrl || null }
                : t
            ));
            setEditingId(null);
            setSaveMsg({ id, msg: "✓ Saved to Supabase" });
        }
        setTimeout(() => setSaveMsg(null), 3000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Delete template "${id}"? This cannot be undone.`)) return;
        const { error } = await deleteTemplate(id);
        if (!error) setTemplates(prev => prev.filter(t => t.id !== id));
    };

    const handleAdd = async () => {
        if (!newTpl.id || !newTpl.name) { setAddError("ID and Name are required."); return; }
        setAddSaving(true); setAddError(null);
        const { error } = await upsertTemplate({
            id: newTpl.id,
            name: newTpl.name,
            tier: newTpl.tier,
            description: newTpl.desc,
            is_live: false,
            demo_url: newTpl.href || null,
            thumbnail_url: newTpl.thumbnailUrl || null,
        });
        setAddSaving(false);
        if (error) { setAddError(error); return; }
        setTemplates(prev => [...prev, {
            id: newTpl.id, name: newTpl.name, tier: newTpl.tier,
            desc: newTpl.desc, isLive: false,
            href: newTpl.href || null, thumbnailUrl: newTpl.thumbnailUrl || null,
        }]);
        setNewTpl({ id: "", name: "", tier: "basic", desc: "", href: "", thumbnailUrl: "" });
        setShowAdd(false);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render guards
    // ─────────────────────────────────────────────────────────────────────────
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
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all">Sign Out to Retry</button>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Main Dashboard
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Admin Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold font-serif text-xl shadow-lg shadow-emerald-600/20">V</div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">WedBliss Command Center</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">Admin: {user?.email}</span>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-red-100">
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8 flex flex-col gap-10">

                {/* ── Metrics Row (live data pending real integrations) ── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Active Users", color: "bg-blue-50", sub: "Connect analytics to see live count" },
                        { label: "Live Invitations", color: "bg-emerald-50", sub: "Connect DB to see live count" },
                        { label: "Total Revenue", color: "bg-amber-50", sub: "Connect Razorpay to see live revenue" },
                        { label: "Support Tickets", color: "bg-purple-50", sub: "No ticketing system connected yet" },
                    ].map(m => (
                        <div key={m.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${m.color} rounded-bl-full -z-0`}></div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">{m.label}</span>
                            <span className="text-4xl font-black text-slate-300 relative z-10">—</span>
                            <span className="text-xs font-medium text-slate-400 relative z-10">{m.sub}</span>
                        </div>
                    ))}
                </div>

                {/* ── Template Management (CRUD from Supabase) ── */}
                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-lg text-slate-800">Template Management</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Changes save to Supabase and reflect site-wide immediately.</p>
                        </div>
                        <button onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/20">
                            ＋ Add Template
                        </button>
                    </div>

                    {/* Add Modal */}
                    {showAdd && (
                        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
                                <h3 className="font-bold text-lg text-slate-800">Add New Template</h3>
                                {addError && <p className="text-sm text-red-600 font-medium">{addError}</p>}
                                <div className="flex flex-col gap-3">
                                    {[
                                        { label: "Template ID (unique slug)", key: "id", placeholder: "e.g. tm-lotus" },
                                        { label: "Display Name", key: "name", placeholder: "e.g. Lotus Dream" },
                                        { label: "Description", key: "desc", placeholder: "Short tagline" },
                                        { label: "Thumbnail Image URL", key: "thumbnailUrl", placeholder: "https://..." },
                                        { label: "Live Demo URL", key: "href", placeholder: "https://mallipoo.wedbliss.co" },
                                    ].map(f => (
                                        <label key={f.key} className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-500 uppercase">{f.label}</span>
                                            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                                placeholder={f.placeholder}
                                                value={(newTpl as Record<string, string>)[f.key]}
                                                onChange={e => setNewTpl(p => ({ ...p, [f.key]: e.target.value }))} />
                                        </label>
                                    ))}
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Tier</span>
                                        <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                            value={newTpl.tier} onChange={e => setNewTpl(p => ({ ...p, tier: e.target.value as "basic" | "premium" }))}>
                                            <option value="basic">Basic</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button onClick={() => { setShowAdd(false); setAddError(null); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                                    <button onClick={handleAdd} disabled={addSaving} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold transition-colors text-sm">
                                        {addSaving ? "Saving…" : "Add to Supabase"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Template rows */}
                    {dataLoading ? (
                        <div className="p-10 text-center text-slate-400 text-sm">Loading from Supabase…</div>
                    ) : templates.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">No templates found. Run the SQL migration and seed first.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {templates.map(t => (
                                <div key={t.id} className="p-5 flex items-start gap-5 hover:bg-slate-50/50 transition-colors">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center">
                                        {t.thumbnailUrl ? (
                                            <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full overflow-hidden scale-[0.25] origin-top-left" style={{ width: "400%", height: "400%" }}>
                                                <TemplateSVG id={t.id} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-800">{t.name}</span>
                                            <span className="font-mono text-xs text-slate-400">{t.id}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.tier === "premium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{t.tier}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.isLive ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"}`}>{t.isLive ? "● Live" : "○ Coming Soon"}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                                        {editingId !== t.id && t.href && (
                                            <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline mt-0.5 block truncate">{t.href}</a>
                                        )}
                                        {saveMsg?.id === t.id && (
                                            <span className={`text-xs font-bold ${saveMsg.msg.startsWith("✓") ? "text-emerald-600" : "text-red-600"}`}>{saveMsg.msg}</span>
                                        )}
                                    </div>

                                    {/* Edit form or Edit button */}
                                    {editingId === t.id ? (
                                        <div className="flex flex-col gap-2 w-72 flex-shrink-0">
                                            <input className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                                placeholder="Thumbnail URL (https://...)"
                                                value={form.thumbnailUrl}
                                                onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))} />
                                            <input className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                                placeholder="Live Demo URL (https://...)"
                                                value={form.href}
                                                onChange={e => setForm(p => ({ ...p, href: e.target.value }))} />
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.isLive} onChange={e => setForm(p => ({ ...p, isLive: e.target.checked }))} className="rounded accent-emerald-600" />
                                                <span className="text-xs font-bold text-slate-600">Mark as Live (shows "View Demo" site-wide)</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 text-xs border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                                <button onClick={() => saveEdit(t.id)} disabled={savingId === t.id} className="flex-1 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-bold transition-colors">
                                                    {savingId === t.id ? "Saving…" : "Save →"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button onClick={() => openEdit(t)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200">Edit</button>
                                            <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Delete</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Recent Orders (from Supabase, no dummy rows) ── */}
                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-slate-800">Recent Payment Reports</h2>
                        <span className="text-xs text-slate-400 font-medium">Populated by Razorpay webhook → Supabase</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-slate-200">Transaction ID</th>
                                    <th className="p-4 font-bold border-b border-slate-200">User / Couple</th>
                                    <th className="p-4 font-bold border-b border-slate-200">Plan</th>
                                    <th className="p-4 font-bold border-b border-slate-200">Amount</th>
                                    <th className="p-4 font-bold border-b border-slate-200">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {dataLoading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading…</td></tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-3xl">📭</span>
                                                <span className="font-medium">No payment records yet.</span>
                                                <span className="text-xs">Payments will appear here once the Razorpay integration is live.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.map(o => (
                                    <tr key={o.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                        <td className="p-4 font-mono text-xs text-slate-500">{o.transaction_id ?? "—"}</td>
                                        <td className="p-4 font-bold text-slate-800">{o.couple_name ?? "—"}</td>
                                        <td className="p-4"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">{o.plan ?? "—"}</span></td>
                                        <td className="p-4 font-bold text-slate-700">{o.amount_paise ? `₹${(o.amount_paise / 100).toLocaleString("en-IN")}` : "—"}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border ${o.status === "success" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                                                o.status === "failed" ? "text-red-700 bg-red-50 border-red-200" :
                                                    "text-amber-700 bg-amber-50 border-amber-200"
                                                }`}>{o.status ?? "—"}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Live Domains Management ── */}
                <LiveDomainsSection />

            </main>
        </div>
    );
}
