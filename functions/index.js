const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const admin = require('firebase-admin')
const fetch = require('node-fetch')

admin.initializeApp()
const db = admin.firestore()

/*
  ┌─────────────────────────────────────────────────────────────────┐
  │  ADMIN 2FA — Telegram OTP for admin accounts only              │
  │                                                                 │
  │  Normal users: email/password + Google sign-in (Firebase Auth)  │
  │  Admin users:  after normal login → Telegram OTP 2nd factor    │
  │                                                                 │
  │  SETUP:                                                         │
  │  1. Create Telegram Bot via @BotFather → get bot token         │
  │  2. Set secret: firebase functions:secrets:set TELEGRAM_BOT_TOKEN│
  │  3. Admin users need telegramChatId in their Firestore doc     │
  │  4. Deploy: firebase deploy --only functions                    │
  │  5. First admin: set role='admin' + telegramChatId in Firestore│
  └─────────────────────────────────────────────────────────────────┘
*/

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendTelegramMessage(chatId, text, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(`Telegram API error: ${data.description}`)
  return data
}

async function sendTelegramPhoto(chatId, photoUrl, caption, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: 'HTML',
    }),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(`Telegram API error: ${data.description}`)
  return data
}

async function sendTelegramItemPhotos(chatId, items, botToken) {
  const photoItems = (items || [])
    .map((item, index) => ({
      index: index + 1,
      name: item.name || 'Selected item',
      imageUrl: item.imageUrl,
      adminPrice: item.adminPrice || '',
    }))
    .filter((item) => item.imageUrl)

  if (photoItems.length === 0) return

  for (const item of photoItems) {
    await sendTelegramPhoto(
      chatId,
      item.imageUrl,
      `${item.index}. ${escapeHtml(item.name)}${item.adminPrice ? `\nAdmin price: ${escapeHtml(formatAdminPrice(item.adminPrice))}` : ''}`,
      botToken
    )
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parsePriceAmount(value) {
  const match = String(value || '').match(/\d[\d,]*(?:\.\d+)?/)
  const amount = match ? Number(match[0].replace(/,/g, '')) : 0
  return Number.isFinite(amount) ? amount : 0
}

function getAdminTotal(items = []) {
  return items.reduce((sum, item) => sum + parsePriceAmount(item.adminPrice), 0)
}

function formatAdminPrice(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  if (/^\$/.test(text)) return text
  if (/^\d[\d,]*(?:\.\d+)?(?:\b|\/)/.test(text)) return `$${text}`
  return text
}

function getAdminPriceLabel(item) {
  return item.adminPrice ? escapeHtml(formatAdminPrice(item.adminPrice)) : 'Not set'
}

function getProductLookup(item) {
  if (item.productId) {
    return { productId: item.productId, styleIndex: item.styleIndex ?? null }
  }

  const match = String(item.id || '').match(/^(.*)_style_(-?\d+)$/)
  if (match) {
    return { productId: match[1], styleIndex: Number(match[2]) }
  }

  return { productId: item.id || '', styleIndex: null }
}

async function enrichItemsWithAdminPrices(items = []) {
  const cache = new Map()

  return Promise.all(items.map(async (item) => {
    const lookup = getProductLookup(item)
    let pricing = null

    if (lookup.productId) {
      if (cache.has(lookup.productId)) {
        pricing = cache.get(lookup.productId)
      } else {
        const snap = await db.collection('productAdminPrices').doc(lookup.productId).get()
        pricing = snap.exists ? snap.data() : null
        cache.set(lookup.productId, pricing)
      }
    }

    const stylePrice = Number.isInteger(lookup.styleIndex) && lookup.styleIndex >= 0
      ? pricing?.styles?.[lookup.styleIndex]?.adminPrice
      : ''

    return {
      ...item,
      productId: lookup.productId || item.productId || '',
      styleIndex: lookup.styleIndex,
      adminPrice: stylePrice || pricing?.adminPrice || item.adminPrice || '',
    }
  }))
}

// ─── Send Admin OTP ───
// Called after admin successfully logs in with email/password or Google.
// Sends a 6-digit OTP to the admin's linked Telegram account.
exports.sendAdminTelegramOtp = onCall(
  { region: 'asia-south1', secrets: ['TELEGRAM_BOT_TOKEN'], cors: true },
  async (request) => {
    const { uid } = request.data
    if (!uid) throw new HttpsError('invalid-argument', 'User ID required')

    // Verify this user is actually an admin
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin accounts require 2FA')
    }

    const telegramChatId = userDoc.data().telegramChatId
    if (!telegramChatId) {
      throw new HttpsError(
        'failed-precondition',
        'No Telegram account linked. Please ask the system administrator to add your Telegram Chat ID.'
      )
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      throw new HttpsError('failed-precondition', 'Telegram bot token not configured')
    }

    const otp = generateOtp()
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 5 * 60 * 1000)
    )

    await db.collection('adminOtpVerifications').doc(uid).set({
      otp,
      uid,
      expiresAt,
      attempts: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    const message =
      `🔐 <b>Sais Creation — Admin Verification</b>\n\n` +
      `Your admin OTP is: <code>${otp}</code>\n\n` +
      `This code expires in 5 minutes.\n` +
      `If you didn't request this, change your password immediately.`

    await sendTelegramMessage(telegramChatId, message, botToken)

    return { success: true, message: 'OTP sent to your Telegram' }
  }
)

// ─── Verify Admin OTP ───
// Verifies the 6-digit OTP entered by the admin after initial login.
exports.verifyAdminTelegramOtp = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const { uid, otp } = request.data
    if (!uid || !otp) throw new HttpsError('invalid-argument', 'User ID and OTP required')

    // Verify admin role
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      throw new HttpsError('permission-denied', 'Invalid request')
    }

    const otpDoc = await db.collection('adminOtpVerifications').doc(uid).get()
    if (!otpDoc.exists) {
      throw new HttpsError('not-found', 'No OTP request found. Please request a new one.')
    }

    const otpData = otpDoc.data()

    // Rate limit: max 5 attempts
    if (otpData.attempts >= 5) {
      await db.collection('adminOtpVerifications').doc(uid).delete()
      throw new HttpsError('resource-exhausted', 'Too many attempts. Please request a new OTP.')
    }

    await db.collection('adminOtpVerifications').doc(uid).update({
      attempts: admin.firestore.FieldValue.increment(1),
    })

    // Check expiry
    if (otpData.expiresAt.toDate() < new Date()) {
      await db.collection('adminOtpVerifications').doc(uid).delete()
      throw new HttpsError('deadline-exceeded', 'OTP has expired. Please request a new one.')
    }

    // Validate OTP
    if (otpData.otp !== otp) {
      throw new HttpsError('permission-denied', 'Invalid OTP. Please try again.')
    }

    // Clean up
    await db.collection('adminOtpVerifications').doc(uid).delete()

    return { success: true }
  }
)

