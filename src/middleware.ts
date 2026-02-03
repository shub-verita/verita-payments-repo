import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  publicRoutes: [
    '/login(.*)',
    '/signup(.*)',
    '/api/webhooks(.*)',
  ],
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
