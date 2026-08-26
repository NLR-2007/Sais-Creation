// Every uploaded photo is re-encoded in the browser before it reaches Storage.
//
// The previous version asked canvas.toBlob() for image/webp and renamed the file
// to .webp regardless of what came back. Safari (and some Android WebViews) ignore
// an unsupported type and hand back a PNG instead, so phone uploads were stored as
// 2-3 MB PNGs labelled .webp — which is why the live gallery was multi-megabytes per
// photo. We now check what the encoder actually produced and re-encode until the
// blob fits a byte budget.

// Quality is deliberately generous: the saving comes from re-encoding to WebP, not
// from shrinking the picture. A phone photo keeps its detail and still lands around
// a tenth of its original weight. Only genuinely huge photos get resized at all.
const MAX_DIMENSION = 2000
const TARGET_BYTES = 450_000
const HARD_CAP_BYTES = 700_000
const MIN_QUALITY = 0.75
const START_QUALITY = 0.92

const HEIC_PATTERN = /\.(heic|heif)$/i

let supportedType

// canvas.toBlob() silently substitutes PNG for a type it cannot encode, so probe
// the encoder once with a 1px canvas and trust only what it echoes back.
function bestSupportedType() {
  if (supportedType) return supportedType
  const probe = document.createElement('canvas')
  probe.width = 1
  probe.height = 1
  supportedType = probe.toDataURL('image/webp').startsWith('data:image/webp')
    ? 'image/webp'
    : 'image/jpeg'
  return supportedType
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not decode image'))
    }
    img.src = url
  })
}

function scaleToFit(width, height, maxDimension) {
  if (width <= maxDimension && height <= maxDimension) return { width, height }
  const ratio = Math.min(maxDimension / width, maxDimension / height)
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) }
}

function draw(img, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  // JPEG has no alpha — paint the sheet white so transparent PNGs don't turn black.
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

// The extension must follow what the encoder actually produced, not what we asked
// for — mislabelling is exactly how the 2 MB "webp" files got created.
const EXTENSIONS = { 'image/webp': '.webp', 'image/jpeg': '.jpg', 'image/png': '.png' }

function renameTo(name, type) {
  return name.replace(/\.[^.]+$/, '') + (EXTENSIONS[type] || '.jpg')
}

// iPhones shoot HEIC. iOS Safari usually converts to JPEG on upload, but a HEIC that
// reaches us from a Mac, a file transfer or another browser cannot be decoded by any
// canvas — it would sail through uncompressed at 3-5 MB. The converter is imported
// only when one actually turns up, so it costs nothing on a normal upload.
async function decodeHeic(file) {
  const { default: heic2any } = await import('heic2any')
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.94 })
  const blob = Array.isArray(converted) ? converted[0] : converted
  return new File([blob], file.name.replace(HEIC_PATTERN, '.jpg'), { type: 'image/jpeg' })
}

function isHeic(file) {
  return /image\/hei[cf]/i.test(file.type || '') || HEIC_PATTERN.test(file.name || '')
}

export default async function compressImage(file) {
  if (!file) return file

  let source = file
  if (isHeic(file)) {
    try {
      source = await decodeHeic(file)
    } catch {
      return file // better an oversized upload than a lost photo
    }
  }

  if (!source.type?.startsWith('image/')) return source

  let img
  try {
    img = await loadImage(source)
  } catch {
    // A format this browser cannot decode — upload it untouched rather than
    // losing the photo entirely.
    return source
  }

  const type = bestSupportedType()
  let { width, height } = scaleToFit(img.naturalWidth, img.naturalHeight, MAX_DIMENSION)

  // Already small enough and within bounds: don't re-encode and lose quality.
  if (width === img.naturalWidth && height === img.naturalHeight && source.size <= TARGET_BYTES) {
    return source
  }

  let blob = null
  let quality = START_QUALITY

  // Drop quality first, then dimensions, until the photo fits the budget.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    blob = await toBlob(draw(img, width, height), type, quality)
    if (!blob) return source
    if (blob.size <= TARGET_BYTES) break

    if (quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.05)
    } else {
      const next = scaleToFit(width, height, Math.round(Math.max(width, height) * 0.75))
      width = next.width
      height = next.height
    }
  }

  // If the encoder ignored our type (blob.type tells the truth) or somehow produced
  // something larger than the original, keep whichever file is smaller.
  if (blob.size >= source.size && source.size <= HARD_CAP_BYTES) return source

  return new File([blob], renameTo(source.name, blob.type), { type: blob.type })
}
