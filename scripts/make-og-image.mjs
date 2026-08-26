/**
 * Builds public/og-image.jpg — the picture WhatsApp, Facebook and X show when
 * someone shares a link to the site.
 *
 * index.html pointed at /og-image.jpg but no such file existed, so Vercel's SPA
 * rewrite answered every crawler with index.html and no preview ever rendered.
 *
 * The source is one of the gallery photos the client already flagged "show on home",
 * fitted (not cropped) onto a 1200x630 card in the site's cream so the whole setup
 * stays visible. To use a different photo, pass its URL:
 *
 *   node make-og-image.mjs                  # uses the default photo below
 *   node make-og-image.mjs "https://..."    # any image URL or local path
 */

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

// "Halfsaree Event Decor" — the gallery photo set to home priority 1.
const DEFAULT_SOURCE = 'https://firebasestorage.googleapis.com/v0/b/decor-by-saiscreations-l-ffacd.firebasestorage.app/o/gallery%2F1783387017699_IMG_9166.webp?alt=media&token=b1bb535e-eb11-4403-8d97-9e6803764f37'

const WIDTH = 1200
const HEIGHT = 630
const BACKGROUND = { r: 0xfb, g: 0xf7, b: 0xf0 } // #FBF7F0, the site background

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og-image.jpg')

async function readSource(source) {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source)
    if (!res.ok) throw new Error(`Could not fetch source image: ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  }
  return sharp(source).toBuffer()
}

const source = process.argv[2] || DEFAULT_SOURCE
const input = await readSource(source)

const output = await sharp(input)
  .rotate()
  .resize(WIDTH, HEIGHT, { fit: 'contain', background: BACKGROUND })
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toBuffer()

await writeFile(OUT, output)

const { width, height } = await sharp(output).metadata()
console.log(`Wrote ${OUT}`)
console.log(`${width}x${height}, ${(output.length / 1024).toFixed(0)} KB`)
