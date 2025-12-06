// ============================================
// src/components/NotionPage.tsx (CLIENT COMPONENT)
// ============================================
'use client'

import dynamic from 'next/dynamic'
import { ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'

// Lazy load heavy components
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

interface NotionPageProps {
    recordMap: ExtendedRecordMap
}

export function NotionPage({ recordMap }: NotionPageProps) {
    if (!recordMap) {
        return null
    }

    return (
        <NotionRenderer
            recordMap={recordMap}
            fullPage={true}
            darkMode={false}
            components={{
                Collection,
                Equation,
                Modal,
                Pdf,
            }}
        />
    )
}
