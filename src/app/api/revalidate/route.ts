// ============================================
// src/app/api/revalidate/route.ts
// ============================================
import { revalidatePath } from 'next/cache'
import { buildSlugMap, HOMEPAGE_ID } from '@/lib/notion'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {

        // Rebuild the cache
        await buildSlugMap(HOMEPAGE_ID)

        // Revalidate all paths
        revalidatePath('/', 'layout')

        return NextResponse.json({ revalidated: true, now: Date.now() })
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
    }
}