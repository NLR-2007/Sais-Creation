const { onCall, HttpsError } = require('firebase-functions/v2/https')
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
