"use client";

import { useState, useEffect } from "react";
import { Copy, Code, LayoutTemplate, Play, Save, Trash2, Wand2 } from "lucide-react";
import { upsertTemplate } from "@/lib/db";
import Handlebars from "handlebars";

export default function TemplateCreatorPage() {
    // 1. Core State
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [tier, setTier] = useState<"basic" | "premium">("premium");

    // 2. Editor State (The Raw Code from AI)
    const [generatedHtml, setGeneratedHtml] = useState("<!-- AI Generated HTML with Handlebars tags will appear here -->");
    const [generatedCss, setGeneratedCss] = useState("/* AI Generated CSS will appear here */");
    const [compiledLiveHtml, setCompiledLiveHtml] = useState("");

    // 3. Metadata State (For DB Save)
    const [templateId, setTemplateId] = useState("");
    const [templateName, setTemplateName] = useState("");
    const [templateDesc, setTemplateDesc] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null, msg: string }>({ type: null, msg: "" });

    // 4. UI State
    const [activeTab, setActiveTab] = useState<"split" | "html" | "css">("split");

    // Dummy JSON Data matching Universal Schema for Live Preview
    const dummyData = {
        couple: {
            bride: { firstName: "Priya" },
            groom: { firstName: "Karthik" },
            parents: "D/o Kamakshi & Krishnaswamy | S/o Saraswathi & Ramasamy"
        },
        events: [
            {
                id: "ev-1",
                title: "Muhurtham",
                date: "28 February 2026",
                time: "8:24 AM - 10:48 AM",
                venueName: "Sri Murugan Kalyana Mandapam",
                googleMapsUrl: "https://maps.google.com"
            }
        ],
        gallery: {
            images: [
                "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
            ]
        },
        media: {
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        rsvp: {
            enabled: true,
            whatsappNumber: "+919876543210"
        }
    };

    // Live Compilation Effect
    useEffect(() => {
        if (!generatedHtml || generatedHtml.includes("<!-- AI Generated")) {
            setCompiledLiveHtml("");
            return;
        }
        try {
            const template = Handlebars.compile(generatedHtml);
            const resolvedHtml = template(dummyData);
            setCompiledLiveHtml(`<style>${generatedCss}</style>${resolvedHtml}`);
        } catch (e) {
            console.error("Handlebars compilation error:", e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generatedHtml, generatedCss]);


    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setSaveStatus({ type: null, msg: "" });

        try {
            const res = await fetch("/api/admin/generate-template", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, tier })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Generation API failed");
            }

            const data = await res.json();
            setGeneratedHtml(data.html);
            setGeneratedCss(data.css);

            // Auto-fill template metadata if empty
            if (!templateName) setTemplateName("AI Generated Theme");
            if (!templateDesc) setTemplateDesc(prompt.substring(0, 50) + "...");
            if (!templateId) setTemplateId(`tm-ai-${Date.now().toString().slice(-6)}`);

        } catch (error: unknown) {
            alert(`Generation Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveToDB = async () => {
        if (!templateId || !templateName) {
            alert("Template ID and Display Name are required");
            return;
        }
        if (generatedHtml.includes("<!-- AI Generated")) {
            alert("Please generate a template first before saving.");
            return;
        }

        setIsSaving(true);
        setSaveStatus({ type: null, msg: "" });

        const { error } = await upsertTemplate({
            id: templateId,
            name: templateName,
            tier: tier,
            description: templateDesc,
            is_live: false, // Default to coming soon so it can be reviewed in manager
            is_hero: false,
            html_content: generatedHtml,
            css_content: generatedCss,
            demo_url: null,
            thumbnail_url: null,
        });

        setIsSaving(false);
        if (error) {
            setSaveStatus({ type: "error", msg: error });
        } else {
            setSaveStatus({ type: "success", msg: "Successfully pushed to Database!" });
        }
    };

    const handleClear = () => {
        setPrompt("");
        setGeneratedHtml("<!-- AI Generated HTML with Handlebars tags will appear here -->");
        setGeneratedCss("/* AI Generated CSS will appear here */");
        setCompiledLiveHtml("");
        setSaveStatus({ type: null, msg: "" });
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-80px)]">
            <div className="flex justify-between items-end flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-indigo-600" />
                        AI Template Studio
                    </h1>
                    <p className="text-slate-500 mt-1">Generate new Handlebars-compatible HTML/CSS using Gemini.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors shadow-sm">
                        <Trash2 className="w-4 h-4" /> Clear
                    </button>
                    <button onClick={handleSaveToDB} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-600/20">
                        {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save to DB</>}
                    </button>
                </div>
            </div>

            {/* Main Studio Grid */}
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

                {/* Left Column: Prompt, Metadata & Code Editor */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">

                    {/* Prompt Box */}
                    <div className="flex flex-col gap-3 flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base Skeleton Injection</label>
                            <select
                                value={tier}
                                onChange={(e) => setTier(e.target.value as "basic" | "premium")}
                                className="text-xs border border-slate-200 rounded p-1 font-medium bg-slate-50 outline-none">
                                <option value="basic">base-basic.html</option>
                                <option value="premium">base-premium.html</option>
                            </select>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Make this look like a sunset beach scene with orange and yellow gradients. Use serif fonts for headings. Animate the event cards sliding up."
                            className="w-full h-32 p-3 text-sm border border-indigo-200 bg-indigo-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium placeholder:text-slate-400"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                            {isGenerating ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating Code...</>
                            ) : (
                                <><Wand2 className="w-5 h-5" /> Generate Design</>
                            )}
                        </button>
                    </div>

                    <hr className="border-slate-100 my-1" />

                    {/* DB Metadata Mapping */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Database Map Details</label>
                        <div className="flex gap-2">
                            <input value={templateId} onChange={e => setTemplateId(e.target.value)} placeholder="Template ID (tm-theme)" className="flex-1 text-xs border border-slate-200 rounded px-2 py-1.5 outline-none" />
                            <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Display Name" className="flex-1 text-xs border border-slate-200 rounded px-2 py-1.5 outline-none" />
                        </div>
                        <input value={templateDesc} onChange={e => setTemplateDesc(e.target.value)} placeholder="Short Description..." className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none" />
                        {saveStatus.msg && (
                            <div className={`text-xs font-bold mt-1 ${saveStatus.type === "success" ? "text-emerald-600" : "text-red-500"}`}>{saveStatus.msg}</div>
                        )}
                    </div>

                    <hr className="border-slate-100 my-1" />

                    {/* Code Editor */}
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800">
                            <div className="flex gap-4">
                                <button onClick={() => setActiveTab("split")} className={`text-xs font-bold font-mono transition-colors ${activeTab === 'split' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>SPLIT</button>
                                <button onClick={() => setActiveTab("html")} className={`text-xs font-bold font-mono transition-colors ${activeTab === 'html' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>.HTML</button>
                                <button onClick={() => setActiveTab("css")} className={`text-xs font-bold font-mono transition-colors ${activeTab === 'css' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>.CSS</button>
                            </div>
                            <button onClick={() => navigator.clipboard.writeText(activeTab === 'css' ? generatedCss : generatedHtml)} className="text-slate-500 hover:text-white transition-colors" title="Copy to clipboard"><Copy className="w-4 h-4" /></button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed">
                            {activeTab === 'html' && (
                                <pre className="text-emerald-300"><code>{generatedHtml}</code></pre>
                            )}
                            {activeTab === 'css' && (
                                <pre className="text-sky-300"><code>{generatedCss}</code></pre>
                            )}
                            {activeTab === 'split' && (
                                <div className="flex flex-col gap-6 h-full">
                                    <div className="flex-1 min-h-0 flex flex-col">
                                        <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-2 inline-block">HTML Handlebars Skeleton</span>
                                        <div className="flex-1 overflow-auto bg-slate-950/50 p-3 rounded-lg border border-slate-800"><pre className="text-emerald-300/80"><code>{generatedHtml}</code></pre></div>
                                    </div>
                                    <div className="flex-1 min-h-0 flex flex-col">
                                        <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-2 inline-block">CSS Styling</span>
                                        <div className="flex-1 overflow-auto bg-slate-950/50 p-3 rounded-lg border border-slate-800"><pre className="text-sky-300/80"><code>{generatedCss}</code></pre></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Iframe Preview */}
                <div className="col-span-12 lg:col-span-7 bg-slate-200 border border-slate-300 rounded-2xl shadow-inner relative flex flex-col overflow-hidden">
                    <div className="bg-slate-300 border-b border-slate-400 px-4 py-2 flex items-center justify-center gap-2 relative">
                        <div className="absolute left-4 flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                        </div>
                        <div className="bg-slate-200 px-32 py-1 rounded-md text-[10px] font-bold text-slate-500 font-mono border border-slate-300 shadow-sm flex items-center gap-2">
                            <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                            Live Handlebars Compilation Engine
                        </div>
                    </div>

                    <div className="flex-1 relative bg-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex items-center justify-center py-8">
                        {isGenerating ? (
                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                <LayoutTemplate className="w-16 h-16 animate-pulse" />
                                <span className="text-sm font-bold tracking-widest uppercase">Consulting Gemini Stylist...</span>
                            </div>
                        ) : !compiledLiveHtml ? (
                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                <Code className="w-16 h-16" />
                                <span className="text-sm font-bold tracking-widest uppercase">Awaiting Prompt</span>
                            </div>
                        ) : (
                            <div className="w-full max-w-md h-full bg-white rounded-[2.5rem] border-[12px] border-slate-800 shadow-2xl overflow-hidden relative">
                                <iframe
                                    className="w-full h-full border-none"
                                    srcDoc={compiledLiveHtml}
                                    title="Live AI Preview"
                                />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
