"use client";

import { useState, useEffect } from "react";
import { Upload, Play, Save, Trash2, Code, CheckCircle, XCircle, Eye, FileUp, AlertTriangle } from "lucide-react";
import { upsertTemplate } from "@/lib/db";
// @ts-expect-error - missing declaration file
import Handlebars from "handlebars/dist/handlebars";
// ─────────────────────────────────────────────────────────────────────────────
// Sample data for live preview (Initial State)
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_SAMPLE_DATA = `{
  "couple": {
    "bride": { "firstName": "Priya", "fatherName": "Krishnaswamy", "motherName": "Kamakshi", "notes": "Can't wait to start this beautiful journey together!" },
    "groom": { "firstName": "Karthik", "fatherName": "Ramasamy", "motherName": "Saraswathi", "notes": "Forever and always, my love." }
  },
  "events": [
    { "id": "ev-1", "title": "Muhurtham", "date": "28 December 2026", "startTime": "8:24 AM", "endTime": "10:48 AM", "venueName": "Sri Murugan Kalyana Mandapam", "googleMapsUrl": "https://maps.google.com/?q=Sri+Murugan+Kalyana+Mandapam" },
    { "id": "ev-2", "title": "Reception", "date": "28 December 2026", "startTime": "6:00 PM", "endTime": "10:00 PM", "venueName": "Grand Ballroom, Hotel Savera", "googleMapsUrl": "https://maps.google.com/?q=Hotel+Savera+Chennai" }
  ],
  "gallery": { "images": [
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500", 
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=500"
  ] },
  "media": { "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ" }
}`;

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Parse a single .html file into html_content, css_content, js_content
// ─────────────────────────────────────────────────────────────────────────────
function parseTemplateFile(rawHtml: string): { html: string; css: string; js: string } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    // Extract inline <style> blocks
    const styleNodes = doc.querySelectorAll("style");
    let css = "";
    styleNodes.forEach((node) => {
        css += node.textContent + "\n";
        node.remove();
    });

    // Extract inline <script> blocks (ignores external CDNs and tailwind configs)
    const scriptNodes = doc.querySelectorAll("script:not([src]):not([id='tailwind-config'])");
    let js = "";
    scriptNodes.forEach((node) => {
        js += node.textContent + "\n";
        node.remove();
    });

    // We must preserve remaining <head> tags like <link href="..."> and <script src="...">
    // so the final template retains its Google Fonts, FontAwesome, and Tailwind CDNs.
    const headHtml = doc.head.innerHTML.trim();
    const bodyHtml = doc.body.innerHTML.trim();

    const html = `${headHtml}\n${bodyHtml}`.trim();

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
        Handlebars.registerHelper("add", function (a: string | number, b: string | number) {
            return parseInt(a as string, 10) + parseInt(b as string, 10);
        });
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

    // ── Demo Push State ──
    const [isDemoPushing, setIsDemoPushing] = useState(false);
    const [demoStatus, setDemoStatus] = useState<{ type: "success" | "error" | null; msg: string }>({ type: null, msg: "" });

    // ── Active Tab ──
    const [activeTab, setActiveTab] = useState<"html" | "css" | "js" | "json">("html");

    // ── JSON Sample Data (also used as Demo mock data) ──
    const [sampleDataJson, setSampleDataJson] = useState(INITIAL_SAMPLE_DATA);

    // ── Workflow Mode ──
    const [workflowMode, setWorkflowMode] = useState<"choose" | "demo" | "live">("choose");

    // ── View Mode ──  
    const [viewMode, setViewMode] = useState<"upload" | "review">("upload");

    const [pastedHtmlInput, setPastedHtmlInput] = useState("");

    // ── Live Subdomain State ──
    const [liveSubdomain, setLiveSubdomain] = useState("");
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);

    const checkSubdomainAvailability = async () => {
        if (!liveSubdomain || liveSubdomain.length < 3) return;
        setIsCheckingDomain(true);
        setDomainAvailable(null);
        try {
            // Reusing existing domain check API
            const apiBase = 'https://api.wedbliss.co';
            const res = await fetch(`${apiBase}/api/domains/check?subdomain=${liveSubdomain}`);
            const json = await res.json();
            setDomainAvailable(json.available);
        } catch (e) {
            console.error("Domain check failed:", e);
        } finally {
            setIsCheckingDomain(false);
        }
    };

    // ── Paste HTML Handler ──
    const handlePasteHtml = () => {
        if (!pastedHtmlInput.trim()) {
            alert("No HTML pasted.");
            return;
        }
        setFileName("pasted_code.html");

        // Parse the code
        const { html, css, js } = parseTemplateFile(pastedHtmlInput);
        setParsedHtml(html);
        setParsedCss(css);
        setParsedJs(js);

        // Validate
        const result = validateHandlebars(html);
        setValidation(result);

        if (!templateId) {
            setTemplateId(workflowMode === "demo" ? "tm-demo-" + Date.now() : "tm-pasted-" + Date.now());
        }
        setViewMode("review");
    };

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
                setTemplateId(workflowMode === "demo" ? `tm-demo-${Date.now()}` : `tm-${slug}`);
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
            Handlebars.registerHelper("add", function (a: string | number, b: string | number) {
                return parseInt(a as string, 10) + parseInt(b as string, 10);
            });
            const template = Handlebars.compile(parsedHtml);
            let parsedData = {};
            try {
                parsedData = JSON.parse(sampleDataJson);
            } catch (jsonErr) {
                setCompiledLiveHtml(`<div style="padding:2rem;color:red;font-family:monospace;"><b>JSON Format Error:</b><br/>${String(jsonErr)}</div>`);
                return;
            }

            const resolvedHtml = template(parsedData);
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
    }, [parsedHtml, parsedCss, sampleDataJson]);

    // ── Push to Demo Handler ──
    // Saves template as draft + points elegant.wedbliss.co at it with mock data
    const handlePushToDemo = async () => {
        if (!templateId || !parsedHtml) {
            alert("Template ID and HTML content are required. Parse your HTML first.");
            return;
        }

        let parsedData: Record<string, unknown> = {};
        try {
            parsedData = JSON.parse(sampleDataJson);
        } catch {
            alert("Mock data JSON is invalid. Fix it in the .json tab first.");
            return;
        }

        setIsDemoPushing(true);
        setDemoStatus({ type: null, msg: "" });

        const fullDomain = `elegant.wedbliss.co`;

        try {
            // Always hit the live Express API
            const apiBase = 'https://api.wedbliss.co';
            const res = await fetch(`${apiBase}/api/admin/push-demo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId,
                    templateName: templateName || templateId,
                    tier,
                    templateDesc,
                    htmlContent: parsedHtml,
                    cssContent: parsedCss,
                    jsContent: parsedJs || null,
                    thumbnailUrl: thumbnailUrl || null,
                    mockData: parsedData,
                    // Subdomain is locked to elegant in backend helper now, but we'll be explicit
                    subdomain: "elegant",
                }),
            });

            const text = await res.text();
            let json: Record<string, unknown> = {};
            try { json = JSON.parse(text); } catch {
                setDemoStatus({ type: "error", msg: `Server returned non-JSON (status ${res.status}): ${text.slice(0, 120)}` });
                return;
            }

            if (!res.ok || !json.ok) {
                setDemoStatus({ type: "error", msg: (json.error as string) || "Push to Demo failed." });
                return;
            }

            setDemoStatus({ type: "success", msg: `✓ Demo updated on ${fullDomain}` });
            window.open(`https://${fullDomain}`, "_blank");
        } catch (e: unknown) {
            setDemoStatus({ type: "error", msg: e instanceof Error ? e.message : "Network error." });
        } finally {
            setIsDemoPushing(false);
        }
    };

    // ── Save Handler (Draft or Push Live) ──
    const handleSave = async (pushLive: boolean) => {
        if (!templateId || !templateName) {
            alert("Template ID and Display Name are required.");
            return;
        }
        if (!parsedHtml) {
            alert("No template content. Please upload an HTML file first.");
            return;
        }
        if (pushLive && (!liveSubdomain || liveSubdomain.length < 3)) {
            alert("Live subdomain is required for Push Live.");
            return;
        }
        if (pushLive && validation && !validation.valid) {
            alert("Cannot push live — template has validation errors. Fix them first.");
            return;
        }

        setIsSaving(true);
        setSaveStatus({ type: null, msg: "" });

        if (pushLive) {
            try {
                const apiBase = 'https://api.wedbliss.co';
                const res = await fetch(`${apiBase}/api/admin/push-live`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        templateId, templateName, tier, templateDesc,
                        htmlContent: parsedHtml, cssContent: parsedCss, jsContent: parsedJs || null,
                        thumbnailUrl: thumbnailUrl || null, mockData: JSON.parse(sampleDataJson),
                        subdomain: liveSubdomain
                    }),
                });
                const json = await res.json();
                if (!res.ok || !json.ok) throw new Error(json.error || "Push Live failed");

                setSaveStatus({ type: "success", msg: `✓ Template is LIVE on ${liveSubdomain}.wedbliss.co!` });
                window.open(`https://${liveSubdomain}.wedbliss.co`, "_blank");
            } catch (e: any) {
                setSaveStatus({ type: "error", msg: `Push Live Error: ${e.message}` });
            } finally {
                setIsSaving(false);
            }
            return;
        }

        // Just regular draft save
        const { error } = await upsertTemplate({
            id: templateId,
            name: templateName,
            tier,
            description: templateDesc,
            is_live: false,
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
            setSaveStatus({ type: "success", msg: "✓ Saved as Draft (not visible to users yet)" });
        }
    };

    // ── Clear/Reset ──
    const handleClear = () => {
        if (!confirm("Clear everything and start over?")) return;
        setFileName(""); setParsedHtml(""); setParsedCss(""); setParsedJs("");
        setValidation(null); setCompiledLiveHtml(""); setViewMode("upload");
        setSaveStatus({ type: null, msg: "" }); setWorkflowMode("choose");
        setPastedHtmlInput("");
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
                            {workflowMode === "demo" ? (
                                <button
                                    onClick={handlePushToDemo}
                                    disabled={isDemoPushing || !parsedHtml || !templateId}
                                    title="Quick preview on elegant.wedbliss.co"
                                    className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-lg shadow-violet-600/20"
                                >
                                    {isDemoPushing
                                        ? <span className="animate-pulse">Deploying...</span>
                                        : <><Play className="w-4 h-4" /> Push to Demo</>}
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => handleSave(false)} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-sm">
                                        {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save as Draft</>}
                                    </button>
                                    <button onClick={() => handleSave(true)} disabled={isSaving || (validation !== null && !validation.valid)} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-600/20">
                                        {isSaving ? <span className="animate-pulse">Pushing...</span> : <><Eye className="w-4 h-4" /> Push Live</>}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Demo Status Banner */}
            {demoStatus.msg && (
                <div className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 justify-between ${demoStatus.type === "success" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    <div className="flex items-center gap-2">
                        {demoStatus.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {demoStatus.msg}
                    </div>
                    {demoStatus.type === "success" && (
                        <a href={`https://elegant.wedbliss.co`} target="_blank" rel="noopener noreferrer"
                            className="underline underline-offset-2 text-violet-600 hover:text-violet-800 font-bold text-xs tracking-widest uppercase">
                            Open → elegant.wedbliss.co
                        </a>
                    )}
                </div>
            )}

            {/* Save Status Banner */}
            {saveStatus.msg && (
                <div className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 ${saveStatus.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {saveStatus.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {saveStatus.msg}
                </div>
            )}

            {/* ═══ CHOOSE MODE ═══ */}
            {workflowMode === "choose" && (
                <div className="flex-1 flex flex-col items-center justify-center py-10">
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
                        {/* Demo Mode Card */}
                        <button 
                            onClick={() => setWorkflowMode("demo")}
                            className="group flex flex-col items-center p-8 bg-white border-2 border-slate-200 hover:border-violet-500 rounded-3xl transition-all hover:shadow-2xl hover:shadow-violet-500/10 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-violet-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Push to Demo</h2>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Quick preview on <b>elegant.wedbliss.co</b>.<br/> 
                                No metadata required. Perfect for testing tags.
                            </p>
                            <div className="mt-8 px-6 py-2 bg-violet-600 text-white font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                Select Demo
                            </div>
                        </button>

                        {/* Live Mode Card */}
                        <button 
                            onClick={() => setWorkflowMode("live")}
                            className="group flex flex-col items-center p-8 bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl transition-all hover:shadow-2xl hover:shadow-emerald-500/10 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Eye className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Push to Live</h2>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Deploy a permanent template.<br/>
                                Requires ID, metadata, and custom subdomain.
                            </p>
                            <div className="mt-8 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                Select Live Path
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ UPLOAD MODE ═══ */}
            {workflowMode !== "choose" && viewMode === "upload" && (
                <div className="flex-1 flex flex-col gap-6 min-h-0">
                    <button 
                        onClick={() => setWorkflowMode("choose")}
                        className="self-start text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                    >
                        ← Back to Mode Selection
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-center flex-1 py-2">

                    {/* Left box: File Upload */}
                    <div className="flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 border-dashed p-10 hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
                        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                            <FileUp className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Upload {workflowMode === "demo" ? "Demo" : "Live"} HTML File</h2>
                        <p className="text-sm text-slate-500 max-w-xs mb-8">Upload a single <code className="bg-slate-100 px-1 rounded text-xs font-mono">.html</code> file. We auto-split CSS/JS.</p>
                        <label className="cursor-pointer">
                            <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                            <div className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                                <Upload className="w-5 h-5" /> Choose File
                            </div>
                        </label>
                    </div>

                    {/* Right box: Paste HTML */}
                    <div className="flex flex-col relative bg-white rounded-3xl border border-slate-200 border-dashed p-6 hover:border-slate-300 transition-colors overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Code className="w-4 h-4" /> Or Paste Raw HTML
                            </h2>
                            <button
                                onClick={handlePasteHtml}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors shadow-md">
                                Parse & Preview
                            </button>
                        </div>
                        <textarea
                            value={pastedHtmlInput}
                            onChange={(e) => setPastedHtmlInput(e.target.value)}
                            placeholder={'<!DOCTYPE html>\n<html>\n  <head><style>...</style></head>\n  <body>\n    <h1>{{couple.bride.firstName}}</h1>\n  </body>\n</html>'}
                            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-600 outline-none focus:border-indigo-400 resize-none shadow-inner"
                            spellCheck={false}
                        />
                    </div>
                </div>
            )}

            {/* ═══ REVIEW MODE ═══ */}
            {workflowMode !== "choose" && viewMode === "review" && (
                <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 relative">
                    {/* Floating Back Button */}
                    <button 
                        onClick={() => { setViewMode("upload"); if (confirm("Go back and change mode?")) setWorkflowMode("choose"); }}
                        className="absolute -top-10 left-0 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                    >
                        ← Back to Upload
                    </button>

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

                        {/* Metadata - ONLY in LIVE mode */}
                        {workflowMode === "live" ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
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
                                
                                {/* Live Subdomain Section */}
                                <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Subdomain</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input 
                                                value={liveSubdomain} 
                                                onChange={e => {
                                                    setLiveSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                                                    setDomainAvailable(null);
                                                }} 
                                                placeholder="noir" 
                                                className={`w-full text-sm border ${domainAvailable === true ? 'border-emerald-200 bg-emerald-50' : domainAvailable === false ? 'border-red-200 bg-red-50' : 'border-slate-200'} rounded-lg pl-3 pr-24 py-2 outline-none focus:border-indigo-500 font-mono`} 
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">.wedbliss.co</span>
                                        </div>
                                        <button 
                                            onClick={checkSubdomainAvailability}
                                            disabled={isCheckingDomain || liveSubdomain.length < 3}
                                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                                        >
                                            {isCheckingDomain ? "⏳" : "Check"}
                                        </button>
                                    </div>
                                    {domainAvailable === false && <p className="text-[10px] text-red-500 font-bold ml-1">Already taken — will overwrite if pushed.</p>}
                                    {domainAvailable === true && <p className="text-[10px] text-emerald-600 font-bold ml-1">Available!</p>}
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
                        ) : (
                            <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 flex flex-col gap-1 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
                                <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Demo Target</label>
                                <div className="flex items-center gap-2 text-violet-700">
                                    <Play className="w-4 h-4" />
                                    <span className="font-bold text-sm">elegant.wedbliss.co</span>
                                    <span className="text-[10px] bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full font-bold ml-auto uppercase tracking-tighter">Fixed for Preview</span>
                                </div>
                                <p className="text-[10px] text-violet-400 mt-1 italic">Quick deployment path. Metadata is skipped.</p>
                            </div>
                        )}

                        {/* Code Viewer */}
                        <div className="flex-1 flex flex-col min-h-0 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                            <div className="flex items-center bg-slate-950 px-4 py-2 border-b border-slate-800 gap-2">
                                {["json", "html", "css", "js"].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab as "html" | "css" | "js" | "json")}
                                        className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${activeTab === tab ? (tab === "json" ? "bg-purple-500/20 text-purple-300" : tab === "html" ? "bg-indigo-500/20 text-indigo-300" : tab === "css" ? "bg-sky-500/20 text-sky-300" : "bg-amber-500/20 text-amber-300") : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
                                        .{tab}
                                    </button>
                                ))}
                                <label className="ml-auto cursor-pointer text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold">
                                    <Upload className="w-3.5 h-3.5" /> Re-upload
                                    <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                                </label>
                            </div>
                            <div className="flex-1 overflow-auto p-4 flex flex-col">
                                {activeTab === "json" ? (
                                    <div className="flex-1 flex flex-col">
                                        <p className="text-slate-400 text-[10px] mb-2 font-sans tracking-wide">
                                            Edit mock data below — used for Live Preview <span className="text-violet-400 font-bold">and</span> as the data pushed to <span className="text-violet-400 font-bold">elegant.wedbliss.co</span> when you click <span className="text-violet-400 font-bold">Push to Demo</span>. Includes couple names, events, gallery images, and video URL.
                                        </p>
                                        <textarea
                                            value={sampleDataJson}
                                            onChange={(e) => setSampleDataJson(e.target.value)}
                                            className="flex-1 w-full bg-transparent text-purple-300 outline-none resize-none text-xs font-mono"
                                            spellCheck={false}
                                        />
                                    </div>
                                ) : (
                                    <pre className={`text-xs font-mono leading-relaxed ${activeTab === "html" ? "text-emerald-300" : activeTab === "css" ? "text-sky-300" : "text-amber-300"}`}>
                                        <code>{activeTab === "html" ? parsedHtml : activeTab === "css" ? parsedCss : parsedJs || "// No JavaScript found in template"}</code>
                                    </pre>
                                )}
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
