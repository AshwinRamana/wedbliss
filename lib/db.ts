import { supabase } from './supabase';
export { supabase };

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror the Supabase table schema exactly
// ─────────────────────────────────────────────────────────────────────────────

export type DbTemplate = {
    id: string;
    name: string;
    tier: 'basic' | 'premium';
    description: string;
    is_live: boolean;
    is_hero: boolean;
    html_content: string | null;
    css_content: string | null;
    js_content: string | null;
    demo_url: string | null;
    thumbnail_url: string | null;
    created_at: string;
};

export type DbOrder = {
    id: string;
    transaction_id: string | null;
    couple_name: string | null;
    plan: string | null;
    template_id: string | null;
    amount_paise: number | null;
    status: string | null;
    user_email: string | null;
    created_at: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────────────────────

/** Seed used when Supabase is unreachable or the templates table is empty. */
export const FALLBACK_TEMPLATES: DbTemplate[] = [
    {
        id: 'tm-pasted-1773394897675',
        name: 'Noir',
        tier: 'premium',
        description: 'Midnight plum and gold foil — cinematic, formal, unforgettable.',
        is_live: true,
        is_hero: true,
        html_content: null,
        css_content: null,
        js_content: null,
        demo_url: 'https://noir.wedbliss.co',
        thumbnail_url: 'https://www.wedbliss.co/templates/thumbs/noir.webp',
        created_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tm-pasted-1773394986121',
        name: 'Gravity',
        tier: 'premium',
        description: 'Celestial night sky with starlight and gold — modern and grand.',
        is_live: true,
        is_hero: true,
        html_content: null,
        css_content: null,
        js_content: null,
        demo_url: 'https://gravity.wedbliss.co',
        thumbnail_url: 'https://www.wedbliss.co/templates/thumbs/gravity.webp',
        created_at: '2026-01-01T00:00:01.000Z',
    },
    {
        id: 'tm-pasted-1773396374014',
        name: 'Blossom',
        tier: 'premium',
        description: 'Soft sakura and champagne romance — light, floral, joyful.',
        is_live: true,
        is_hero: true,
        html_content: null,
        css_content: null,
        js_content: null,
        demo_url: 'https://blossom.wedbliss.co',
        thumbnail_url: 'https://www.wedbliss.co/templates/thumbs/blossom.webp',
        created_at: '2026-01-01T00:00:02.000Z',
    },
    {
        id: 'tm-thiruvizha',
        name: 'Thiruvizha',
        tier: 'premium',
        description: 'Temple courtyard at night — brass light, sticky scroll beats, ceremonial timeline.',
        is_live: true,
        is_hero: true,
        html_content: null,
        css_content: null,
        js_content: null,
        demo_url: 'https://www.wedbliss.co/templates/thiruvizha.html',
        thumbnail_url: 'https://www.wedbliss.co/templates/thumbs/thiruvizha.webp',
        created_at: '2026-01-01T00:00:03.000Z',
    },
];

/** Fetch all templates from Supabase, ordered by creation date. */
export async function getTemplates(): Promise<DbTemplate[]> {
    try {
        // Omit html/css/js blobs — listing only. Full content via getTemplateById.
        const query = supabase
            .from('templates')
            .select('id,name,tier,description,is_live,is_hero,demo_url,thumbnail_url,created_at')
            .order('created_at', { ascending: true });

        const result = await Promise.race([
            query,
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('getTemplates timeout')), 12000)
            ),
        ]);

        const { data, error } = result as {
            data: DbTemplate[] | null;
            error: { message: string } | null;
        };

        if (error) {
            console.error('[db] getTemplates error:', error.message);
            return FALLBACK_TEMPLATES;
        }
        if (!data || data.length === 0) {
            console.warn('[db] getTemplates empty — using fallback seed');
            return FALLBACK_TEMPLATES;
        }
        // Never surface draft push-demo rows in public catalogs
        const cleaned = data.filter((row) => !row.id.startsWith('tm-demo-'));
        return cleaned.map((row) => ({
            ...row,
            html_content: row.html_content ?? null,
            css_content: row.css_content ?? null,
            js_content: row.js_content ?? null,
        })) as DbTemplate[];
    } catch (err) {
        console.error('[db] getTemplates failed:', err);
        return FALLBACK_TEMPLATES;
    }
}

