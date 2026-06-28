const MAX_WIDTH = 1200
const MAX_HEIGHT = 1200
const QUALITY = 0.82

export default function compressImage(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width <= MAX_WIDTH && height <= MAX_HEIGHT && file.size < 500_000) {
        resolve(file)
        return
      }

      if (width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width))
        width = MAX_WIDTH
      }
      if (height > MAX_HEIGHT) {
        width = Math.round(width * (MAX_HEIGHT / height))
        height = MAX_HEIGHT
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.webp'),
            { type: 'image/webp' }
          )
          resolve(compressed)
        },
        'image/webp',
        QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }

    img.src = url
  })
}
