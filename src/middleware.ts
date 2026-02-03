import { authMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export default authMiddleware({
  publicRoutes: [
    '/login(.*)',
    '/signup(.*)',
    '/api/webhooks(.*)',
  ],
  afterAuth(auth, req) {
    // Redirect root to dashboard if signed in, login if not
    if (req.nextUrl.pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = auth.userId ? '/dashboard' : '/login'
      return NextResponse.redirect(url)
    }

    // If not signed in and trying to access protected route, redirect to login
    if (!auth.userId && !auth.isPublicRoute) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  debug: false,
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
