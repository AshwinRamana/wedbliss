"use client";

import { useState } from "react";
import { Copy, Code, LayoutTemplate, Play, Save, Trash2, Wand2 } from "lucide-react";

export default function TemplateCreatorPage() {
    // 1. Core State
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [tier, setTier] = useState<"basic" | "premium">("premium");

    // 2. Editor State (The Raw Code from AI)
    const [generatedHtml, setGeneratedHtml] = useState("<!-- AI Generated HTML with Handlebars tags will appear here -->");
    const [generatedCss, setGeneratedCss] = useState("/* AI Generated CSS will appear here */");

    // 3. UI State
    const [activeTab, setActiveTab] = useState<"split" | "html" | "css">("split");

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        // TODO: In actual implementation, this hits an API route that calls @google/genai
        // using the master prompt strategy defined in AI-Template-Forge-Architecture.md

        // Mock generation delay
        setTimeout(() => {
            setGeneratedHtml(`<div class="wedding-wrapper">\n  <header class="hero-section">\n    <h1 class="couple-names">{{couple.groom.firstName}} Weds {{couple.bride.firstName}}</h1>\n    <p class="date">{{events.[0].date}}</p>\n  </header>\n  \n  <!-- Event Loop -->\n  {{#each events}}\n    <section class="event-card">\n      <h2>{{title}}</h2>\n      <p>{{venueName}}</p>\n    </section>\n  {{/each}}\n\n  {{#if gallery}}\n    <section class="gallery">\n      {{#each gallery.images}}\n        <img src="{{this}}" alt="Couple photo" />\n      {{/each}}\n    </section>\n  {{/if}}\n</div>`);

            setGeneratedCss(`.wedding-wrapper {\n  font-family: 'Inter', sans-serif;\n  background: #f8fafc;\n  color: #0f172a;\n  text-align: center;\n}\n\n.hero-section {\n  padding: 100px 20px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  color: white;\n}\n\n.couple-names {\n  font-size: 3rem;\n  font-weight: 800;\n  margin-bottom: 20px;\n}\n\n.event-card {\n  margin: 40px auto;\n  padding: 30px;\n  max-width: 600px;\n  background: white;\n  border-radius: 16px;\n  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\n}\n\n.gallery img {\n  border-radius: 12px;\n  width: 100%;\n  max-width: 300px;\n  margin: 10px;\n}`);
            setIsGenerating(false);
        }, 2500);
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
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors shadow-sm">
                        <Trash2 className="w-4 h-4" /> Clear
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-600/20">
                        <Save className="w-4 h-4" /> Save to DB
                    </button>
                </div>
            </div>

            {/* Main Studio Grid */}
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

                {/* Left Column: Prompt & Code Editor */}
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

                    <hr className="border-slate-100 my-2" />

                    {/* Code Editor Mock */}
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                        <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800">
                            <div className="flex gap-4">
                                <button onClick={() => setActiveTab("split")} className={`text-xs font-bold font-mono transition-colors ${activeTab === 'split' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>SPLIT</button>
                                <button onClick={() => setActiveTab("html")} className={`text-xs font-bold font-mono transition-colors ${activeTab === 'html' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>.HTML</button>
                                <button onClick={() => setActiveTab("css")} className={`text-xs font-bold font-mono transition-colors ${activeTab === 'css' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>.CSS</button>
                            </div>
                            <button className="text-slate-500 hover:text-white transition-colors" title="Copy to clipboard"><Copy className="w-4 h-4" /></button>
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

                    <div className="flex-1 relative bg-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex items-center justify-center p-8">
                        {/* 
                            In the final version, this iframe will receive the Handlebars HTML + test JSON data,
                            compile it in the browser, and inject the styling to preview.
                            For now, we mock the compiled result visually.
                        */}
                        {isGenerating ? (
                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                <LayoutTemplate className="w-16 h-16 animate-pulse" />
                                <span className="text-sm font-bold tracking-widest uppercase">Rendering Preview...</span>
                            </div>
                        ) : generatedHtml.includes("AI Generated") ? (
                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                <Code className="w-16 h-16" />
                                <span className="text-sm font-bold tracking-widest uppercase">Awaiting Prompt</span>
                            </div>
                        ) : (
                            <div className="w-full max-w-sm h-full bg-white rounded-[2rem] border-8 border-slate-800 shadow-2xl overflow-auto relative">
                                <div dangerouslySetInnerHTML={{ __html: `<style>${generatedCss}</style>${generatedHtml}`.replace(/{{couple\.groom\.firstName}}/g, "Karthik").replace(/{{couple\.bride\.firstName}}/g, "Priya").replace(/{{events\.\[0\]\.date}}/g, "28th Feb 2026").replace(/{{title}}/g, "Muhurtham").replace(/{{venueName}}/g, "Sri Murugan Kalyana Mandapam").replace(/{{#each events}}|<\/section>|{{#if gallery}}|{{#each gallery.images}}|{{this}}|{{\/each}}|{{\/if}}/g, "") }} />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
