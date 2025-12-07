// ============================================
// src/proxy.ts (RENAMED from middleware.ts)
// Redirects ID-based URLs to slug-based URLs
// ============================================
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Skip API routes, static files, etc.
    if (
        path.startsWith('/api/') ||
        path.startsWith('/_next/') ||
        path.startsWith('/favicon.ico') ||
        path.includes('.')
    ) {
        return NextResponse.next()
    }

    // Skip homepage
    if (path === '/') {
        return NextResponse.next()
    }

    // Check if path looks like a Notion ID (32 hex chars with or without hyphens)
    const pathWithoutSlash = path.slice(1)
    const cleanPath = pathWithoutSlash.replace(/-/g, '')

    if (cleanPath.length === 32 && /^[a-f0-9]+$/.test(cleanPath)) {
        // It's an ID, try to get the slug
        try {
            const apiUrl = new URL(`/api/get-slug/${cleanPath}`, request.url)
            const response = await fetch(apiUrl.toString())

            if (response.ok) {
                const data = await response.json()
                if (data.slug && data.slug !== path) {
                    console.log(`Redirecting ${path} → ${data.slug}`)
                    return NextResponse.redirect(new URL(data.slug, request.url))
                }
            }
        } catch (error) {
            console.error('Error in proxy:', error)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}