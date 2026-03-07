import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/push-demo
//
// Bypasses RLS using the service-role key so we can reliably find and upsert
// the 'elegant' demo invitation regardless of which user originally created it.
//
// Body:
//   templateId    — ID to store the template under
//   templateName  — display name
//   tier          — 'basic' | 'premium'
//   templateDesc  — description string
//   htmlContent   — parsed html_content
//   cssContent    — parsed css_content
//   jsContent     — parsed js_content (nullable)
//   thumbnailUrl  — optional
//   mockData      — the JSON object to populate the invitation's data column
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            return NextResponse.json(
                { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server. Add it to your .env.local and Vercel environment variables." },
                { status: 500 }
            );
        }

        // Service role client — bypasses RLS
        const admin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const {
            templateId,
            templateName,
            tier,
            templateDesc,
            htmlContent,
            cssContent,
            jsContent,
            thumbnailUrl,
            mockData,
        } = await req.json();

        if (!templateId || !htmlContent) {
            return NextResponse.json({ error: "templateId and htmlContent are required" }, { status: 400 });
        }

        // ── Step 1: Upsert template as draft ────────────────────────────────
        const { error: tplErr } = await admin
            .from("templates")
            .upsert({
                id: templateId,
                name: templateName || templateId,
                tier: tier || "premium",
                description: templateDesc || "",
                is_live: false,
                is_hero: false,
                html_content: htmlContent,
                css_content: cssContent || null,
                js_content: jsContent || null,
                demo_url: null,
                thumbnail_url: thumbnailUrl || null,
            }, { onConflict: "id" });

        if (tplErr) {
            console.error("[push-demo] Template upsert failed:", tplErr.message);
            return NextResponse.json({ error: `Template save failed: ${tplErr.message}` }, { status: 500 });
        }

        // ── Step 2: Build demo data payload ─────────────────────────────────
        const demoData = {
            ...(mockData || {}),
            metadata: {
                plan: "premium",
                template_id: templateId,
                createdAt: new Date().toISOString(),
            },
        };

        // ── Step 3: Find existing elegant invitation (any owner) ─────────────
        const { data: existing } = await admin
            .from("invitations")
            .select("id")
            .eq("subdomain", "elegant")
            .limit(1)
            .maybeSingle();

        if (existing) {
            // Update in-place
            const { error: updErr } = await admin
                .from("invitations")
                .update({ template_id: templateId, data: demoData })
                .eq("id", existing.id);

            if (updErr) {
                console.error("[push-demo] Invitation update failed:", updErr.message);
                return NextResponse.json({ error: `Invitation update failed: ${updErr.message}` }, { status: 500 });
            }
        } else {
            // First-time: create the demo slot
            const { error: insErr } = await admin
                .from("invitations")
                .insert({
                    user_email: "demo@wedbliss.co",
                    plan: "premium",
                    template_id: templateId,
                    subdomain: "elegant",
                    domain_status: "active",
                    data: demoData,
                    order_id: null,
                    cloudfront_id: null,
                });

            if (insErr) {
                console.error("[push-demo] Invitation insert failed:", insErr.message);
                return NextResponse.json({ error: `Invitation create failed: ${insErr.message}` }, { status: 500 });
            }
        }

        return NextResponse.json({
            ok: true,
            message: "Demo updated successfully",
            demoUrl: "https://elegant.wedbliss.co",
            templateId,
        });

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[push-demo] Unhandled error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
