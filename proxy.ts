import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from './lib/prisma';

// Define which paths should be protected by Clerk authentication
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)', // Protect all dashboard routes
    '/api/stores(.*)', // Protect store management APIs
    '/api/products(.*)', // Protect product management APIs
    // Add other protected routes as needed
]);

/**
 * SwiftStore Multi-tenant Middleware
 *
 * Detects subdomains and rewrites requests to the storefront route group.
 * Example: aisha.swiftstore.com -> /_storefront/aisha
 */

// Define which paths should be ignored by the subdomain middleware
const PUBLIC_PATHS = [
    '/_next',
    '/api',
    '/static',
    '/favicon.ico',
    '/sign-in',
    '/sign-up',
];

/**
 * Check if the path should be skipped by subdomain middleware
 */
function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Extract subdomain from hostname
 * Returns null if no subdomain or localhost
 */
function getSubdomain(hostname: string | null): string | null {
    if (!hostname) return null;

    // Remove port if present
    const cleanHostname = hostname.split(':')[0] || '';

    // Skip localhost and IP addresses
    if (
        cleanHostname === 'localhost' ||
        cleanHostname === '127.0.0.1' ||
        /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname)
    ) {
        return null;
    }

    const parts = cleanHostname.split('.');

    // Handle different domain patterns:
    // aisha.swiftstore.local -> aisha (subdomain)
    // heri.swiftstore.dev.localhost -> heri (subdomain)
    // swiftstore.local -> null (apex domain)
    // www.swiftstore.local -> null (www treated as apex)
    if (parts.length >= 3) {
        const potentialSubdomain = parts[0] || '';
        // Treat www as apex domain
        if (potentialSubdomain === 'www') {
            return null;
        }

        // For development domains like *.dev.localhost or *.local.localhost,
        // the first part is still the subdomain
        return potentialSubdomain;
    }

    return null;
}

// Export clerkMiddleware with custom logic that handles both authentication and subdomain routing
export default clerkMiddleware(async ({ protect }, request: NextRequest) => {
    const { pathname } = request.nextUrl;
    console.log(`[Middleware] Request received: ${request.url}`);
    console.log(`[Middleware] Pathname: ${pathname}`);

    // Extract subdomain
    const hostname = request.headers.get('host') || '';
    console.log(`[Middleware] Hostname: ${hostname}`);
    const subdomain = getSubdomain(hostname);
    console.log(`[Middleware] Extracted subdomain: ${subdomain}`);

    // Check if this is a dashboard route (should not be processed for subdomain routing)
    const isDashboardRoute = pathname.startsWith('/dashboard');
    console.log(`[Middleware] Is dashboard route: ${isDashboardRoute}`);

    // Skip public paths and API routes for subdomain processing
    const isPublicPathCheck = isPublicPath(pathname);
    console.log(`[Middleware] Is public path: ${isPublicPathCheck}`);

    if (isPublicPathCheck || isDashboardRoute) {
        console.log('[Middleware] Skipping subdomain processing for public/dashboard route');
        // For protected routes, check authentication
        if (isProtectedRoute(request)) {
            console.log('[Middleware] Protecting route');
            await protect();
        }
        return NextResponse.next();
    }

    // No subdomain means we're on the main domain (marketing site)
    if (!subdomain) {
        console.log('[Middleware] No subdomain detected, proceeding to main site');
        // Apply protection for non-subdomain routes if they're protected
        if (isProtectedRoute(request)) {
            console.log('[Middleware] Protecting main site route');
            await protect();
        }
        return NextResponse.next();
    }

    console.log(`[Middleware] Processing subdomain route for: ${subdomain}`);
    try {
        // Verify the store exists
        const store = await prisma.store.findUnique({
            where: { subdomain },
            select: { id: true, subdomain: true }
        });

        if (!store) {
            console.log(`[Middleware] Store not found for subdomain: ${subdomain}`);
            // Store not found - return 404
            return new NextResponse('Store not found', { status: 404 });
        }

        console.log(`[Middleware] Found store: ${store.id} for subdomain: ${store.subdomain}`);


        const url = request.nextUrl.clone();
        // Avoid double-prefixing the subdomain. If the incoming pathname already
        // starts with the subdomain (e.g. `/heri/products`), don't add it again.
        const prefixedPath = `/${subdomain}`;
        if (pathname === '/') {
            url.pathname = prefixedPath;
        } else if (pathname.startsWith(prefixedPath + '/') || pathname === prefixedPath) {
            // Path already includes the subdomain prefix; use it as-is
            url.pathname = pathname;
        } else {
            url.pathname = `${prefixedPath}${pathname}`;
        }
        console.log(`[Middleware] Rewriting to: ${url.toString()}`);

        const response = NextResponse.rewrite(url);
        response.headers.set('x-store-id', store.id);
        response.headers.set('x-store-subdomain', store.subdomain);

        console.log(`[Middleware] Added headers: x-store-id=${store.id}, x-store-subdomain=${store.subdomain}`);
        return response;
    } catch (error) {
        console.error('[Middleware] Error resolving store:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
});

/**
 * Configure which routes the middleware should run on
 * This runs on all routes except the ones we explicitly skip internally
 */
export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};