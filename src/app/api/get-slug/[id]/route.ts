// ============================================
// src/app/api/get-slug/[id]/route.ts
// API endpoint to get slug from ID
// ============================================
import { NextResponse } from 'next/server'
import { buildSlugMap, HOMEPAGE_ID } from '@/lib/notion'

// Cache the slug map
let slugMapCache: Map<string, any> | null = null

async function getSlugMap() {
    if (!slugMapCache) {
        slugMapCache = await buildSlugMap(HOMEPAGE_ID)
    }
    return slugMapCache
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const cleanId = id.replace(/-/g, '')

    try {
        const slugMap = await getSlugMap()

        // Find the metadata with this ID
        for (const [path, metadata] of slugMap.entries()) {
            if (metadata.id === cleanId) {
                return NextResponse.json({
                    slug: metadata.fullPath,
                    title: metadata.title
                })
            }
        }

        return NextResponse.json(
            { error: 'Page not found' },
            { status: 404 }
        )
    } catch (error) {
        console.error('Error in get-slug API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}