// Storyboard camera: renders a template chapter by chapter with headless Chrome
// (real compositing, animations in virtual time) so motion-heavy templates can be
// reviewed frame by frame without a visible browser.
//
// Usage (from repo root, preview server running on :4173):
//   node template/preview/shots.mjs <template> <outDir> [data=real] [width=390] [height=844]
// Writes one PNG per shot listed below.
import { execFile } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [, , tpl = 'gravity', out = 'shots', data = 'real', width = '390', height = '844'] = process.argv;
const CHROME = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
if (!CHROME) { console.error('No Chrome/Edge found'); process.exit(1); }
mkdirSync(out, { recursive: true });

const base = `http://localhost:4173/preview/?t=${tpl}&d=${data}`;
// [name, query, virtual ms before capture]
const SHOTS = [
    ['01-gate', '', 2500],
    ['02-open-0.8s', '&open=1', 1200],
    ['03-open-1.8s', '&open=1', 2200],
    ['04-open-2.8s', '&open=1', 3200],
    ['05-open-3.8s', '&open=1', 4200],
    ['06-names', '&open=1', 6500],
    ...(process.env.SHOTS_AT || '').split(',').filter(Boolean).map((sel, i) => {
        const [s, off = '0'] = sel.split('@');
        return [`${String(i + 7).padStart(2, '0')}-${s.replace(/[^a-z0-9]+/gi, '')}`, `&at=${encodeURIComponent(s)}&off=${off}`, 9000];
    }),
];

const run = (name, q, ms) => new Promise((res) => {
    const file = join(out, `${name}.png`);
    execFile(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
        `--window-size=${width},${height}`, `--virtual-time-budget=${ms}`, `--screenshot=${file}`, base + q],
        { timeout: 90000 }, (err) => { console.log(err ? `✗ ${name}: ${err.message.split('\n')[0]}` : `✓ ${name}`); res(); });
});
for (const [n, q, ms] of SHOTS) await run(n, q, ms);
