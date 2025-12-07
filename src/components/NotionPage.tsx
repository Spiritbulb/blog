// ============================================
// src/components/NotionPage.tsx (UPDATED)
// ============================================
'use client'

import dynamic from 'next/dynamic'
import { ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'

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

export function NotionPage({ recordMap, slugMap = {} }: NotionPageProps) {
    if (!recordMap) {
        return null
    }

    return (
        <div className="notion-wrapper">
            <NotionRenderer
                rootDomain='https://blog.spiritbulb.org'
                recordMap={recordMap}
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
                // Map page IDs to slugs
                mapPageUrl={(pageId) => {
                    const cleanId = pageId.replace(/-/g, '')
                    // Return slug if we have it, otherwise return ID
                    const slug = slugMap[cleanId]
                    console.log(`Mapping ${pageId} (${cleanId}) → ${slug || `/${cleanId}`}`)
                    return slug
                }}
            />
        </div>
    )
}