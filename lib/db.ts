import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror the Supabase table schema exactly
// ─────────────────────────────────────────────────────────────────────────────

export type DbTemplate = {
    id: string;
    name: string;
    tier: 'basic' | 'premium';
    description: string;
    is_live: boolean;
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

/** Fetch all templates from Supabase, ordered by creation date. */
export async function getTemplates(): Promise<DbTemplate[]> {
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[db] getTemplates error:', error.message);
        return [];
    }
    return data as DbTemplate[];
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

export type DbInvitation = {
    id: string;
    user_email: string;
    plan: 'basic' | 'premium';
    template_id: string | null;
    subdomain: string | null;
    domain_status: 'pending' | 'provisioning' | 'active' | 'failed' | null;
    bride_first: string | null;
    bride_last: string | null;
    bride_qual: string | null;
    groom_first: string | null;
    groom_last: string | null;
    groom_qual: string | null;
    events: unknown[];
    bride_parents: string | null;
    bride_grands: string | null;
    groom_parents: string | null;
    groom_grands: string | null;
    best_wishes: string | null;
    video_url: string | null;
    music_track: string | null;
    order_id: string | null;
    cloudfront_id: string | null;
    created_at: string;
    updated_at: string;
};

/** Create a new invitation. */
export async function createInvitation(
    invitation: Omit<DbInvitation, 'id' | 'created_at' | 'updated_at'>
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
        .update({ ...updates, updated_at: new Date().toISOString() })
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
