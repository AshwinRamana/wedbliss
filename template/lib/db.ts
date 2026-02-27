import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getInvitationData(subdomain: string) {
    if (!subdomain) return null;

    const { data, error } = await supabase
        .from('invitations')
        .select(`
            data,
            templates (
                html_content,
                css_content,
                js_content
            )
        `)
        .eq('subdomain', subdomain)
        .single();

    if (error || !data) {
        console.error("Error fetching invitation from template engine:", error?.message);
        return null;
    }

    const tpl: any = Array.isArray(data.templates) ? data.templates[0] : data.templates;

    return {
        ...data.data,
        templateHtml: tpl?.html_content || null,
        templateCss: tpl?.css_content || null,
        templateJs: tpl?.js_content || null
    };
}
