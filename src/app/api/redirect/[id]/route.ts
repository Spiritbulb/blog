// ============================================
// src/app/api/redirect/[id]/route.ts
// ============================================
import { redirect } from 'next/navigation'
import { getPageMetadata } from '@/lib/notion'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const metadata = await getPageMetadata(id)

        if (metadata) {
            redirect(metadata.fullPath)
        } else {
            // Fallback to ID-based URL
            redirect(`/${id}`)
        }
    } catch (error) {
        // Fallback to ID-based URL on error
        redirect(`/${id}`)
    }
}