/** Fetch a single template by ID. */
export async function getTemplateById(id: string): Promise<DbTemplate | null> {
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('[db] getTemplateById error:', error.message);
        return null;
    }
    return data as DbTemplate;
}

/**
 * Upsert a template record (insert or update based on `id`).
 * Call this from the admin panel when saving edits or adding a new template.
 */
export async function upsertTemplate(
    template: Partial<DbTemplate> & Pick<DbTemplate, 'id'>
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('templates')
        .upsert(template, { onConflict: 'id' });

    if (error) {
        console.error('[db] upsertTemplate error:', error.message);
        return { error: error.message };
    }
    return { error: null };
}

/**
 * Delete a template by ID.
 */
export async function deleteTemplate(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[db] deleteTemplate error:', error.message);
        return { error: error.message };
    }
    return { error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch recent orders for the admin dashboard, newest first. */
export async function getOrders(limit = 50): Promise<DbOrder[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[db] getOrders error:', error.message);
        return [];
    }
    return data as DbOrder[];
}

/**
 * Insert a new order record.
 * Call this from the payment success handler / Razorpay webhook.
 */
export async function insertOrder(
    order: Omit<DbOrder, 'id' | 'created_at'>
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('orders')
        .insert(order);

    if (error) {
        console.error('[db] insertOrder error:', error.message);
        return { error: error.message };
    }
    return { error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Invitations
// ─────────────────────────────────────────────────────────────────────────────

export interface InvitationData {
    metadata: {
        plan: "basic" | "premium";
        template_id: string;
        createdAt: string;
    };
    couple: {
        bride: {
            firstName: string;
            fatherName: string;
            motherName: string;
            notes?: string;
        };
        groom: {
            firstName: string;
            fatherName: string;
            motherName: string;
            notes?: string;
        };
    };
    events: Array<{
        id: string;
        title: string;
        date: string;
        startTime: string;
        endTime: string;
        venueName: string;
        googleMapsUrl?: string;
    }>;
    gallery?: {
        images: string[];
    };
    media?: {
        videoUrl?: string;
    };
}

export type DbInvitation = {
    id: string;
    user_email: string;
    plan: 'basic' | 'premium';
    template_id: string | null;
    subdomain: string | null;
    domain_status: 'pending' | 'provisioning' | 'active' | 'failed' | null;
    data: InvitationData;
    order_id: string | null;
    cloudfront_id: string | null;
    created_at: string;
};

/** Create a new invitation. */
export async function createInvitation(
    invitation: Omit<DbInvitation, 'id' | 'created_at'>
): Promise<{ data: DbInvitation | null; error: string | null }> {
    const { data, error } = await supabase
        .from('invitations')
        .insert(invitation)
        .select()
        .single();

    if (error) {
        console.error('[db] createInvitation error:', error.message);
        return { data: null, error: error.message };
    }
    return { data: data as DbInvitation, error: null };
}

/** Fetch all invitations for a user. */
export async function getInvitationsByEmail(email: string): Promise<DbInvitation[]> {
    const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[db] getInvitationsByEmail error:', error.message);
        return [];
    }
    return data as DbInvitation[];
}

/** Update an invitation by ID. */
export async function updateInvitation(
    id: string,
    updates: Partial<DbInvitation>
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('invitations')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('[db] updateInvitation error:', error.message);
        return { error: error.message };
    }
    return { error: null };
}

/** Check if a subdomain is available. */
export async function checkSubdomainAvailable(subdomain: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('invitations')
        .select('id')
        .eq('subdomain', subdomain)
        .limit(1);

    if (error) {
        console.error('[db] checkSubdomainAvailable error:', error.message);
        return false;
    }
    return !data || data.length === 0;
}

/** Fetch a single invitation by subdomain. */
export async function getInvitationBySubdomain(subdomain: string): Promise<DbInvitation | null> {
    const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('subdomain', subdomain)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // Ignore "Rows not found" error
            console.error('[db] getInvitationBySubdomain error:', error.message);
        }
        return null;
    }
    return data as DbInvitation;
}
