# Sundara — The Blue Courtyard

A self-contained premium invitation with bespoke Chettinad courtyard artwork, warm ivory, indigo, and antique brass. Built against `template/master_prompt.md` and the fields collected by the existing checkout.

## Files

- `template/templates/sundara.html` — uploadable Handlebars template. CSS, JavaScript, and the courtyard artwork are embedded; no third-party fonts or libraries.
- `public/templates/sundara-preview.html` — rendered fictional invitation for review.
- `scripts/fixtures/sundara-demo.json` — clearly separated example names, events, and notes.
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

This is a new template on `codex/sundara-template`. It is not registered in the production template catalogue or deployed to the live site. To register it, use the existing admin template uploader with the HTML file, thumbnail, and a published preview URL. It requires no database schema change.
