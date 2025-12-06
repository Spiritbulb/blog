// ============================================
// src/app/[id]/page.tsx (SERVER COMPONENT)
// ============================================
import { notion } from '@/lib/notion'
import { NotionPage } from '@/components/NotionPage'

export default async function PostPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const recordMap = await notion.getPage(id)

    return <NotionPage recordMap={recordMap} />
}