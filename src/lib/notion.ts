// ============================================
// src/lib/notion.ts
// ============================================
import { NotionAPI } from 'notion-client'

export const notion = new NotionAPI()

// Your Notion page ID (the page that contains your database)
export const HOMEPAGE_ID = '2c112cbe8bfa807db02fcbe5302a6416'