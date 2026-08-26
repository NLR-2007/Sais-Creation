// Every uploaded photo is re-encoded in the browser before it reaches Storage.
//
// The previous version asked canvas.toBlob() for image/webp and renamed the file
// to .webp regardless of what came back. Safari (and some Android WebViews) ignore
// an unsupported type and hand back a PNG instead, so phone uploads were stored as
// 2-3 MB PNGs labelled .webp — which is why the live gallery was multi-megabytes per
// photo. We now check what the encoder actually produced and re-encode until the
// blob fits a byte budget.

const MAX_DIMENSION = 1600
const TARGET_BYTES = 250_000
const HARD_CAP_BYTES = 600_000
const MIN_QUALITY = 0.45
const START_QUALITY = 0.82

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

export default async function compressImage(file) {
  if (!file?.type?.startsWith('image/')) return file

  let img
  try {
    img = await loadImage(file)
  } catch {
    // HEIC and other formats the browser cannot decode — upload untouched rather
    // than losing the photo. Storage still gets the right content type.
    return file
  }

  const type = bestSupportedType()
  let { width, height } = scaleToFit(img.naturalWidth, img.naturalHeight, MAX_DIMENSION)

  // Already small enough and within bounds: don't re-encode and lose quality.
  if (width === img.naturalWidth && height === img.naturalHeight && file.size <= TARGET_BYTES) {
    return file
  }

  let blob = null
  let quality = START_QUALITY

  // Drop quality first, then dimensions, until the photo fits the budget.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    blob = await toBlob(draw(img, width, height), type, quality)
    if (!blob) return file
    if (blob.size <= TARGET_BYTES) break

    if (quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.12)
    } else {
      const next = scaleToFit(width, height, Math.round(Math.max(width, height) * 0.75))
      width = next.width
      height = next.height
    }
  }

  // If the encoder ignored our type (blob.type tells the truth) or somehow produced
  // something larger than the original, keep whichever file is smaller.
  if (blob.size >= file.size && file.size <= HARD_CAP_BYTES) return file

  return new File([blob], renameTo(file.name, blob.type), { type: blob.type })
}
