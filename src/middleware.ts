import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    '/',
    '/vols(.*)',
    '/hotel(.*)',
    '/activity(.*)',
    '/reserver(.*)',
    '/pricing(.*)',
    '/api(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
    // If it's NOT a public route, protect it
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    // The matcher runs middleware on all routes except static files and next internals
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
