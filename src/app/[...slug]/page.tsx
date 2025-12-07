import { notion, resolvePageId, getAllPagePaths, getSlugMapForClient } from '@/lib/notion'
import { NotionPage } from '@/components/NotionPage'
import { notFound } from 'next/navigation'

// Generate static paths for all pages
export async function generateStaticParams() {
  const paths = await getAllPagePaths()

  return paths.map(path => ({
    slug: path.split('/').filter(Boolean)
  }))
}

export default async function Page({
  params
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params

  // Convert slug array to path
  const slugPath = `/${slug.join('/')}`

  console.log('Requested path:', slugPath)

  // Try to resolve page ID (handles both slugs and IDs)
  const pageId = await resolvePageId(slugPath)

  if (!pageId) {
    console.error('Page not found:', slugPath)
    notFound()
  }

  console.log('Resolved page ID:', pageId)

  try {
    const recordMap = await notion.getPage(pageId)
    const slugMap = await getSlugMapForClient()

    return <NotionPage recordMap={recordMap} slugMap={slugMap} />
  } catch (error) {
    console.error('Error fetching page:', error)
    notFound()
  }
}

// Metadata generation
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const slugPath = `/${slug.join('/')}`
  const pageId = await resolvePageId(slugPath)

  if (!pageId) {
    return { title: 'Page Not Found' }
  }

  try {
    const recordMap = await notion.getPage(pageId)
    const blockId = Object.keys(recordMap.block)[0]
    const block = recordMap.block[blockId]?.value
    const title = block?.properties?.title?.[0]?.[0] || 'Spiritbulb'

    return {
      title: `${title} - Spiritbulb`,
      description: title
    }
  } catch (error) {
    return { title: 'Spiritbulb' }
  }
}