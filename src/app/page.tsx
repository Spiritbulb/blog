// ============================================
// src/app/page.tsx (HOMEPAGE)
// ============================================
import { notion, HOMEPAGE_ID, getSlugMapForClient } from '@/lib/notion'
import { NotionPage } from '@/components/NotionPage'

export default async function HomePage() {
  const recordMap = await notion.getPage(HOMEPAGE_ID)

  // Build slug map for this page
  const slugMap = await getSlugMapForClient()

  return <NotionPage recordMap={recordMap} slugMap={slugMap} />
}

export async function generateMetadata() {
  return {
    title: 'Spiritbulb - Life at Spiritbulb',
    description: 'A Kenyan tech company creating simple, web-first tools that reimagine how students learn, how businesses go online, how communities connect, and how people shop.'
  }
}