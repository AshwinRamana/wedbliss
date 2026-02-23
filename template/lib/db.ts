import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getInvitationData(subdomain: string) {
    if (!subdomain) return null;

    const { data, error } = await supabase
        .from('invitations')
        .select('data')
        .eq('subdomain', subdomain)
        .single();

    if (error || !data) {
        console.error("Error fetching invitation from template engine:", error?.message);
        return null; // Return null to fallback to static default data
    }

    return data.data; // This is the structured JSON
}
