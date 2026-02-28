"use client";

import { useEffect, useState } from "react";
import { getTemplates, upsertTemplate, deleteTemplate } from "@/lib/db";
import type { DbTemplate } from "@/lib/db";
import { TEMPLATES, TemplateSVG } from "@/components/marketing/Templates";

// Merge static vs dynamic
type MergedTemplate = {
    id: string;
    name: string;
    tier: "basic" | "premium";
    desc: string;
    isLive: boolean;
    isHero: boolean;
    href: string | null;
    thumbnailUrl: string | null;
};

function mergeWithStatic(dbRows: DbTemplate[]): MergedTemplate[] {
    // Start with all DB rows
    const merged: MergedTemplate[] = dbRows.map(db => ({
        id: db.id,
        name: db.name,
        tier: db.tier,
        desc: db.description,
        isLive: db.is_live,
        isHero: db.is_hero,
        href: db.demo_url,
        thumbnailUrl: db.thumbnail_url,
    }));

    // Add any static templates that aren't in the DB
    TEMPLATES.forEach(t => {
        if (!merged.find(m => m.id === t.id)) {
            merged.push({
                id: t.id,
                name: t.name,
                tier: t.tier,
                desc: t.desc,
                isLive: false,
                isHero: false,
                href: null,
                thumbnailUrl: null,
            });
        }
    });

    return merged;
}

