import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
    // Initialize inside the handler so it doesn't break Next.js build-time prerendering
    const ai = new GoogleGenAI({});

    try {
        const body = await req.json();
        const { prompt, tier } = body;

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json({ error: "Missing or invalid prompt string." }, { status: 400 });
        }

        // Ensure only 'basic' or 'premium' are requested
        const sanitizedTier = tier === "basic" ? "basic" : "premium";

        // Read the requested Golden Base Skeleton HTML directly from our file system
        const baseHtmlPath = path.join(process.cwd(), "template", "bases", `base-${sanitizedTier}.html`);
        let baseHtmlString = "";

        try {
            baseHtmlString = await fs.readFile(baseHtmlPath, "utf-8");
        } catch (e) {
            console.error("Failed to read gold base template file:", e);
            return NextResponse.json({ error: "Internal error reading base template skeleton." }, { status: 500 });
        }

        // --- 5. The Google Gemini API Master System Instruction --- //
        // From AI-Template-Forge-Architecture.md
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
${baseHtmlString}
\`\`\`

Here is the User's Design Request:
"""
${prompt}
"""

Now, redesign and output the modified HTML inside <html-response> tags, and the completely new raw CSS inside <css-response> tags. Output nothing else.
`;

        // Generate Content with the recommended structured format
        // Use gemini-2.5-flash as the default fast/capable model
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7, // Add slight creativity but keep structure
            }
        });

        const textOutput = response.text || "<!-- No text returned from model -->";

        // Very basic XML extraction using regex because Gemini usually honors the specific tags
        const htmlMatch = textOutput.match(/<html-response>([\s\S]*?)<\/html-response>/);
        const cssMatch = textOutput.match(/<css-response>([\s\S]*?)<\/css-response>/);

        let finalHtml = htmlMatch ? htmlMatch[1].trim() : textOutput; // fallback
        let finalCss = cssMatch ? cssMatch[1].trim() : "/* Failed to extract pure CSS */";

        // Optional safety: remove markdown code block wrappers if they bled through the response
        if (finalHtml.startsWith("```html")) {
            finalHtml = finalHtml.replace(/```html/g, "").replace(/```/g, "").trim();
        }
        if (finalCss.startsWith("```css")) {
            finalCss = finalCss.replace(/```css/g, "").replace(/```/g, "").trim();
        }

        return NextResponse.json({
            html: finalHtml,
            css: finalCss
        });

    } catch (error: unknown) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred while calling GenAI." },
            { status: 500 }
        );
    }
}
