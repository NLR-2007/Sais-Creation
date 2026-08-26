/**
 * One-time repair for photos already in Firebase Storage.
 *
 * Uploads made before the compressor was fixed are 2-3 MB PNGs saved under a .webp
 * name (Safari's canvas ignores an unsupported encode type and hands back PNG), and
 * every object carries Storage's default "Cache-Control: private, max-age=0" so
 * nothing is ever cached. Together that is why the site crawls on mobile.
 *
 * This rewrites each oversized object IN PLACE — same bucket path, same download
 * token — so every URL already stored in Firestore keeps working untouched. No
 * Firestore writes happen at all.
 *
 * Usage:
 *   cd scripts && npm install
 *   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccount.json   (PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS=...)
 *   node optimize-storage-images.mjs                 # dry run, reports what it would do
 *   node optimize-storage-images.mjs --apply         # actually rewrite
 *   node optimize-storage-images.mjs --apply --limit 20   # try a small batch first
 *
 * A service-account key comes from Firebase console → Project settings →
 * Service accounts → Generate new private key.
 */

import admin from 'firebase-admin'
import sharp from 'sharp'

const BUCKET = 'decor-by-saiscreations-l-ffacd.firebasestorage.app'
const MAX_DIMENSION = 1600
const TARGET_BYTES = 250_000
const REENCODE_ABOVE_BYTES = 400_000
const CACHE_CONTROL = 'public, max-age=31536000, immutable'
const PREFIXES = ['products/', 'gallery/', 'categories/', 'site-content/', 'reviews/']

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const limitArg = args.indexOf('--limit')
const limit = limitArg !== -1 ? Number(args[limitArg + 1]) : Infinity

admin.initializeApp({ storageBucket: BUCKET })
const bucket = admin.storage().bucket()

const isImage = (file) => /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)

function format(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function reencode(buffer) {
  const image = sharp(buffer, { failOn: 'none' }).rotate() // rotate() applies EXIF orientation
  const meta = await image.metadata()
  const needsResize = Math.max(meta.width || 0, meta.height || 0) > MAX_DIMENSION

  let quality = 80
  let output = null

  for (let attempt = 0; attempt < 4; attempt += 1) {
    let pipeline = sharp(buffer, { failOn: 'none' }).rotate()
    if (needsResize) {
      pipeline = pipeline.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    }
    output = await pipeline.webp({ quality, effort: 5 }).toBuffer()
    if (output.length <= TARGET_BYTES) break
    quality -= 12
  }

  return output
}

async function run() {
  let scanned = 0
  let rewritten = 0
  let metadataOnly = 0
  let saved = 0
  let failed = 0

  for (const prefix of PREFIXES) {
    const [files] = await bucket.getFiles({ prefix })

    for (const file of files) {
      if (!isImage(file) || rewritten + metadataOnly >= limit) continue
      scanned += 1

      const [meta] = await file.getMetadata()
      const size = Number(meta.size)
      const token = meta.metadata?.firebaseStorageDownloadTokens
      const cacheable = meta.cacheControl === CACHE_CONTROL

      if (size <= REENCODE_ABOVE_BYTES) {
        // Small enough already — it just needs a cache header.
        if (cacheable) continue
        metadataOnly += 1
        console.log(`cache  ${file.name} (${format(size)})`)
        if (apply) {
          await file.setMetadata({ cacheControl: CACHE_CONTROL })
        }
        continue
      }

      try {
        const [buffer] = await file.download()
        const output = await reencode(buffer)

        if (!output || output.length >= size) {
          console.log(`skip   ${file.name} — re-encode was not smaller`)
          continue
        }

        rewritten += 1
        saved += size - output.length
        console.log(`shrink ${file.name}  ${format(size)} -> ${format(output.length)}`)

        if (apply) {
          await file.save(output, {
            resumable: false,
            contentType: 'image/webp',
            metadata: {
              cacheControl: CACHE_CONTROL,
              // Preserving the token keeps the existing ?token=... download URL valid,
              // so nothing in Firestore has to change.
              ...(token ? { metadata: { firebaseStorageDownloadTokens: token } } : {}),
            },
          })
        }
      } catch (err) {
        failed += 1
        console.log(`FAIL   ${file.name} — ${err.message}`)
      }
    }
  }

  console.log('\n──────────────────────────────')
  console.log(`${apply ? 'Rewritten' : 'Would rewrite'}: ${rewritten} images`)
  console.log(`${apply ? 'Cache header set' : 'Would set cache header'}: ${metadataOnly} images`)
  console.log(`Scanned: ${scanned}   Failed: ${failed}`)
  console.log(`Storage/bandwidth saved: ${format(saved)}`)
  if (!apply) console.log('\nDry run — nothing was changed. Re-run with --apply.')
}

run().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})
