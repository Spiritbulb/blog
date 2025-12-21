// ============================================
// src/components/NotionPage.tsx (UPDATED WITH SORTING)
// ============================================
'use client'

import dynamic from 'next/dynamic'
import { ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'
import { useMemo } from 'react'

import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'katex/dist/katex.min.css'
import '@/styles/notion.css'

const Collection = dynamic(() =>
    import('react-notion-x/build/third-party/collection').then(
        (m) => m.Collection
    )
)

const Equation = dynamic(() =>
    import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)

const Modal = dynamic(
    () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
    { ssr: false }
)

const Pdf = dynamic(
    () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
    { ssr: false }
)

const Code = dynamic(
    () => import('react-notion-x/build/third-party/code').then((m) => m.Code),
    { ssr: false }
)


interface NotionPageProps {
    recordMap: ExtendedRecordMap
    slugMap?: Record<string, string>
}

// Helper function to sort collection items by date
function sortRecordMapByDate(recordMap: ExtendedRecordMap): ExtendedRecordMap {
    const sortedMap = JSON.parse(JSON.stringify(recordMap)) // Deep clone

    // Find all collection views
    Object.keys(sortedMap.collection_view || {}).forEach(viewId => {
        const view = sortedMap.collection_view[viewId]

        if (view?.value?.page_sort) {
            const pageSort = view.value.page_sort

            // Get the collection ID to find the schema
            const collectionId = view.value.parent_id
            const collection = sortedMap.collection?.[collectionId]

            if (collection?.value?.schema) {
                const schema = collection.value.schema

                // Find the date/timestamp property
                let datePropertyId: string | null = null

                for (const [propId, propData] of Object.entries(schema)) {
                    const prop = propData as any
                    // Look for date, created_time, or last_edited_time properties
                    if (prop.type === 'date' || prop.type === 'created_time' || prop.type === 'last_edited_time') {
                        datePropertyId = propId
                        break
                    }
                }

                if (datePropertyId && pageSort.length > 0) {
                    // Sort the page_sort array by date
                    pageSort.sort((a: string, b: string) => {
                        const pageA = sortedMap.block?.[a]?.value
                        const pageB = sortedMap.block?.[b]?.value

                        if (!pageA || !pageB) return 0

                        // Get date values from properties
                        const dateA = pageA.properties?.[datePropertyId]?.[0]?.[1]?.[0]?.[1]?.start_date
                        const dateB = pageB.properties?.[datePropertyId]?.[0]?.[1]?.[0]?.[1]?.start_date

                        // Fallback to created_time if no date property
                        const timeA = dateA || pageA.created_time
                        const timeB = dateB || pageB.created_time

                        if (!timeA || !timeB) return 0

                        // Sort descending (newest first)
                        return new Date(timeB).getTime() - new Date(timeA).getTime()
                    })
                }
            }
        }
    })

    return sortedMap
}

export function NotionPage({ recordMap, slugMap = {} }: NotionPageProps) {
    // Sort the recordMap by date
    const sortedRecordMap = useMemo(() => {
        if (!recordMap) return null
        return sortRecordMapByDate(recordMap)
    }, [recordMap])

    if (!sortedRecordMap) {
        return null
    }

    return (
        <div className="notion-wrapper">
            <NotionRenderer
                rootDomain='https://blog.spiritbulb.org'
                recordMap={sortedRecordMap}
                fullPage={true}
                darkMode={false}
                components={{
                    Collection,
                    Equation,
                    Code,
                    Modal,
                    Pdf,
                }}
                disableHeader={true}
                // Map page IDs to their full hierarchical paths
                mapPageUrl={(pageId) => {
                    // Clean the page ID (remove dashes)
                    const cleanId = pageId.replace(/-/g, '')

                    // Get the full path from slugMap (includes parent/child structure)
                    const fullPath = slugMap[cleanId]

                    if (fullPath) {
                        console.log(`Mapping ${pageId} → ${fullPath}`)
                        return fullPath
                    }

                    // Fallback: return the ID if no slug mapping exists
                    console.log(`No mapping for ${pageId}, using ID fallback`)
                    return `/${cleanId}`
                }}
            />
        </div>
    )
}