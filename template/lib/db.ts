import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — only create when actually used (on the client, NOT during SSR/prerender)
let _supabase: SupabaseClient | null = null;

function getSupabase() {
    if (_supabase) return _supabase;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    console.log('[WedBliss Template] Supabase URL:', url ? url.substring(0, 30) + '...' : 'MISSING');
    console.log('[WedBliss Template] Supabase Key:', key ? key.substring(0, 20) + '...' : 'MISSING');

    if (!url || !key) {
        console.error('[WedBliss Template] Supabase credentials missing! Cannot fetch invitation data.');
        return null;
    }

    _supabase = createClient(url, key);
    return _supabase;
}

export async function getInvitationData(subdomain: string) {
    console.log('[WedBliss Template] Fetching invitation for subdomain:', subdomain);

    if (!subdomain || subdomain === 'default') {
        console.warn('[WedBliss Template] No valid subdomain, returning null');
        return null;
    }

    const supabase = getSupabase();
    if (!supabase) {
        console.error('[WedBliss Template] Supabase client not initialized');
        return null;
    }

    const { data, error } = await supabase
        .from('invitations')
        .select(`
            data,
            subdomain,
            template_id,
            templates (
                id,
                name,
                html_content,
                css_content,
                js_content
            )
        `)
        .eq('subdomain', subdomain)
        .single();

    if (error || !data) {
        console.error('[WedBliss Template] Supabase query error:', error?.message, error?.details);
        return null;
    }

    console.log('[WedBliss Template] Got invitation data:', {
        subdomain: data.subdomain,
        template_id: data.template_id,
        hasData: !!data.data,
        hasTemplates: !!data.templates,
    });

    const tpl: any = Array.isArray(data.templates) ? data.templates[0] : data.templates;

    console.log('[WedBliss Template] Template info:', {
        id: tpl?.id,
        name: tpl?.name,
        htmlLength: tpl?.html_content?.length || 0,
        cssLength: tpl?.css_content?.length || 0,
        jsLength: tpl?.js_content?.length || 0,
    });

    return {
        ...data.data,
        templateHtml: tpl?.html_content || null,
        templateCss: tpl?.css_content || null,
        templateJs: tpl?.js_content || null
    };
}

