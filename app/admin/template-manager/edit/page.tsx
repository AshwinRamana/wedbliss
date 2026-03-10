"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save, Code, Loader2 } from "lucide-react";
import Link from "next/link";

function EditTemplateCodeContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [htmlContent, setHtmlContent] = useState("");
    const [cssContent, setCssContent] = useState("");
    const [jsContent, setJsContent] = useState("");

    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const rawParams = new URLSearchParams(window.location.search);
        const resolvedId = id || rawParams.get("id");

        if (!resolvedId) {
            // Give Next.js router a moment to hydrate the query params
            const timer = setTimeout(() => {
                setError("No template ID provided in the URL.");
                setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }

        const fetchTpl = async () => {
            setLoading(true);
            setError(null);
            const { data, error: fetchErr } = await supabase
                .from('templates')
                .select('*')
                .eq('id', resolvedId)
                .single();

            if (fetchErr || !data) {
                setError("Template not found.");
            } else {
                setTemplate(data);
                setHtmlContent(data.html_content || "");
                setCssContent(data.css_content || "");
                setJsContent(data.js_content || "");
            }
            setLoading(false);
        };
        fetchTpl();
    }, [id]);

    const handleSave = async () => {
        const rawParams = new URLSearchParams(window.location.search);
        const resolvedId = id || rawParams.get("id");

        if (!confirm("Are you sure? Saving this will INSTANTLY update all live websites currently using this template.")) return;
        setSaving(true);
        setSaveMsg(null);

        try {
            const { error: updErr } = await supabase
                .from('templates')
                .update({
                    html_content: htmlContent,
                    css_content: cssContent,
                    js_content: jsContent,
                    updated_at: new Date().toISOString()
                })
                .eq('id', resolvedId);

            if (updErr) throw updErr;

            setSaveMsg({ type: "success", text: "Successfully deployed template changes to all active domains!" });
            setTimeout(() => setSaveMsg(null), 4000);
        } catch (err: unknown) {
            console.error(err);
            setSaveMsg({ type: "error", text: "Failed to save: " + (err instanceof Error ? err.message : String(err)) });
        }
        setSaving(false);
    };

    if (loading) return <Loader fullScreen text="Loading template code..." />;

    return (
        <div className="flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Link href="/admin/template-manager" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors uppercase tracking-wider mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Templates
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        Edit Template Source
                        <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">{id}</span>
                    </h1>
                    <p className="text-slate-500 mt-1">Directly edit the raw HTML Handlebars and CSS for <strong className="text-slate-700">{template?.name}</strong>. Changes instantly reflect on all live domains.</p>
                </div>
                <div className="flex items-center gap-3">
                    {saveMsg && (
                        <span className={`text-sm font-bold ${saveMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                            {saveMsg.text}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-colors flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Deploying..." : "Save & Deploy Globally"}
                    </button>
                </div>
            </div>

            {error ? (
                <div className="p-8 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center font-medium">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[75vh] min-h-[600px]">
                    {/* HTML Editor */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
                        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-slate-300 font-mono text-sm font-bold flex items-center gap-2">
                                <Code className="w-4 h-4 text-emerald-400" /> HTML Content (Handlebars)
                            </h3>
                        </div>
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            className="flex-1 w-full bg-slate-900 text-emerald-300 font-mono text-sm p-4 focus:outline-none resize-none"
                            spellCheck={false}
                        />
                    </div>

                    {/* CSS Editor */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
                        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-slate-300 font-mono text-sm font-bold flex items-center gap-2">
                                <Code className="w-4 h-4 text-sky-400" /> CSS Content
                            </h3>
                        </div>
                        <textarea
                            value={cssContent}
                            onChange={(e) => setCssContent(e.target.value)}
                            className="flex-1 w-full bg-slate-900 text-sky-300 font-mono text-sm p-4 focus:outline-none resize-none"
                            spellCheck={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EditTemplateCodePage() {
    return (
        <Suspense fallback={<Loader fullScreen text="Loading..." />}>
            <EditTemplateCodeContent />
        </Suspense>
    );
}
