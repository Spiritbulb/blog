// ============================================
// scripts/build-slug-cache.ts
// Run this during build: npm run build-cache
// ============================================
import { buildSlugMap, HOMEPAGE_ID } from '@/lib/notion'
import fs from 'fs'
import path from 'path'

async function buildCache() {
    console.log('Building slug cache...')

    try {
        const slugMap = await buildSlugMap(HOMEPAGE_ID)

        // Convert Map to JSON-serializable object
        const cacheData: Record<string, any> = {}
        for (const [key, value] of slugMap.entries()) {
            cacheData[key] = value
        }

        // Write to cache file
        const cacheDir = path.join(process.cwd(), '.cache')
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true })
        }

        const cachePath = path.join(cacheDir, 'notion-slugs.json')
        fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2))

        console.log(`✅ Cache built successfully! ${slugMap.size} pages indexed.`)
        console.log(`Cache saved to: ${cachePath}`)

        // Log some examples
        console.log('\nExample URLs:')
        let count = 0
        for (const metadata of slugMap.values()) {
            if (count >= 5) break
            console.log(`  ${metadata.fullPath} → ${metadata.id}`)
            count++
        }

    } catch (error) {
        console.error('❌ Error building cache:', error)
        process.exit(1)
    }
}

buildCache()
