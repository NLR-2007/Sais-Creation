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
// Clarity first: photos keep their original pixel dimensions unless they are huge.
// Almost all of the saving comes from re-encoding PNG to WebP, not from downscaling,
// so a 2.5 MB PNG becomes a ~250 KB WebP that looks identical at the same size.
const MAX_DIMENSION = 2000
const QUALITY = 92
const MIN_QUALITY = 82
const TARGET_BYTES = 900_000
const REENCODE_ABOVE_BYTES = 400_000
const CACHE_CONTROL = 'public, max-age=31536000, immutable'
const PREFIXES = ['products/', 'gallery/', 'categories/', 'site-content/', 'reviews/']

const args = process.argv.slice(2)
const apply = args.includes('--apply')
// --scan reads object metadata only. No downloads, so it costs nothing in egress
// and finishes in seconds, unlike a dry run which fetches every file to measure it.
const scanOnly = args.includes('--scan')
const limitArg = args.indexOf('--limit')
const limit = limitArg !== -1 ? Number(args[limitArg + 1]) : Infinity

admin.initializeApp({ storageBucket: BUCKET })
const bucket = admin.storage().bucket()

const isImage = (file) => /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)

function format(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function reencode(buffer) {
  const meta = await sharp(buffer, { failOn: 'none' }).metadata()
  const needsResize = Math.max(meta.width || 0, meta.height || 0) > MAX_DIMENSION

  let quality = QUALITY
  let output = null

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let pipeline = sharp(buffer, { failOn: 'none' }).rotate() // applies EXIF orientation
    if (needsResize) {
      pipeline = pipeline.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    }
    // smartSubsample keeps chroma at full resolution — decor photos are full of
    // saturated pinks and golds, which is exactly where subsampling shows.
    output = await pipeline.webp({ quality, effort: 4, smartSubsample: true }).toBuffer()
    if (output.length <= TARGET_BYTES || quality <= MIN_QUALITY) break
    quality = Math.max(MIN_QUALITY, quality - 8)
  }

  return { output, resized: needsResize, width: meta.width, height: meta.height, quality }
}

async function scan() {
  const buckets = { tiny: 0, ok: 0, big: 0, huge: 0 }
  let total = 0
  let bytes = 0
  let uncached = 0

  for (const prefix of PREFIXES) {
    const [files] = await bucket.getFiles({ prefix })
    const images = files.filter(isImage)
    let prefixBytes = 0

    for (const file of images) {
      const size = Number(file.metadata.size)
      total += 1
      bytes += size
      prefixBytes += size
      if (file.metadata.cacheControl !== CACHE_CONTROL) uncached += 1
      if (size < 100_000) buckets.tiny += 1
      else if (size <= REENCODE_ABOVE_BYTES) buckets.ok += 1
      else if (size < 1_500_000) buckets.big += 1
      else buckets.huge += 1
    }

    console.log(`${prefix.padEnd(16)} ${String(images.length).padStart(5)} images   ${format(prefixBytes)}`)
  }

  console.log('')
  console.log('──────────────────────────────')
  console.log(`Total images:      ${total}`)
  console.log(`Total size:        ${format(bytes)}`)
  console.log(`Average:           ${format(bytes / (total || 1))}`)
  console.log(`Missing cache hdr: ${uncached}`)
  console.log('')
  console.log(`Under 100 KB:      ${buckets.tiny}`)
  console.log(`100-400 KB:        ${buckets.ok}`)
  console.log(`400 KB - 1.5 MB:   ${buckets.big}   <- will be re-encoded`)
  console.log(`Over 1.5 MB:       ${buckets.huge}   <- will be re-encoded`)
}

// Each image is an independent download / encode / upload, so the job is bound by
// network latency rather than CPU. A small pool of workers cuts a multi-hour run to
// well under an hour. Re-running is safe: anything already repaired is skipped.
const CONCURRENCY = 12

async function processFile(file, stats) {
  const meta = file.metadata
  const size = Number(meta.size)
  const token = meta.metadata?.firebaseStorageDownloadTokens
  const cacheable = meta.cacheControl === CACHE_CONTROL

  // Anything this script has already handled is WebP with our cache header on it.
  // Without this guard a second run would re-download and re-encode every repaired
  // file over 400 KB for no benefit.
  if (cacheable && meta.contentType === 'image/webp') return

  if (size <= REENCODE_ABOVE_BYTES) {
    if (cacheable) return // already repaired on an earlier run
    stats.metadataOnly += 1
    if (apply) await file.setMetadata({ cacheControl: CACHE_CONTROL })
    console.log(`cache  ${file.name} (${format(size)})`)
    return
  }

  const [buffer] = await file.download()
  const { output, resized, width, height, quality } = await reencode(buffer)

  if (!output || output.length >= size) {
    // Already well compressed. It still needs the cache header, which is the whole
    // point for a file this size.
    if (!cacheable) {
      stats.metadataOnly += 1
      if (apply) await file.setMetadata({ cacheControl: CACHE_CONTROL })
    }
    console.log(`skip   ${file.name} - re-encode was not smaller, cache header set`)
    return
  }

  if (apply) {
    await file.save(output, {
      resumable: false,
      contentType: 'image/webp',
      metadata: {
        cacheControl: CACHE_CONTROL,
        // Preserving the token keeps the existing ?token=... URL valid, so nothing
        // in Firestore has to change.
        ...(token ? { metadata: { firebaseStorageDownloadTokens: token } } : {}),
      },
    })
  }

  stats.rewritten += 1
  stats.saved += size - output.length
  const dimensions = resized ? `${width}x${height} -> max ${MAX_DIMENSION}px` : `${width}x${height} kept`
  console.log(`shrink ${file.name}  ${format(size)} -> ${format(output.length)}  (${dimensions}, q${quality})`)
}

async function run() {
  const stats = { rewritten: 0, metadataOnly: 0, saved: 0, failed: 0 }
  const started = Date.now()
  let scanned = 0

  for (const prefix of PREFIXES) {
    const [all] = await bucket.getFiles({ prefix })
    const files = all.filter(isImage)
    console.log('')
    console.log(`== ${prefix} (${files.length} images)`)

    let next = 0
    const worker = async () => {
      while (true) {
        const index = next
        next += 1
        if (index >= files.length) return
        if (stats.rewritten + stats.metadataOnly >= limit) return

        scanned += 1
        try {
          await processFile(files[index], stats)
        } catch (err) {
          stats.failed += 1
          console.log(`FAIL   ${files[index].name} - ${err.message}`)
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  }

  const minutes = ((Date.now() - started) / 60000).toFixed(1)
  console.log('')
  console.log('------------------------------')
  console.log(`${apply ? 'Rewritten' : 'Would rewrite'}: ${stats.rewritten} images`)
  console.log(`${apply ? 'Cache header set' : 'Would set cache header'}: ${stats.metadataOnly} images`)
  console.log(`Scanned: ${scanned}   Failed: ${stats.failed}`)
  console.log(`Storage/bandwidth saved: ${format(stats.saved)}`)
  console.log(`Elapsed: ${minutes} min`)
  if (!apply) console.log('Dry run - nothing was changed. Re-run with --apply.')
}

const main = scanOnly ? scan : run

main().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})
