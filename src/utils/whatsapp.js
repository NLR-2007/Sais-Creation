export const WHATSAPP_NUMBER = '14083874854'

const FALLBACK_ORIGIN = 'https://decorsbysai.com'

export function siteOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return FALLBACK_ORIGIN
}

export function productUrl(productId) {
  return productId ? `${siteOrigin()}/product/${productId}` : ''
}

export function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// Product enquiry sent from a product page — includes name, price, product link and photo
// so the shop knows exactly which item (and style) the customer is asking about.
export function buildProductEnquiry({ name, price, description, productId, imageUrl }) {
  const lines = ["Hi Sais Creation! I'm interested in this product:", '', `*${name}*`]
  if (description) lines.push(description)
  if (price) lines.push(`Price: ${price}`)
  lines.push('')
  // Image first: WhatsApp builds its preview card from the first URL in the message,
  // so the customer's chat shows the product photo.
  if (imageUrl) lines.push(`Image: ${imageUrl}`)
  const link = productUrl(productId)
  if (link) lines.push(`Product link: ${link}`)
  lines.push('', 'Is this available?')
  return lines.join('\n')
}
