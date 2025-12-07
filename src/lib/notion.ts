// ============================================
// src/lib/notion.ts (UPDATED)
// ============================================
import { NotionAPI } from 'notion-client'
import { ExtendedRecordMap, Block } from 'notion-types'

export const notion = new NotionAPI()
export const HOMEPAGE_ID = '2c112cbe8bfa807db02fcbe5302a6416'

// Cache with TTL
interface CacheEntry {
    data: Map<string, PageMetadata>
    timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds
let cacheEntry: CacheEntry | null = null

// Helper to create URL-safe slugs
export function createSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

// Get page title from record map
export function getPageTitle(recordMap: ExtendedRecordMap): string {
    const blockId = Object.keys(recordMap.block)[0]
    const block = recordMap.block[blockId]?.value as Block
    if (!block) return 'Untitled'
    const title = block.properties?.title?.[0]?.[0] || 'Untitled'
    return title
}

export interface PageMetadata {
    id: string
    title: string
    slug: string
    parentId?: string
    parentSlug?: string
    fullPath: string
}

// Check if cache is still valid
function isCacheValid(): boolean {
    if (!cacheEntry) return false
    const now = Date.now()
    return (now - cacheEntry.timestamp) < CACHE_TTL
}

// Build slug map with caching
export async function buildSlugMap(databaseId: string): Promise<Map<string, PageMetadata>> {
    // Return cached data if still valid
    if (isCacheValid() && cacheEntry) {
        console.log('✓ Using cached slug map')
        return cacheEntry.data
    }

    console.log('⟳ Rebuilding slug map from Notion...')

    try {
        const recordMap = await notion.getPage(databaseId)
        const blocks = recordMap.block || {}
        const pageIds: string[] = []
        const slugCount = new Map<string, number>()
        const slugCache = new Map<string, PageMetadata>()

        for (const [blockId, blockData] of Object.entries(blocks)) {
            const block = blockData?.value
            if (!block) continue
            if (block.type === 'page' && block.id !== databaseId) {
                pageIds.push(block.id)
            }
        }

        console.log(`Found ${pageIds.length} pages to process`)

        for (const pageId of pageIds) {
            try {
                const block = blocks[pageId]?.value
                if (!block) continue

                const title = block.properties?.title?.[0]?.[0] || 'Untitled'
                let slug = createSlug(title)

                const baseSlug = slug
                const count = slugCount.get(baseSlug) || 0
                slugCount.set(baseSlug, count + 1)

                if (count > 0) {
                    slug = `${baseSlug}-${count}`
                }

                const parentId = block.parent_id
                let parentSlug: string | undefined
                let fullPath = `/${slug}`

                if (parentId && parentId !== databaseId) {
                    const parentBlock = blocks[parentId]?.value
                    if (parentBlock && parentBlock.type === 'page') {
                        const parentTitle = parentBlock.properties?.title?.[0]?.[0] || 'Untitled'
                        parentSlug = createSlug(parentTitle)
                        fullPath = `/${parentSlug}/${slug}`
                    }
                }

                const cleanId = pageId.replace(/-/g, '')
                const metadata: PageMetadata = {
                    id: cleanId,
                    title,
                    slug,
                    parentId,
                    parentSlug,
                    fullPath
                }

                slugCache.set(fullPath, metadata)
                slugCache.set(cleanId, metadata)

            } catch (err) {
                console.error(`Error processing page ${pageId}:`, err)
            }
        }

        // Update cache
        cacheEntry = {
            data: slugCache,
            timestamp: Date.now()
        }

        console.log(`✓ Slug map rebuilt: ${slugCache.size} entries`)
        return slugCache

    } catch (error) {
        console.error('Error building slug map:', error)
        // Return stale cache if available
        return cacheEntry?.data || new Map()
    }
}

// Rest of your functions remain the same, but they now use the cached buildSlugMap
export async function getPageIdFromSlug(slugPath: string): Promise<string | null> {
    const normalizedPath = slugPath.startsWith('/') ? slugPath : `/${slugPath}`
    const slugCache = await buildSlugMap(HOMEPAGE_ID)

    if (slugCache.has(normalizedPath)) {
        return slugCache.get(normalizedPath)!.id
    }

    const withoutSlash = normalizedPath.slice(1)
    if (slugCache.has(withoutSlash)) {
        return slugCache.get(withoutSlash)!.id
    }

    return null
}

export async function resolvePageId(slugOrId: string): Promise<string | null> {
    const cleanId = slugOrId.replace(/-/g, '').replace(/\//g, '')
    if (cleanId.length === 32 && /^[a-f0-9]+$/.test(cleanId)) {
        return cleanId
    }
    return await getPageIdFromSlug(slugOrId)
}

export async function getAllPagePaths(): Promise<string[]> {
    const slugCache = await buildSlugMap(HOMEPAGE_ID)
    return Array.from(slugCache.values())
        .filter(metadata => metadata.fullPath.startsWith('/'))
        .map(page => page.fullPath)
}

export async function getSlugMapForClient(): Promise<Record<string, string>> {
    const slugCache = await buildSlugMap(HOMEPAGE_ID)
    const slugsById: Record<string, string> = {}

    for (const [key, metadata] of slugCache.entries()) {
        if (key.length === 32 && /^[a-f0-9]+$/.test(key)) {
            slugsById[metadata.id] = metadata.fullPath
        }
    }

    return slugsById
}

export async function getPageMetadata(idOrSlug: string): Promise<PageMetadata | null> {
    const slugCache = await buildSlugMap(HOMEPAGE_ID)
    if (slugCache.has(idOrSlug)) {
        return slugCache.get(idOrSlug)!
    }
    return null
}