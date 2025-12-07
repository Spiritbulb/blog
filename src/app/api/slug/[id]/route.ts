// ============================================
// src/app/api/slug/[id]/route.ts
// ============================================
import { NextResponse } from 'next/server'
import { getPageMetadata } from '@/lib/notion'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const metadata = await getPageMetadata(id)

        if (!metadata) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            slug: metadata.fullPath,
            title: metadata.title
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}