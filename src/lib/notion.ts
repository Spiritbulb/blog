// ============================================
// src/lib/notion.ts (FIXED - DETECTS CHILD PAGES)
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

// Check if a block contains child pages by looking at its content
function getChildPageIds(block: Block, blocks: Record<string, any>): string[] {
    const childPageIds: string[] = []

    // Check if block has content property (array of block IDs)
    if (block.content && Array.isArray(block.content)) {
        for (const childId of block.content) {
            const childBlock = blocks[childId]?.value
            if (childBlock && childBlock.type === 'page') {
                childPageIds.push(childId)
            }
        }
    }

    return childPageIds
}

// Build slug map with proper parent-child detection
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
        const slugCount = new Map<string, number>()
        const metadataById = new Map<string, PageMetadata>()
        const childrenByParent = new Map<string, string[]>()

        // First pass: identify all pages and their direct parent-child relationships
        for (const [blockId, blockData] of Object.entries(blocks)) {
            const block = blockData?.value
            if (!block || block.type !== 'page') continue
            if (block.id === databaseId) continue

            const cleanId = block.id.replace(/-/g, '')
            const title = block.properties?.title?.[0]?.[0] || 'Untitled'
            let slug = createSlug(title)

            // Handle duplicate slugs
            const baseSlug = slug
            const count = slugCount.get(baseSlug) || 0
            slugCount.set(baseSlug, count + 1)
            if (count > 0) {
                slug = `${baseSlug}-${count}`
            }

            // Find actual parent by checking which page contains this page in its content
            let actualParentId: string | undefined = undefined

            // Check all other pages to see if they contain this page as a child
            for (const [potentialParentId, potentialParentData] of Object.entries(blocks)) {
                const parentBlock = potentialParentData?.value
                if (!parentBlock || parentBlock.type !== 'page') continue

                const childIds = getChildPageIds(parentBlock, blocks)
                if (childIds.includes(block.id)) {
                    actualParentId = potentialParentId

                    // Store the relationship
                    if (!childrenByParent.has(potentialParentId)) {
                        childrenByParent.set(potentialParentId, [])
                    }
                    childrenByParent.get(potentialParentId)!.push(cleanId)
                    break
                }
            }

            metadataById.set(cleanId, {
                id: cleanId,
                title,
                slug,
                parentId: actualParentId,
                fullPath: '', // Will be computed in second pass
            })

            console.log(`Page: ${title} (${cleanId}) - Parent: ${actualParentId || 'none'}`)
        }

        // Second pass: build full hierarchical paths
        function buildFullPath(pageId: string, visited = new Set<string>()): string {
            if (visited.has(pageId)) {
                console.warn(`Circular reference detected for page ${pageId}`)
                return ''
            }
            visited.add(pageId)

            const metadata = metadataById.get(pageId)
            if (!metadata) return ''

            // If already computed, return it
            if (metadata.fullPath) return metadata.fullPath

            const parentId = metadata.parentId?.replace(/-/g, '')

            // If no parent or parent is the database, this is a top-level page
            if (!parentId || parentId === databaseId || !metadataById.has(parentId)) {
                metadata.fullPath = `/${metadata.slug}`
                return metadata.fullPath
            }

            // Recursively build parent's path first
            const parentPath = buildFullPath(parentId, visited)

            if (parentPath) {
                const parentMetadata = metadataById.get(parentId)
                metadata.parentSlug = parentMetadata?.slug
                metadata.fullPath = `${parentPath}/${metadata.slug}`
            } else {
                // Fallback if parent path couldn't be built
                metadata.fullPath = `/${metadata.slug}`
            }

            return metadata.fullPath
        }

        // Build paths for all pages
        for (const [pageId] of metadataById) {
            buildFullPath(pageId)
        }

        // Third pass: populate the cache
        const slugCache = new Map<string, PageMetadata>()
        for (const [pageId, metadata] of metadataById) {
            // Add by full path
            slugCache.set(metadata.fullPath, metadata)
            // Add by ID
            slugCache.set(metadata.id, metadata)

            console.log(`✓ Mapped: ${metadata.title} → ${metadata.fullPath}`)
        }

        // Update cache
        cacheEntry = {
            data: slugCache,
            timestamp: Date.now()
        }

        console.log(`✓ Slug map rebuilt: ${slugCache.size} entries, ${childrenByParent.size} parent-child relationships`)
        return slugCache

    } catch (error) {
        console.error('Error building slug map:', error)
        // Return stale cache if available
        return cacheEntry?.data || new Map()
    }
}

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
        // Only add entries where the key is an ID (32 hex chars)
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