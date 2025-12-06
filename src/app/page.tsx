// ============================================
// src/app/page.tsx (SERVER COMPONENT)
// ============================================
import { notion, HOMEPAGE_ID } from '@/lib/notion'
import { NotionPage } from '@/components/NotionPage'

export default async function HomePage() {
  const recordMap = await notion.getPage(HOMEPAGE_ID)

  return <NotionPage recordMap={recordMap} />
}