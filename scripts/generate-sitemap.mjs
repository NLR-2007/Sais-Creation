/**
 * Regenerates public/sitemap.xml.
 *
 * The hand-written sitemap listed /cart, /quote, /login and /register — all of which
 * render a noindex tag, so it was asking Google to index pages that tell it not to —
 * while leaving out /reviews, the legal pages and all 50 product pages.
 *
 * Product URLs are read from the public Firestore REST API, the same data the site
 * itself reads, so no credentials are needed.
 *
 *   node generate-sitemap.mjs
 *
 * Re-run it after adding or removing products.
 */

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SITE = 'https://decorsbysai.com'
const PROJECT = 'decor-by-saiscreations-l-ffacd'
const API_KEY = 'AIzaSyAxhXSId8aAXOeqfkWwyeeNlEd3bn_DdcU' // public web config key

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml')

// Only pages that are actually indexable. Anything rendering <SEO noindex> stays out.
const STATIC_PAGES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/decors', changefreq: 'weekly', priority: '0.9' },
  { loc: '/rentals', changefreq: 'weekly', priority: '0.9' },
  { loc: '/products', changefreq: 'weekly', priority: '0.8' },
  { loc: '/gallery', changefreq: 'weekly', priority: '0.8' },
  { loc: '/reviews', changefreq: 'weekly', priority: '0.7' },
  { loc: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
]

async function fetchProducts() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/products?key=${API_KEY}&pageSize=300`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Firestore returned ${res.status}`)
  const body = await res.json()
  return (body.documents || []).map((doc) => ({
    id: doc.name.split('/').pop(),
    updated: (doc.fields?.updatedAt?.timestampValue || doc.updateTime || '').slice(0, 10),
  }))
}

const today = new Date().toISOString().slice(0, 10)
const products = await fetchProducts()

const entries = [
  ...STATIC_PAGES.map((page) => ({ ...page, lastmod: today })),
  ...products.map((product) => ({
    loc: `/product/${product.id}`,
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: product.updated || today,
  })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${SITE}${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

await writeFile(OUT, xml)
console.log(`Wrote ${OUT}`)
console.log(`${STATIC_PAGES.length} pages + ${products.length} products = ${entries.length} URLs`)
