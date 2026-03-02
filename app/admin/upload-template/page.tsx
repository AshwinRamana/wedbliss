"use client";

import { useState, useEffect } from "react";
import { Upload, Play, Save, Trash2, Code, CheckCircle, XCircle, Eye, FileUp, AlertTriangle } from "lucide-react";
import { upsertTemplate } from "@/lib/db";
// @ts-expect-error - missing declaration file
import Handlebars from "handlebars/dist/handlebars";
// ─────────────────────────────────────────────────────────────────────────────
// Sample data for live preview (matches template-config.json sampleData)
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_DATA = {
    couple: {
        bride: { firstName: "Priya", fatherName: "Krishnaswamy", motherName: "Kamakshi", notes: "Can't wait to start this beautiful journey together!" },
        groom: { firstName: "Karthik", fatherName: "Ramasamy", motherName: "Saraswathi", notes: "Forever and always, my love." }
    },
    events: [
        { id: "ev-1", title: "Muhurtham", date: "28 February 2026", startTime: "8:24 AM", endTime: "10:48 AM", venueName: "Sri Murugan Kalyana Mandapam", googleMapsUrl: "https://maps.google.com/?q=Sri+Murugan+Kalyana+Mandapam" },
        { id: "ev-2", title: "Reception", date: "28 February 2026", startTime: "6:00 PM", endTime: "10:00 PM", venueName: "Grand Ballroom, Hotel Savera", googleMapsUrl: "https://maps.google.com/?q=Hotel+Savera+Chennai" }
    ],
    gallery: { images: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500", "https://images.unsplash.com/photo-1519741497674-611481863552?w=500"] },
    media: { videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Parse a single .html file into html_content, css_content, js_content
// ─────────────────────────────────────────────────────────────────────────────
function parseTemplateFile(rawHtml: string): { html: string; css: string; js: string } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    // Extract all <style> blocks
    const styleNodes = doc.querySelectorAll("style");
    let css = "";
    styleNodes.forEach(node => {
        css += node.textContent + "\n";
        node.remove();
    });

    // Extract all <script> blocks
    const scriptNodes = doc.querySelectorAll("script");
    let js = "";
    scriptNodes.forEach(node => {
        js += node.textContent + "\n";
        node.remove();
    });

    // Remaining body is the HTML (Handlebars template)
    const html = doc.body.innerHTML.trim();

    return { html, css: css.trim(), js: js.trim() };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Validate Handlebars tags against template-config.json
// ─────────────────────────────────────────────────────────────────────────────
type ValidationResult = { valid: boolean; errors: string[]; warnings: string[] };

function validateHandlebars(html: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required tags that MUST be present
    const requiredTags = [
        "couple.bride.firstName",
        "couple.groom.firstName",
        "couple.bride.fatherName",
        "couple.bride.motherName",
        "couple.groom.fatherName",
        "couple.groom.motherName",
    ];

    for (const tag of requiredTags) {
        if (!html.includes(`{{${tag}}}`)) {
            errors.push(`Missing required tag: {{${tag}}}`);
        }
    }

    // Check for events loop
    if (!html.includes("{{#each events}}")) {
        errors.push("Missing events loop: {{#each events}}");
    }

    // Try to compile
    try {
        Handlebars.compile(html);
    } catch (e: unknown) {
        errors.push(`Handlebars compile error: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Warn about optional sections
    if (!html.includes("{{#if gallery.images}}")) {
        warnings.push("Missing conditional gallery section: {{#if gallery.images}}");
    }
    if (!html.includes("{{#if media.videoUrl}}")) {
        warnings.push("Missing conditional video section: {{#if media.videoUrl}}");
    }
    if (!html.includes("{{#if couple.bride.notes}}")) {
        warnings.push("Missing bride notes section: {{#if couple.bride.notes}}");
    }
    if (!html.includes("{{#if couple.groom.notes}}")) {
        warnings.push("Missing groom notes section: {{#if couple.groom.notes}}");
    }

    // Check for OLD/wrong tags
    const oldTags = ["{{couple.parents}}", "{{couple.bride.lastName}}", "{{couple.groom.lastName}}", "{{couple.storyMessage}}", "{{time}}", "{{venueAddress}}"];
    for (const tag of oldTags) {
        if (html.includes(tag)) {
            errors.push(`Found deprecated tag: ${tag} — this will not render any data`);
        }
    }

    return { valid: errors.length === 0, errors, warnings };
}

export default function UploadTemplatePage() {

    const [fileName, setFileName] = useState("");

    // ── Parsed Content ──
    const [parsedHtml, setParsedHtml] = useState("");
    const [parsedCss, setParsedCss] = useState("");
    const [parsedJs, setParsedJs] = useState("");

    // ── Validation ──
    const [validation, setValidation] = useState<ValidationResult | null>(null);

    // ── Compiled Preview ──
    const [compiledLiveHtml, setCompiledLiveHtml] = useState("");

    // ── Metadata ──
    const [templateId, setTemplateId] = useState("");
    const [templateName, setTemplateName] = useState("");
    const [templateDesc, setTemplateDesc] = useState("");
    const [tier, setTier] = useState<"basic" | "premium">("premium");
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    // ── Save State ──
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });

    // ── Active Tab ──
    const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");

    // ── View Mode ──  
    const [viewMode, setViewMode] = useState<"upload" | "review">("upload");

    // Sample data is defined as SAMPLE_DATA constant at the top of the file

    // ── File Upload Handler ──
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
            alert("Please upload an .html file");
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;

            // Parse the file
            const { html, css, js } = parseTemplateFile(content);
            setParsedHtml(html);
            setParsedCss(css);
            setParsedJs(js);

            // Validate
            const result = validateHandlebars(html);
            setValidation(result);

            // Auto-fill ID from filename
            if (!templateId) {
                const slug = file.name.replace(/\.(html|htm)$/, "").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
                setTemplateId(`tm-${slug}`);
            }

            // Switch to review mode
            setViewMode("review");
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    // ── Live Compilation ──
    useEffect(() => {
        if (!parsedHtml) { setCompiledLiveHtml(""); return; }
        try {
            const template = Handlebars.compile(parsedHtml);
            const resolvedHtml = template(SAMPLE_DATA);
            const fullHtml = `
                <html><head><meta name="viewport" content="width=device-width, initial-scale=1">
                <style>${parsedCss}</style></head>
                <body>${resolvedHtml}</body></html>`;
            setCompiledLiveHtml(fullHtml);
        } catch (e) {
            console.error("Handlebars compilation error:", e);
            setCompiledLiveHtml(`<div style="padding:2rem;color:red;font-family:monospace;">Compilation Error: ${e instanceof Error ? e.message : String(e)}</div>`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parsedHtml, parsedCss]);

    // ── Save Handler (Draft or Live) ──
    const handleSave = async (pushLive: boolean) => {
        if (!templateId || !templateName) {
            alert("Template ID and Display Name are required.");
            return;
        }
        if (!parsedHtml) {
            alert("No template content. Please upload an HTML file first.");
            return;
        }
        if (pushLive && validation && !validation.valid) {
            alert("Cannot push live — template has validation errors. Fix them first.");
            return;
        }

        setIsSaving(true);
        setSaveStatus({ type: null, msg: "" });

        const { error } = await upsertTemplate({
            id: templateId,
            name: templateName,
            tier,
            description: templateDesc,
            is_live: pushLive,
            is_hero: false,
            html_content: parsedHtml,
            css_content: parsedCss,
            js_content: parsedJs || null,
            demo_url: null,
            thumbnail_url: thumbnailUrl || null,
        });

        setIsSaving(false);
        if (error) {
            setSaveStatus({ type: "error", msg: `Database Error: ${error}` });
        } else {
            setSaveStatus({ type: "success", msg: pushLive ? "✓ Template is LIVE on the website!" : "✓ Saved as Draft (not visible to users yet)" });
        }
    };

    // ── Clear/Reset ──
    const handleClear = () => {
        if (!confirm("Clear everything and start over?")) return;
        setFileName(""); setParsedHtml(""); setParsedCss(""); setParsedJs("");
        setValidation(null); setCompiledLiveHtml(""); setViewMode("upload");
        setSaveStatus({ type: null, msg: "" });
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex justify-between items-end flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Upload className="w-6 h-6 text-indigo-600" />
                        Template Upload & Validate
                    </h1>
                    <p className="text-slate-500 mt-1">Upload a .html template file → Auto-validate → Preview → Push to website.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors shadow-sm">
                        <Trash2 className="w-4 h-4" /> Reset
                    </button>
                    {viewMode === "review" && (
                        <>
                            <button onClick={() => handleSave(false)} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-sm">
                                {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save as Draft</>}
                            </button>
                            <button onClick={() => handleSave(true)} disabled={isSaving || (validation !== null && !validation.valid)} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-600/20">
                                {isSaving ? <span className="animate-pulse">Pushing...</span> : <><Eye className="w-4 h-4" /> Push Live</>}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Save Status Banner */}
            {saveStatus.msg && (
                <div className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 ${saveStatus.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {saveStatus.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {saveStatus.msg}
                </div>
            )}

            {/* ═══ UPLOAD MODE ═══ */}
            {viewMode === "upload" && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center flex flex-col items-center gap-6 max-w-lg">
                        <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center">
                            <FileUp className="w-10 h-10 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Upload Template File</h2>
                            <p className="text-sm text-slate-500">Upload a single <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.html</code> file. The system will automatically split <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;style&gt;</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;script&gt;</code> tags and validate Handlebars syntax.</p>
                        </div>
                        <label className="cursor-pointer">
                            <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                            <div className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                                <Upload className="w-5 h-5" /> Choose .html File
                            </div>
                        </label>
                        <p className="text-xs text-slate-400">See <span className="font-mono">template-upload-rules.md</span> for the Handlebars contract</p>
                    </div>
                </div>
            )}

            {/* ═══ REVIEW MODE ═══ */}
            {viewMode === "review" && (
                <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

                    {/* Left: Validation + Metadata + Code */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 min-h-0">

                        {/* Validation Card */}
                        {validation && (
                            <div className={`p-4 rounded-xl border ${validation.valid ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {validation.valid ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                                    <span className={`font-bold text-sm ${validation.valid ? "text-emerald-700" : "text-red-700"}`}>
                                        {validation.valid ? "All Handlebars checks passed!" : `${validation.errors.length} validation error(s)`}
                                    </span>
                                </div>
                                {validation.errors.length > 0 && (
                                    <ul className="text-xs text-red-600 flex flex-col gap-1 mt-1">
                                        {validation.errors.map((e, i) => <li key={i} className="flex items-start gap-1"><XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />{e}</li>)}
                                    </ul>
                                )}
                                {validation.warnings.length > 0 && (
                                    <ul className="text-xs text-amber-600 flex flex-col gap-1 mt-2">
                                        {validation.warnings.map((w, i) => <li key={i} className="flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />{w}</li>)}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Template Metadata</label>
                                <select value={tier} onChange={(e) => setTier(e.target.value as "basic" | "premium")} className="text-xs border border-slate-200 rounded p-1 font-medium bg-slate-50 outline-none">
                                    <option value="basic">Basic Tier</option>
                                    <option value="premium">Premium Tier</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <input value={templateId} onChange={e => setTemplateId(e.target.value)} placeholder="Template ID (e.g., tm-gold-scroll)" className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium" />
                                <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Display Name" className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium" />
                            </div>
                            <input value={templateDesc} onChange={e => setTemplateDesc(e.target.value)} placeholder="Theme Description..." className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" />
                            <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="Thumbnail URL (optional)" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-slate-500" />
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="font-mono bg-slate-100 px-2 py-1 rounded">{fileName}</span>
                                <span>HTML: {parsedHtml.length} chars</span>
                                <span>CSS: {parsedCss.length} chars</span>
                                {parsedJs && <span>JS: {parsedJs.length} chars</span>}
                            </div>
                        </div>

                        {/* Code Viewer */}
                        <div className="flex-1 flex flex-col min-h-0 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                            <div className="flex items-center bg-slate-950 px-4 py-2 border-b border-slate-800 gap-2">
                                {["html", "css", "js"].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab as "html" | "css" | "js")}
                                        className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${activeTab === tab ? (tab === "html" ? "bg-indigo-500/20 text-indigo-300" : tab === "css" ? "bg-sky-500/20 text-sky-300" : "bg-amber-500/20 text-amber-300") : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
                                        .{tab}
                                    </button>
                                ))}
                                <label className="ml-auto cursor-pointer text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold">
                                    <Upload className="w-3.5 h-3.5" /> Re-upload
                                    <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                                </label>
                            </div>
                            <div className="flex-1 overflow-auto p-4">
                                <pre className={`text-xs font-mono leading-relaxed ${activeTab === "html" ? "text-emerald-300" : activeTab === "css" ? "text-sky-300" : "text-amber-300"}`}>
                                    <code>{activeTab === "html" ? parsedHtml : activeTab === "css" ? parsedCss : parsedJs || "// No JavaScript found in template"}</code>
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="col-span-12 lg:col-span-7 bg-slate-200 border border-slate-300 rounded-2xl shadow-inner relative flex flex-col overflow-hidden">
                        <div className="bg-slate-300 border-b border-slate-400 px-4 py-2 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="bg-slate-200 px-6 py-1 rounded-md text-[10px] font-bold text-slate-500 font-mono border border-slate-300 shadow-sm flex items-center gap-2">
                                <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                                Live Preview (Sample Data from template-config.json)
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                                📋 MOCK DATA
                            </div>
                        </div>

                        <div className="flex-1 relative bg-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex items-center justify-center py-8">
                            {!compiledLiveHtml ? (
                                <div className="flex flex-col items-center gap-4 text-slate-400">
                                    <Code className="w-16 h-16" />
                                    <span className="text-sm font-bold tracking-widest uppercase">Awaiting Template</span>
                                </div>
                            ) : (
                                <div className="w-full max-w-md h-full bg-white rounded-[2.5rem] border-[12px] border-slate-800 shadow-2xl overflow-hidden relative">
                                    <iframe
                                        className="w-full h-full border-none"
                                        srcDoc={compiledLiveHtml}
                                        title="Live Template Preview"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
