# Wedbliss AI Template Forge (Generative UX Platform)

This document outlines the architecture for transforming the Wedbliss platform into an AI-powered Generative UI Template Engine.

By using this approach, Wedbliss moves away from hardcoding every single wedding template as a React component, and instead leverages Google Gemini to autonomously generate new, fully responsive templates based purely on design prompts.

---

## 1. The Core Concept: "Golden Base Skeletons" + Handlebars

To ensure the AI never breaks the mobile layout or "hallucinates" the wrong data fields (e.g., forgetting the Groom's name), we DO NOT ask the AI to write HTML from scratch.

Instead, we provide the AI with **Golden Base Skeletons**. These are stripped-down, perfectly functioning HTML wireframes that contain all the necessary Universal JSON Data Tags (using Handlebars `{{tag}}` syntax).

### The Basic Skeleton (`base-basic.html`)
Contains the absolute bare minimum:
- Hero section (`{{couple.groom.firstName}} Weds {{couple.bride.firstName}}`)
- Date & Time (`{{events.[0].date}}`)
- Event Details loop (`{{#each events}} ... {{/each}}`)

### The Premium Skeleton (`base-premium.html`)
Contains complex wrappers for interactive JavaScript and S3 integration:
- Includes the Gallery Loop for rendering images (`{{#each gallery.images}}`)
- Includes the Video Invite section (`{{media.videoUrl}}`)
- Includes the RSVP WhatsApp integration (`{{rsvp.whatsappNumber}}`)
- Includes simple hooks for Countdown timers (`id="cd-days"`)

**The AI's Job:** The AI will act purely as a CSS Stylist and Motion Designer. It will receive a Golden Base and a prompt (e.g., "Make this look like a lotus pond"), and it will output completely redesigned CSS, typography, inline SVGs, and layout adjustments—**but it will never alter the underlying Handlebars tags.**

---

## 2. The Universal JSON Data Structure

Every single invitation, regardless of the template chosen, will map to this exact JSON schema in the database. 
Basic plans just won't have the Premium data arrays populated.

```json
{
  "metadata": {
    "plan": "premium",
    "template_id": "tm-lotus-pond",
    "subdomain": "karthikweds"
  },
  "couple": {
    "bride": { "firstName": "Priya" },
    "groom": { "firstName": "Karthik" },
    "parents": "D/o Kamakshi & Krishnaswamy | S/o Saraswathi & Ramasamy"
  },
  "events": [
    {
      "id": "ev-1",
      "title": "Muhurtham",
      "date": "28 February 2026",
      "time": "8:24 AM - 10:48 AM",
      "venueName": "Sri Murugan Kalyana Mandapam",
      "googleMapsUrl": "https://maps.google.com/..."
    }
  ],
  "gallery": {
    "images": [
      "https://s3.amazonaws.com/wedbliss/photo1.jpg"
    ]
  },
  "media": {
    "videoUrl": "https://youtube.com/..."
  },
  "rsvp": {
    "enabled": true,
    "whatsappNumber": "+919876543210"
  }
}
```

---

## 3. The Supabase Database Schema

Templates are no longer `.tsx` files in your Next.js repo. They are rows in your Supabase `templates` table containing raw string content.

**Updated `templates` Table Schema:**
- `id` (text, primary key) - e.g., 'tm-lotus-pond'
- `name` (text) - 'Lotus Pond Theme'
- `tier` (text) - 'premium'
- `is_live` (boolean) - true
- `html_content` (text) - The AI-generated HTML Handlebars string
- `css_content` (text) - The AI-generated CSS string
- `js_content` (text) - Any scroll-reveal or animation JS string

---

## 4. The Admin Studio UI (`/admin/studio`)

This is the internal portal you will build to prompt the AI and test templates before publishing them.

1. **The Left Pane (Code Editor):** An embeddable code editor (like Monaco) showing the raw HTML/CSS.
2. **The Right Pane (Live Preview):** An `iframe` the compiles the HTML on the left with a "Dummy Test JSON" payload instantly, so you can see what the template looks like with real data.
3. **The Chat Bar (Bottom):** A prompt input field asking the AI what to change.
4. **The Controls:** A dropdown to select the "Base Skeleton" (Basic vs Premium), and a "Publish Template" button that inserts the raw text strings into Supabase.

---

## 5. The Google Gemini API Master Prompt (System Instructions)

When sending a prompt to the Google Gemini API (using `@google/genai`), this Master Prompt must be injected as the System Instruction to ensure the AI behaves correctly.

**System Master Prompt for Gemini:**
> "You are the Wedbliss AI Template Stylist, an expert UI/UX developer. 
> I will provide you with a 'Golden Base HTML Skeleton' that uses Handlebars `{{tags}}` for dynamic data.
> Your job is to completely redesign the aesthetics—colors, fonts, layout styling, CSS animations, and SVG decorative elements according to the user's prompt. 
> 
> **CRITICAL RULES:**
> 1. You MUST keep every single Handlebars `{{tag}}` exactly as it is. Do not alter, delete, or hallucinate new tags.
> 2. You MUST keep the section order exactly the same as the Golden Base.
> 3. You MUST keep the core HTML IDs intact for Javascript logic (like `id="cd-days"` for the countdown).
> 4. You must write responsive Vanilla CSS and inline SVGs/Base64. Do not use external CSS frameworks.
> 5. Output only the modified HTML and CSS code blocks."

---

## 6. The Frontend Rendering Engine

When a guest visits the live subdomain (e.g., `karthikweds.wedbliss.co`):
1. **Next.js fetches the data:** It calls Supabase to get the couple's JSON data AND the `html_content`/`css_content` of their chosen template.
2. **Handlebars Compiles it:** 
   ```javascript
   import Handlebars from "handlebars";
   
   const template = Handlebars.compile(dbData.templates.html_content);
   const finalHtmlString = template(dbData.data);
   ```
3. **React Injects it:** 
   ```jsx
   <style dangerouslySetInnerHTML={{ __html: dbData.templates.css_content }} />
   <div dangerouslySetInnerHTML={{ __html: finalHtmlString }} />
   ```

This completely decouples the templates from your Next.js application build step. You can use the AI Studio to generate and launch 50 new templates on a Sunday afternoon without ever touching the `project1` codebase or redeploying the server.
