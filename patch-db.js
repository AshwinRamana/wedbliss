require('dotenv').config({ path: '.env.local' });

async function run() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error("Missing SUPABASE URL or SERVICE ROLE KEY");
        return;
    }

    try {
        console.log("Checking if is_hero column exists...");

        // Use the raw REST API to run a SQL query via the query endpoint if possible
        // Actually, Supabase REST API doesn't support raw DDL statements directly unless exposed via RPC function.
        // We will just invoke a REST POST to create the column using the undocumented pg-meta API if exposed,
        // OR we can just instruct the user to run the SQL in their Supabase dashboard since it's the 100% safe way.

        console.log(`
================================================================================
ACTION REQUIRED: Add the 'is_hero' column in Supabase
================================================================================
Because the 'psql' command line tool is not installed on this Windows machine,
and Supabase's REST API does not allow raw DDL (ALTER TABLE) statements for security,
you must run this query manually in your Supabase Dashboard:

1. Go to your Supabase Project -> SQL Editor -> New Query
2. Paste and run exactly this line:

ALTER TABLE public.templates ADD COLUMN is_hero BOOLEAN NOT NULL DEFAULT false;

3. Then run this line to set the 4 default hero templates:

UPDATE public.templates 
SET is_hero = true 
WHERE id IN ('tm-mallipoo', 'tm-kovil', 'tm-tanjore', 'tm-peacock');

================================================================================
        `);
    } catch (e) {
        console.error(e);
    }
}

run();
