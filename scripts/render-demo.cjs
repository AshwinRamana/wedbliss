/**
 * Render a template file into a static public demo page, assembled the way the
 * engine and template/preview do it: Handlebars runs on the html only, and the
 * css/js are injected untouched.
 *
 *   node scripts/render-demo.cjs <template.html> <public/templates/out.html> [--title "Name"]
 *
 * Uses the admin uploader's sample couple, so demos match the store thumbnails.
 */
const fs = require('node:fs');
const path = require('node:path');
const Handlebars = require('handlebars');

const args = process.argv.slice(2);
const [src, out] = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--title');
const ti = args.indexOf('--title'), title = ti >= 0 ? args[ti + 1] : null;
if (!src || !out) { console.error('usage: render-demo.cjs <template.html> <out.html> [--title "Name"]'); process.exit(1); }

const demo = {
    couple: {
        bride: { firstName: 'Priya', fatherName: 'Krishnaswamy', motherName: 'Kamakshi', notes: "Can't wait to start this beautiful journey together!" },
        groom: { firstName: 'Karthik', fatherName: 'Ramasamy', motherName: 'Saraswathi', notes: 'Forever and always, my love.' },
    },
    events: [
        { id: 'ev-1', title: 'Muhurtham', date: '2026-12-28', startTime: '08:24', endTime: '10:48', venueName: 'Sri Murugan Kalyana Mandapam', googleMapsUrl: 'https://maps.google.com/?q=Sri+Murugan+Kalyana+Mandapam' },
        { id: 'ev-2', title: 'Reception', date: '2026-12-28', startTime: '18:00', endTime: '22:00', venueName: 'Grand Ballroom, Hotel Savera', googleMapsUrl: 'https://maps.google.com/?q=Hotel+Savera+Chennai' },
    ],
    gallery: { images: ['https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900'] },
};

// Same split as the admin uploader (see scripts/publish-template.cjs).
let raw = fs.readFileSync(src, 'utf8'), css = '', js = '';
raw = raw.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, b) => { css += b + '\n'; return ''; });
raw = raw.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (whole, attrs, b) => {
    if (/\bsrc\s*=/.test(attrs) || /\bid\s*=\s*["']tailwind-config["']/.test(attrs)) return whole;
    js += b + '\n'; return '';
});
const head = (raw.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [, ''])[1];
const body = (raw.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [, ''])[1];
Handlebars.registerHelper('add', (a, b) => parseInt(a, 10) + parseInt(b, 10));
let html = Handlebars.compile((head.trim() + '\n' + body.trim()).trim())(demo);
if (title) html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title} · WedBliss demo</title>`);

const page = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<meta name="robots" content="noindex">\n' + (css ? '<style>' + css.trim() + '</style>' : '') + '\n</head>\n<body>\n' + html + '\n' +
    (js ? '<script>' + js.trim() + '</script>' : '') + '\n</body>\n</html>\n';
fs.writeFileSync(out, page);
console.log(`Rendered ${path.relative(process.cwd(), out)} (${page.length} chars)`);
