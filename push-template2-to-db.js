const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually — use indexOf to handle keys with = in values
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const vars = {};
envFile.split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) {
        vars[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
});

const supabaseUrl = vars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'templates', 'template2-html-only.html'), 'utf8');
    const css = fs.readFileSync(path.join(__dirname, 'public', 'templates', 'template2.css'), 'utf8');

    console.log('HTML:', html.length, 'bytes');
    console.log('CSS:', css.length, 'bytes');

    // List templates
    const { data: tpls, error: listErr } = await supabase
        .from('templates')
        .select('id, name, tier, is_live');

    if (listErr) {
        console.error('List error:', listErr.message);
        process.exit(1);
    }

    console.log('\nTemplates in DB:');
    tpls.forEach(t => console.log('  ' + t.id + ' | ' + t.name + ' | live:' + t.is_live));

    // Find template2
    const t2 = tpls.find(t =>
        t.id.includes('template2') ||
        t.id.includes('tm-template2') ||
        (t.name && t.name.toLowerCase().includes('template 2')) ||
        (t.name && t.name.toLowerCase().includes('template2'))
    );

    const tid = t2 ? t2.id : process.argv[2];

    if (!tid) {
        console.error('\nNo template2 found. Pass the template ID as argument:');
        console.error('  node push-template2-to-db.js <template-id>');
        process.exit(1);
    }

    console.log('\nUpdating template:', tid);

    const { data, error } = await supabase
        .from('templates')
        .update({
            html_content: html,
            css_content: css,
        })
        .eq('id', tid)
        .select('id, name');

    if (error) {
        console.error('Update error:', error.message);
        process.exit(1);
    }

    console.log('\nSUCCESS: Updated', data[0]?.id, '-', data[0]?.name);
    console.log('Template HTML & CSS pushed to Supabase.');
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
