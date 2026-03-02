# Template Upload Rules & Handlebars Contract

This document defines the **strict rules** that every Wedbliss template HTML file must follow.
It also serves as the system prompt for the AI Template Generator.

---

## 1. Available Handlebars Tags

Every template has access to the following data. Templates **MUST** use these exact tag paths.

### Couple Information
| Tag | Description | Always Available |
|-----|-------------|:---:|
| `{{couple.bride.firstName}}` | Bride's name | ✅ |
| `{{couple.bride.fatherName}}` | Bride's father's name | ✅ |
| `{{couple.bride.motherName}}` | Bride's mother's name | ✅ |
| `{{couple.bride.notes}}` | Personal note from bride | Optional |
| `{{couple.groom.firstName}}` | Groom's name | ✅ |
| `{{couple.groom.fatherName}}` | Groom's father's name | ✅ |
| `{{couple.groom.motherName}}` | Groom's mother's name | ✅ |
| `{{couple.groom.notes}}` | Personal note from groom | Optional |

### Events (Loop)
Events must be rendered inside a `{{#each events}}` block. Users can add or remove multiple events.

| Tag (inside `{{#each events}}`) | Description |
|------|-------------|
| `{{title}}` | Event name (e.g., "Muhurtham") |
| `{{date}}` | Event date |
| `{{startTime}}` | Start time |
| `{{endTime}}` | End time |
| `{{venueName}}` | Venue / location name |
| `{{googleMapsUrl}}` | Google Maps link (optional, wrap in `{{#if}}`) |

### Gallery (Conditional)
Only shown if images were uploaded by the couple.

```handlebars
{{#if gallery.images}}
  {{#each gallery.images}}
    <img src="{{this}}" alt="Couple Photo" />
  {{/each}}
{{/if}}
```

### Video (Conditional)
Only shown if a video was uploaded by the couple.

```handlebars
{{#if media.videoUrl}}
  <iframe src="{{media.videoUrl}}" allowfullscreen></iframe>
{{/if}}
```

---

## 2. Required Section Order

Every template must contain these sections in this order:

1. **Cover / Hero** — Couple names, decorative opening
2. **Family Details** — Father & mother names of both bride and groom
3. **Events** — `{{#each events}}` loop with all event details
4. **Countdown Timer** — Uses IDs: `id="cd-days"`, `id="cd-hours"`, `id="cd-mins"`
5. **Gallery** — `{{#if gallery.images}}` conditional block
6. **Video / Story** — `{{#if media.videoUrl}}` conditional block
7. **Notes from Couple** — `{{#if couple.bride.notes}}` and `{{#if couple.groom.notes}}`

---

## 3. Template File Format

A template can be uploaded as a **single `.html` file**. The upload system will automatically split it:

- Everything inside `<style>` tags → stored as `css_content`
- Everything inside `<script>` tags → stored as `js_content`
- Everything else in `<body>` → stored as `html_content`

### Structural IDs (DO NOT CHANGE)

These HTML IDs are used by the countdown timer and interactive JS logic:

| ID | Purpose |
|----|---------|
| `id="cd-days"` | Countdown days display |
| `id="cd-hours"` | Countdown hours display |
| `id="cd-mins"` | Countdown minutes display |
| `id="cd-timer"` | Countdown container |

---

## 4. Validation Rules

When uploading, the system will check:

1. ✅ HTML compiles successfully with `Handlebars.compile()`
2. ✅ All required tags are present: `{{couple.bride.firstName}}`, `{{couple.groom.firstName}}`, `{{#each events}}`
3. ✅ No unknown/invalid Handlebars tags that would break rendering
4. ✅ Renders correctly with the sample data from `template-config.json`

---

## 5. AI System Prompt (for Gemini Template Generation)

When using the AI Template Creator, this prompt is injected as the System Instruction:

> You are the Wedbliss AI Template Stylist, an expert UI/UX developer.
> I will provide a 'Golden Base HTML Skeleton' with Handlebars `{{tags}}`.
> Your job: completely redesign the CSS, typography, SVG elements, and layout per the user's prompt.
>
> **CRITICAL RULES:**
> 1. NEVER alter, delete, or add any `{{Handlebars tags}}`.
> 2. NEVER change the section order.
> 3. NEVER change structural IDs (`cd-days`, `cd-hours`, `cd-mins`, `cd-timer`).
> 4. Write responsive vanilla CSS. No external frameworks.
> 5. Gallery and Video sections must remain inside their `{{#if}}` conditionals.
> 6. Output HTML inside `<html-response>` tags and CSS inside `<css-response>` tags.
