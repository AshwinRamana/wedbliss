import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── POST /api/invitations — Create a new invitation ────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_email, plan, template_id, subdomain, data: invitationData } = body;

        if (!user_email || !plan) {
            return NextResponse.json({ error: "user_email and plan are required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("invitations")
            .insert({
                user_email,
                plan,
                template_id,
                subdomain: subdomain || null,
                domain_status: subdomain ? "pending" : null,
                data: invitationData || {},
            })
            .select()
            .single();

        if (error) {
            console.error("[invitations-api] Insert error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ invitation: data }, { status: 201 });
    } catch (err: unknown) {
        console.error("[invitations-api] Server error:", err instanceof Error ? err.message : String(err));
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ── GET /api/invitations?email=x — Get all invitations for a user ──────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "email query param is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("user_email", email)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[invitations-api] Fetch error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ invitations: data });
    } catch (err: unknown) {
        console.error("[invitations-api] Server error:", err instanceof Error ? err.message : String(err));
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
