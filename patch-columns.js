import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Requires full bypass key

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function patchDatabase() {
    console.log("Adding missing column css_content...");
    // Since we don't have direct SQL RPC access set up, we will just pass a raw query via rpc 
    // or try a dummy insert to check if it really doesn't exist, which we know it doesn't.

    // Some projects don't expose exec_sql. If that fails, the user must run the SQL manually in their dashboard.
    const { error: rpcError } = await supabase.rpc('exec_sql', {
        sql: `
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS css_content TEXT;
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS js_content TEXT;
        `
    });

    if (rpcError) {
        console.error("RPC exec_sql failed (often disabled by default):", rpcError.message);
        console.log("\n-> ACTION REQUIRED: You must run the following SQL exactly in your Supabase SQL Editor:");
        console.log("ALTER TABLE templates ADD COLUMN css_content TEXT;");
        console.log("ALTER TABLE templates ADD COLUMN js_content TEXT;");
        console.log("NOTIFYING USER NOW.");
        process.exit(1);
    }

    console.log("Columns added successfully via RPC!");
    process.exit(0);
}

patchDatabase();
