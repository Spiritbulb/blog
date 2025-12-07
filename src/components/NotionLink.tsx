// ============================================
// src/components/NotionLink.tsx
// ============================================
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface NotionLinkProps {
    pageId: string
    children: React.ReactNode
    className?: string
}

export function NotionLink({ pageId, children, className }: NotionLinkProps) {
    const [slug, setSlug] = useState<string | null>(null)

    useEffect(() => {
        // Fetch slug from API route
        fetch(`/api/slug/${pageId}`)
            .then(res => res.json())
            .then(data => setSlug(data.slug))
            .catch(err => console.error('Error fetching slug:', err))
    }, [pageId])

    // Fallback to ID-based URL while loading
    const href = slug || `/${pageId}`

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    )
}