exports.notifyNewOrder = onDocumentCreated(
  {
    document: 'orders/{orderId}',
    region: 'asia-south1',
    secrets: ['TELEGRAM_BOT_TOKEN'],
  },
  async (event) => {
    const order = event.data?.data()
    if (!order) return

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) return

    const adminsSnap = await db
      .collection('users')
      .where('role', '==', 'admin')
      .get()

    const items = await enrichItemsWithAdminPrices(order.items || [])
    const adminTotal = getAdminTotal(items)
    await event.data.ref.update({
      items,
      adminTotal,
      adminPricesResolvedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    const itemsList = items
      .map((item, i) => `  ${i + 1}. ${escapeHtml(item.name || 'Selected item')} - Admin price: ${getAdminPriceLabel(item)}`)
      .join('\n')

    const message =
      `📋 <b>New Quote Request!</b>\n\n` +
      `<b>Customer:</b> ${escapeHtml(order.customerName)}\n` +
      `<b>Phone:</b> ${escapeHtml(order.customerPhone)}\n` +
      `\n<b>Items (${items.length}):</b>\n${itemsList}\n\n` +
      `<b>Admin Total:</b> ${adminTotal > 0 ? `$${adminTotal.toFixed(2)}` : 'Not set'}\n\n` +
      `Item photos will be sent below.`

    for (const adminDoc of adminsSnap.docs) {
      const chatId = adminDoc.data().telegramChatId
      if (chatId) {
        try {
          await sendTelegramMessage(chatId, message, botToken)
          await sendTelegramItemPhotos(chatId, items, botToken)
        } catch {}
      }
    }
  }
)
