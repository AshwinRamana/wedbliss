// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        // Skip all Next.js internal paths and static files
        '/((?!api|_next/static|_next/image|favicon.ico|images|icon.png).*)',
    ],
};

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();

    // Get hostname of request (e.g. admin.wedbliss.co, karthikweds.wedbliss.co, localhost:3000)
    const hostname = req.headers.get('host') || '';

    // Define public application domain (e.g., wedbliss.co, localhost:3000)
    // In production we would use process.env.NEXT_PUBLIC_ROOT_DOMAIN or similar.
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

    // 1. Admin Portal Subdomain Check
    if (hostname === `admin.${rootDomain}`) {
        // We rewrite to /admin
        url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // 2. Custom Subdomain / Couple Websites Check
    // If the hostname is NOT the root domain (e.g. not localhost:3000 or wedbliss.co)
    if (
        hostname !== rootDomain &&
        hostname !== `www.${rootDomain}` &&
        !hostname.includes('localhost') // Exclude localhost direct hits unless explicitly subdomained
    ) {
        // Extract the subdomain/custom domain.
        // e.g. "karthikweds.wedbliss.co" -> "karthikweds"
        // e.g. "karthikweds.localhost:3000" -> "karthikweds"
        const currentHost =
            process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
                ? hostname.replace(`.${rootDomain}`, '')
                : hostname.replace(`.localhost:3000`, '');

        // Rewrite to `/[domain]${url.pathname}`
        // So `karthikweds.wedbliss.co/` -> `/[domain]/` -> served by app/[domain]/page.tsx
        url.pathname = `/${currentHost}${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // Default: Continue to marketing site standard routing
    return NextResponse.next();
}
