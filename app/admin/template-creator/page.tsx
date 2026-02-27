"use client";

import { useState, useEffect } from "react";
import { Copy, Code, LayoutTemplate, Play, Save, Trash2, Wand2 } from "lucide-react";
import { upsertTemplate } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
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
            // Initialize Client-Side AI with strict local public API Key
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

            // Hardcode base skeletons since we cannot access local fs from browser
            const baseBasic = `<!-- 
  WEDBLISS BASIC AI BASE SKELETON
  Theme: Generic Structured Events (No Premium arrays like Gallery/Video/RSVP)
  Required AI Handling: MUST retain all Handlebars tags and structural IDs.
-->
<div id="wedbliss-basic-wrapper" class="wb-theme-container wb-basic">

    <!-- 1. Envelope Cover / Hero -->
    <section id="cover-reveal" class="wb-section wb-hero">
        <div class="wb-envelope-anim">
            <h1 class="wb-title">{{couple.groom.firstName}} &amp; {{couple.bride.firstName}}</h1>
            <p class="wb-subtitle">Are getting married</p>
        </div>
    </section>

    <!-- 2. Inside Details -->
    <section id="details" class="wb-section wb-details">
        <div class="wb-parents-note">
            <p>{{couple.parents}}</p>
            <p>Invite you to celebrate the wedding of their children</p>
            <h2>{{couple.groom.firstName}} <span class="wb-amp">&amp;</span> {{couple.bride.firstName}}</h2>
        </div>
    </section>

    <!-- 3. Event Loop -->
    <section id="events" class="wb-section wb-events">
        {{#each events}}
        <div class="wb-event-card" id="event-{{id}}">
            <h3 class="wb-event-title">{{title}}</h3>
            <p class="wb-event-datetime">{{date}} | {{time}}</p>
            <p class="wb-event-venue">{{venueName}}</p>

            <div class="wb-event-actions">
                {{#if googleMapsUrl}}
                <a href="{{googleMapsUrl}}" target="_blank" class="wb-btn wb-btn-map">View on Map</a>
                {{/if}}
                <button class="wb-btn wb-btn-cal">Add to Calendar</button>
            </div>
        </div>
        {{/each}}
    </section>

    <!-- 4. Countdown to earliest event -->
    <section id="countdown" class="wb-section wb-countdown">
        <h3 class="wb-countdown-title">The Celebration Begins In</h3>
        <div class="wb-cd-grid" id="cd-timer">
            <div class="wb-cd-box"><span id="cd-days">00</span><small>Days</small></div>
            <div class="wb-cd-box"><span id="cd-hours">00</span><small>Hrs</small></div>
            <div class="wb-cd-box"><span id="cd-mins">00</span><small>Min</small></div>
        </div>
    </section>

    <!-- Note: Basic templates do not include Gallery, Video Story, or WhatsApp RSVP. -->
</div>`;

            const basePremium = `<!-- 
  WEDBLISS PREMIUM AI BASE SKELETON
   Theme: Generic Structured Events
   Required AI Handling: MUST retain all Handlebars tags and structural IDs.
 -->
 <div id="wedbliss-premium-wrapper" class="wb-theme-container">
 
   <!-- 1. Envelope Cover / Hero -->
   <section id="cover-reveal" class="wb-section wb-hero">
     <div class="wb-envelope-anim">
       <h1 class="wb-title">{{couple.groom.firstName}} &amp; {{couple.bride.firstName}}</h1>
       <p class="wb-subtitle">Are getting married</p>
     </div>
   </section>
 
   <!-- 2. Inside Details -->
   <section id="details" class="wb-section wb-details">
     <div class="wb-parents-note">
       <p>{{couple.parents}}</p>
       <p>Invite you to celebrate the wedding of their children</p>
       <h2>{{couple.groom.firstName}} <span class="wb-amp">&amp;</span> {{couple.bride.firstName}}</h2>
     </div>
   </section>
 
   <!-- 3. Event Loop (Map & Calendar logic included) -->
   <section id="events" class="wb-section wb-events">
     {{#each events}}
     <div class="wb-event-card" id="event-{{id}}">
       <h3 class="wb-event-title">{{title}}</h3>
       <p class="wb-event-datetime">{{date}} | {{time}}</p>
       <p class="wb-event-venue">{{venueName}}</p>
       
       <div class="wb-event-actions">
         {{#if googleMapsUrl}}
         <a href="{{googleMapsUrl}}" target="_blank" class="wb-btn wb-btn-map">View on Map</a>
         {{/if}}
         <!-- Note to AI: you can style this button, do not alter its class or data attributes if present -->
         <button class="wb-btn wb-btn-cal">Add to Calendar</button>
       </div>
     </div>
     {{/each}}
   </section>
 
   <!-- 4. Countdown to earliest event -->
   <section id="countdown" class="wb-section wb-countdown">
     <h3 class="wb-countdown-title">The Celebration Begins In</h3>
     <div class="wb-cd-grid" id="cd-timer">
       <div class="wb-cd-box"><span id="cd-days">00</span><small>Days</small></div>
       <div class="wb-cd-box"><span id="cd-hours">00</span><small>Hrs</small></div>
       <div class="wb-cd-box"><span id="cd-mins">00</span><small>Min</small></div>
     </div>
   </section>
 
   <!-- 5. Photo Gallery (Premium only) -->
   {{#if gallery.images}}
   <section id="gallery" class="wb-section wb-gallery">
     <h3 class="wb-gallery-title">Capturing Our Moments</h3>
     <div class="wb-gallery-grid">
       {{#each gallery.images}}
         <img src="{{this}}" alt="Couple Moment" class="wb-gallery-img" />
       {{/each}}
     </div>
   </section>
   {{/if}}
 
   <!-- 6. Hear it from the couple / Video -->
   {{#if media.videoUrl}}
   <section id="our-story" class="wb-section wb-story">
     <h3 class="wb-story-title">Hear From Us</h3>
     <div class="wb-video-wrapper">
        <iframe src="{{media.videoUrl}}" allowfullscreen class="wb-video-embed"></iframe>
     </div>
   </section>
   {{/if}}
 
   <!-- 7. Interested / RSVP Form -->
   {{#if rsvp.enabled}}
   <section id="rsvp" class="wb-section wb-rsvp">
     <h3 class="wb-rsvp-title">We'd love your presence</h3>
     <div class="wb-rsvp-form">
       <!-- Note to AI: Do not change the form logic -->
       <a href="https://wa.me/{{rsvp.whatsappNumber}}?text=Hi!%20I%20will%20be%20attending%20the%20wedding!" target="_blank" class="wb-btn wb-btn-rsvp">
         RSVP on WhatsApp
       </a>
     </div>
   </section>
   {{/if}}
 
 </div>`;

            const systemInstruction = `
You are the Wedbliss AI Template Stylist, an expert UI/UX developer. 
I will provide you with a 'Golden Base HTML Skeleton' that uses Handlebars {{tags}} for dynamic data.
Your job is to completely redesign the aesthetics—colors, fonts, layout styling, CSS animations, and SVG decorative elements according to the user's prompt. 

CRITICAL RULES:
1. You MUST keep every single Handlebars {{tag}} exactly as it is. Do not alter, delete, or hallucinate new tags.
2. You MUST keep the section order exactly the same as the Golden Base.
3. You MUST keep the core HTML IDs intact for Javascript logic (like id="cd-days" for the countdown).
4. You must write responsive Vanilla CSS and inline SVGs/Base64. Do not use external CSS frameworks.
5. You must return your response cleanly. Start your HTML response with <html-response> and end it with </html-response>. Start your CSS response with <css-response> and end it with </css-response>. Include NOTHING else.`;

            const userPrompt = `
Here is the raw Base HTML Skeleton:
\`\`\`html
${tier === 'basic' ? baseBasic : basePremium}
\`\`\`

Here is the User's Design Request:
"""
${prompt}
"""

Now, redesign and output the modified HTML inside <html-response> tags, and the completely new raw CSS inside <css-response> tags. Output nothing else.
`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                }
            });

            const textOutput = response.text || "<!-- No text returned from model -->";

            const htmlMatch = textOutput.match(/<html-response>([\s\S]*?)<\/html-response>/);
            const cssMatch = textOutput.match(/<css-response>([\s\S]*?)<\/css-response>/);

            let finalHtml = htmlMatch ? htmlMatch[1].trim() : textOutput;
            let finalCss = cssMatch ? cssMatch[1].trim() : "/* Failed to extract pure CSS */";

            if (finalHtml.startsWith("\`\`\`html")) {
                finalHtml = finalHtml.replace(/\`\`\`html/g, "").replace(/\`\`\`/g, "").trim();
            }
            if (finalCss.startsWith("\`\`\`css")) {
                finalCss = finalCss.replace(/\`\`\`css/g, "").replace(/\`\`\`/g, "").trim();
            }

            setGeneratedHtml(finalHtml);
            setGeneratedCss(finalCss);

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
