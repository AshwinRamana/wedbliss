# Sundara — The Blue Courtyard

A self-contained premium invitation with bespoke Chettinad courtyard artwork, warm ivory, indigo, and antique brass. Built against `template/master_prompt.md` and the fields collected by the existing checkout.

## Files

- `template/templates/sundara.html` — uploadable Handlebars template. CSS, JavaScript, and the courtyard artwork are embedded; no third-party fonts or libraries.
- `public/templates/sundara-preview.html` — rendered fictional invitation for review.
- `scripts/fixtures/sundara-demo.json` — clearly separated example names, events, and notes.
- `public/templates/sundara/demo-film.mp4` — a short silent sample film made from the generated artwork; shown in the public demo.
- `scripts/prepare-sundara-release.cjs` — exports separate HTML/CSS/JS fields matching the live database format.
- `public/templates/sundara/demo-couple.jpg` — AI-generated fictional couple for the demo only. Real invitations use the couple’s uploaded photos.
- `public/templates/thumbs/sundara.png` — collection thumbnail.

## Content contract

One scrolling invitation: cover → families → dynamic event timeline/countdown → optional gallery → optional video → optional personal notes → closing. There are no invented RSVP fields, payments, dress codes, contact numbers, or music settings.

Uses the existing `couple`, `events`, `gallery.images`, and `media.videoUrl` fields. All names, dates, venues and notes are Handlebars values. Zero to four photos adapt automatically; the lightbox supports keyboard arrows and Escape and returns focus to the triggering photograph. Native uploaded videos use controls and never autoplay; supported YouTube links use privacy-enhanced embeds; other safe video links remain links.

## Guest experience

- Large readable event information, direct maps, and calendar actions.
- Google Calendar on desktop/Android; ICS download on iOS, including iPad desktop user agents.
- Date/time parsing supports the form’s ISO dates and 24-hour times, plus the master prompt’s long dates and AM/PM times. All event times are explicitly IST. End times are respected, including events crossing midnight. Invalid dates never become a fabricated current date.
- Calendar event fields are read from escaped DOM content rather than interpolated into inline JavaScript. This deliberately improves on the master prompt’s inline `onclick` example: apostrophes in names and titles cannot break the script.
- Progressive reveals and a subtle courtyard parallax respect reduced motion. Standard page scrolling remains intact.
- Bottom navigation hides while scrolling down, reappears on upward scrolling, and remains visible while keyboard-focused.
- No loading gate or repeated floating couple names.

## Preview and validation

Run `node scripts/render-sundara.cjs` after changing the template or demo data. Serve `public` on port 3458 and open `/templates/sundara-preview.html`.

Run `node scripts/test-sundara.cjs`. `CHROME_PATH`, `SUNDARA_PREVIEW_URL`, and `SUNDARA_QA_DIR` may override the local defaults.

Validation covers 320/390/768/1440px layouts, long names, one to four gallery images, missing optional content, calendar end times and timezone, iOS ICS generation, keyboard focus, invalid URL/date handling, escaped user text, native video, and reduced motion. A separate visual review informed the second design pass: a shorter mobile opening, larger practical text, smaller event titles, and unobtrusive navigation.

Published on 21 September 2026 as `tm-sundara`, name **Sundara**, tier **premium**, in the existing Supabase `templates` table. The live engine uses Handlebars HTML with separate `css_content` and `js_content` fields; release preparation splits the self-contained source into those fields. No database schema change or new hosting service was required.

Public preview: https://www.wedbliss.co/templates/sundara-preview.html
Thumbnail: https://www.wedbliss.co/templates/thumbs/sundara.png

The missing film in the original demo was caused by an empty `media` fixture. The fixture now contains a sample MP4; real invitations still display the section only when `media.videoUrl` is supplied. Film navigation and a visible play control are included. Published MP4 playback was checked both on the static public preview and through the deployed invitation renderer with isolated demo data. The live template is selectable from the catalogue; checkout data remains the source of customer-specific content.

Source remains on `codex/sundara-template`; deployment uses the existing `wedbliss-www` S3 bucket/CloudFront distribution for preview media, and Supabase for the dynamic template. Only Sundara assets and its own catalogue record were published.