export default function TemplateManagerPage() {
    const [templates, setTemplates] = useState<MergedTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ href: "", thumbnailUrl: "", isLive: false, isHero: false });
    const [saveMsg, setSaveMsg] = useState<{ id: string; msg: string } | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    const [showAdd, setShowAdd] = useState(false);
    const [newTpl, setNewTpl] = useState({ id: "", name: "", tier: "basic" as "basic" | "premium", desc: "", href: "", thumbnailUrl: "", isHero: false });
    const [addSaving, setAddSaving] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            const dbTemplates = await getTemplates();
            setTemplates(mergeWithStatic(dbTemplates));
            setLoading(false);
        };
        fetchTemplates();
    }, []);

    const openEdit = (t: MergedTemplate) => {
        setEditingId(t.id);
        setForm({ href: t.href ?? "", thumbnailUrl: t.thumbnailUrl ?? "", isLive: t.isLive, isHero: t.isHero });
    };

    const saveEdit = async (id: string) => {
        setSavingId(id);
        const existing = templates.find(t => t.id === id);
        if (!existing) return;
        const { error } = await upsertTemplate({
            id,
            name: existing.name,
            tier: existing.tier as "basic" | "premium",
            description: existing.desc,
            is_live: form.isLive,
            is_hero: form.isHero,
            demo_url: form.href || null,
            thumbnail_url: form.thumbnailUrl || null,
        });
        setSavingId(null);
        if (error) {
            setSaveMsg({ id, msg: "✗ " + error });
        } else {
            setTemplates(prev => prev.map(t => t.id === id
                ? { ...t, isLive: form.isLive, isHero: form.isHero, href: form.href || null, thumbnailUrl: form.thumbnailUrl || null }
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
            is_hero: newTpl.isHero,
            demo_url: newTpl.href || null,
            thumbnail_url: newTpl.thumbnailUrl || null,
        });
        setAddSaving(false);
        if (error) { setAddError(error); return; }
        setTemplates(prev => [...prev, {
            id: newTpl.id, name: newTpl.name, tier: newTpl.tier,
            desc: newTpl.desc, isLive: false, isHero: newTpl.isHero,
            href: newTpl.href || null, thumbnailUrl: newTpl.thumbnailUrl || null,
        }]);
        setNewTpl({ id: "", name: "", tier: "basic", desc: "", href: "", thumbnailUrl: "", isHero: false });
        setShowAdd(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Template Manager</h1>
                    <p className="text-slate-500 mt-1">Manage, override, and reorder the active templates rendered site-wide.</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/20">
                    ＋ Add New Base Template
                </button>
            </div>

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
                        <h3 className="font-bold text-lg text-slate-800">Add New Template Config</h3>
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
                                        value={(newTpl as unknown as Record<string, string>)[f.key]}
                                        onChange={e => setNewTpl(p => ({ ...p, [f.key]: e.target.value }))} />
                                </label>
                            ))}
                            <label className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-slate-500 uppercase">Tier</span>
                                <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    value={newTpl.tier} onChange={e => setNewTpl(p => ({ ...p, tier: e.target.value as "basic" | "premium" }))}>
                                    <option value="basic">Basic (No Photos/Video)</option>
                                    <option value="premium">Premium (Gallery/Effects)</option>
                                </select>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                <input type="checkbox" checked={newTpl.isHero} onChange={e => setNewTpl(p => ({ ...p, isHero: e.target.checked }))} className="rounded accent-indigo-600" />
                                <span className="text-xs font-bold text-slate-600">Mark as Hero (show on landing page)</span>
                            </label>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => { setShowAdd(false); setAddError(null); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                            <button onClick={handleAdd} disabled={addSaving} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold transition-colors text-sm">
                                {addSaving ? "Saving…" : "Save to DB"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-slate-400 text-sm">Loading from Supabase DB…</div>
                ) : templates.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-sm">No templates found. Run the SQL migration and seed first.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {templates.map(t => (
                            <div key={t.id} className="p-6 flex items-start gap-6 hover:bg-slate-50/50 transition-colors">
                                {/* Thumbnail */}
                                <div className="w-28 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 flex items-center justify-center">
                                    {t.thumbnailUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full overflow-hidden scale-[0.35] origin-top-left" style={{ width: "285%", height: "285%" }}>
                                            <TemplateSVG id={t.id} />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-lg text-slate-800">{t.name}</span>
                                        <span className="font-mono text-xs text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">{t.id}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.tier === "premium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{t.tier}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.isLive ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"}`}>{t.isLive ? "● Live Published" : "○ Coming Soon Outline"}</span>
                                        {t.isHero && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">★ Frontpage Hero</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{t.desc}</p>

                                    {editingId !== t.id && t.href && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">Demo URL:</span>
                                            <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline block truncate max-w-sm">{t.href}</a>
                                        </div>
                                    )}
                                    {saveMsg?.id === t.id && (
                                        <span className={`text-xs mt-2 block font-bold ${saveMsg.msg.startsWith("✓") ? "text-emerald-600" : "text-red-600"}`}>{saveMsg.msg}</span>
                                    )}
                                </div>

                                {/* Edit form or Edit button */}
                                {editingId === t.id ? (
                                    <div className="flex flex-col gap-2 w-72 flex-shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-inner">
                                        <input className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                            placeholder="Thumbnail URL (https://...)"
                                            value={form.thumbnailUrl}
                                            onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))} />
                                        <input className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                            placeholder="Live Demo URL (https://...)"
                                            value={form.href}
                                            onChange={e => setForm(p => ({ ...p, href: e.target.value }))} />
                                        <div className="flex flex-col gap-1 mt-1">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.isLive} onChange={e => setForm(p => ({ ...p, isLive: e.target.checked }))} className="rounded accent-emerald-600" />
                                                <span className="text-xs font-bold text-slate-600 leading-tight">Mark as Live (Shows &quot;Select&quot; site-wide)</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.isHero} onChange={e => setForm(p => ({ ...p, isHero: e.target.checked }))} className="rounded accent-indigo-600" />
                                                <span className="text-xs font-bold text-slate-600 leading-tight">Mark as Hero Frontpage</span>
                                            </label>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 text-xs border border-slate-200 bg-white rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                                            <button onClick={() => saveEdit(t.id)} disabled={savingId === t.id} className="flex-1 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-bold transition-colors shadow-sm">
                                                {savingId === t.id ? "Saving…" : "Save Updates →"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => openEdit(t)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200">Edit Config</button>
                                        <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
