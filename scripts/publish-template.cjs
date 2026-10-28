#!/usr/bin/env node
/*
 * Publish a template HTML file to Supabase without the admin uploader.
 *
 *   node scripts/publish-template.cjs <file.html> <templateId> --env <path-to-env-file> [--dry-run]
 *
 * Mirrors /admin/upload-template's parseTemplateFile(): inline <style> → css_content,
 * inline <script> (no src, not #tailwind-config) → js_content, head + body inner HTML →
 * html_content. Unlike "Push Live" it only touches html/css/js (+ is_live), so the
 * template's name, thumbnail, tier and hero flag stay as they are.
 *
 * Before writing, the live row is saved to Desktop/wedbliss-template-backups/ so any
 * publish can be rolled back with:  --rollback <backup.json>
 *
 * The env file holds NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and
 * SUPABASE_SERVICE_ROLE_KEY. It is read here and never printed.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const Handlebars = require('handlebars');
const { createClient } = require('@supabase/supabase-js');

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const dryRun = args.includes('--dry-run');
const envFile = flag('--env');
const rollbackFile = flag('--rollback');
const [file, templateId] = args.filter((a, i) => !a.startsWith('--') && !['--env', '--rollback', '--name', '--tier', '--desc'].includes(args[i - 1]));

function die(msg) { console.error('✗ ' + msg); process.exit(1); }

function loadEnv(p) {
    if (!p) return {};
    const out = {};
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
    return out;
}

// Same split as the uploader's DOMParser version, done on the source text.
function parseTemplateFile(raw) {
    let src = raw;
    let css = '', js = '';
    src = src.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, body) => { css += body + '\n'; return ''; });
    src = src.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (whole, attrs, body) => {
        if (/\bsrc\s*=/.test(attrs) || /\bid\s*=\s*["']tailwind-config["']/.test(attrs)) return whole;
        js += body + '\n';
        return '';
    });
    const head = (src.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [, ''])[1];
    const body = (src.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [, ''])[1];
    return { html: (head.trim() + '\n' + body.trim()).trim(), css: css.trim(), js: js.trim() };
}

function validate(html) {
    const errors = [];
    ['couple.bride.firstName', 'couple.groom.firstName', 'couple.bride.fatherName',
        'couple.bride.motherName', 'couple.groom.fatherName', 'couple.groom.motherName']
        .forEach((t) => { if (!html.includes('{{' + t + '}}')) errors.push('missing {{' + t + '}}'); });
    if (!html.includes('{{#each events}}')) errors.push('missing {{#each events}}');
    try {
        Handlebars.registerHelper('add', (a, b) => parseInt(a, 10) + parseInt(b, 10));
        Handlebars.precompile(html);
    } catch (e) { errors.push('handlebars: ' + e.message); }
    return errors;
}

(async () => {
    const env = { ...loadEnv(envFile), ...process.env };
    const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) die('need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (pass --env <file>)');
    const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/) || [])[1];
    console.log('project:', ref || url);
    const db = createClient(url, key, { auth: { persistSession: false } });

    if (rollbackFile) {
        const row = JSON.parse(fs.readFileSync(rollbackFile, 'utf8'));
        if (dryRun) return console.log('dry run: would restore', row.id);
        const { error } = await db.from('templates').update({
            html_content: row.html_content, css_content: row.css_content, js_content: row.js_content, is_live: row.is_live,
        }).eq('id', row.id);
        if (error) die(error.message);
        return console.log('✓ restored', row.id, 'from', rollbackFile);
    }

    if (!file || !templateId) die('usage: publish-template.cjs <file.html> <templateId> --env <file> [--dry-run]');
    const parsed = parseTemplateFile(fs.readFileSync(file, 'utf8'));
    const errors = validate(parsed.html);
    if (errors.length) die('validation failed:\n  ' + errors.join('\n  '));
    console.log(`parsed ${path.basename(file)} → html ${parsed.html.length}, css ${parsed.css.length}, js ${parsed.js.length} chars`);

    const { data: live, error: readErr } = await db.from('templates')
        .select('id, name, is_live, is_hero, html_content, css_content, js_content').eq('id', templateId).maybeSingle();
    if (readErr) die(readErr.message);
    if (!live) {
        // A new template: --create inserts the row (live in the store). Its demo
        // subdomain still needs the uploader's Push Live (CloudFront + DNS).
        if (!args.includes('--create')) die(`no template with id ${templateId} (pass --create --name "<name>" [--tier premium|basic] [--desc "<text>"] to add it)`);
        const row = {
            id: templateId, name: flag('--name') || templateId, tier: flag('--tier') || 'premium',
            description: flag('--desc') || '', is_live: true, is_hero: false,
            html_content: parsed.html, css_content: parsed.css || null, js_content: parsed.js || null,
        };
        if (dryRun) return console.log('dry run: would create', row.id, `"${row.name}"`, row.tier);
        const { error } = await db.from('templates').insert(row);
        if (error) die(error.message);
        return console.log(`✓ created ${templateId} "${row.name}" (live, ${row.tier}); no demo subdomain yet`);
    }
    console.log(`live row: "${live.name}" (is_live=${live.is_live}, is_hero=${live.is_hero}, html ${(live.html_content || '').length} chars)`);

    const dir = path.join(os.homedir(), 'Desktop', 'wedbliss-template-backups');
    fs.mkdirSync(dir, { recursive: true });
    const backup = path.join(dir, `${templateId}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backup, JSON.stringify(live));
    console.log('backup:', backup);

    if (dryRun) return console.log('dry run: nothing written');
    const { error } = await db.from('templates').update({
        html_content: parsed.html, css_content: parsed.css || null, js_content: parsed.js || null, is_live: true,
    }).eq('id', templateId);
    if (error) die(error.message);
    console.log(`✓ published ${templateId} (name, thumbnail, tier and hero flag unchanged)`);
})().catch((e) => die(e.message));
