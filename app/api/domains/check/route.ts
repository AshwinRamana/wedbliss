import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── GET /api/domains/check?subdomain=xxx ────────────────────────────────────
// Checks if a subdomain is available for use by querying the invitations table
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const subdomain = searchParams.get("subdomain");

        if (!subdomain) {
            return NextResponse.json({ error: "subdomain query param is required" }, { status: 400 });
        }

        // Validate format: only lowercase letters, numbers, and hyphens
        if (!/^[a-z0-9-]+$/.test(subdomain)) {
            return NextResponse.json({ error: "Subdomain can only contain lowercase letters, numbers, and hyphens." }, { status: 400 });
        }

        if (subdomain.length < 3) {
            return NextResponse.json({ error: "Subdomain must be at least 3 characters." }, { status: 400 });
        }

        if (subdomain.length > 50) {
            return NextResponse.json({ error: "Subdomain must be 50 characters or less." }, { status: 400 });
        }

        // Check if subdomain is already taken in invitations table
        const { data, error } = await supabase
            .from("invitations")
            .select("id")
            .eq("subdomain", subdomain)
            .limit(1);

        if (error) {
            console.error("[domains-check] Supabase error:", error.message);
            return NextResponse.json({ error: "Failed to check domain availability" }, { status: 500 });
        }

        const available = !data || data.length === 0;

        return NextResponse.json({ available, subdomain });
    } catch (err: unknown) {
        console.error("[domains-check] Server error:", err instanceof Error ? err.message : String(err));
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
