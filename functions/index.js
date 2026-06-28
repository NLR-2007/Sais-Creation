const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const nodemailer = require('nodemailer')

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

// ─── Send Quote via Email ───
// Sends a formatted email to both the admin and the customer (if email provided).
exports.sendQuoteEmail = onCall(
  {
    region: 'asia-south1',
    secrets: ['SMTP_PASSWORD'],
    cors: true,
  },
  async (request) => {
    const { orderId } = request.data
    if (!orderId) throw new HttpsError('invalid-argument', 'Order ID required')

    const orderDoc = await db.collection('orders').doc(orderId).get()
    if (!orderDoc.exists) throw new HttpsError('not-found', 'Order not found')

    const order = orderDoc.data()
    const smtpEmail = 'saicreations729@gmail.com'
    const smtpPassword = process.env.SMTP_PASSWORD

    if (!smtpPassword) {
      throw new HttpsError('failed-precondition', 'Email password not configured')
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpEmail, pass: smtpPassword },
    })

    const itemsHtml = (order.items || [])
      .map(
        (item, i) =>
          `<tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e8df;color:#2B2118;font-size:14px;">${i + 1}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0e8df;color:#2B2118;font-size:14px;">${item.name}</td>
            ${item.imageUrl ? `<td style="padding:10px 12px;border-bottom:1px solid #f0e8df;"><img src="${item.imageUrl}" alt="${item.name}" width="60" height="60" style="border-radius:8px;object-fit:contain;" /></td>` : '<td style="padding:10px 12px;border-bottom:1px solid #f0e8df;color:#999;font-size:12px;">No image</td>'}
          </tr>`
      )
      .join('')

    const emailHtml = `
      <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#FBF7F0;border-radius:16px;overflow:hidden;border:1px solid #e8ddd0;">
        <div style="background:linear-gradient(135deg,#7B2D43,#5C1F31);padding:32px 24px;text-align:center;">
          <h1 style="color:#FBF7F0;font-size:24px;margin:0 0 4px;">✨ Sais Creation</h1>
          <p style="color:#D9A5A0;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0;">New Quote Request</p>
        </div>
        <div style="padding:28px 24px;">
          <h2 style="color:#7B2D43;font-size:16px;letter-spacing:2px;text-transform:uppercase;border-bottom:2px solid #D9A5A0;padding-bottom:8px;margin-top:0;">Customer Details</h2>
          <table style="width:100%;margin-bottom:24px;">
            <tr><td style="padding:6px 0;color:#B07D3F;font-size:13px;width:100px;">Name</td><td style="padding:6px 0;color:#2B2118;font-size:14px;font-weight:600;">${order.customerName}</td></tr>
            <tr><td style="padding:6px 0;color:#B07D3F;font-size:13px;">Phone</td><td style="padding:6px 0;color:#2B2118;font-size:14px;">${order.customerPhone}</td></tr>
            ${order.customerEmail ? `<tr><td style="padding:6px 0;color:#B07D3F;font-size:13px;">Email</td><td style="padding:6px 0;color:#2B2118;font-size:14px;">${order.customerEmail}</td></tr>` : ''}
          </table>
          <h2 style="color:#7B2D43;font-size:16px;letter-spacing:2px;text-transform:uppercase;border-bottom:2px solid #D9A5A0;padding-bottom:8px;">Requested Items (${(order.items || []).length})</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#F3EADC;">
                <th style="padding:10px 12px;text-align:left;color:#B07D3F;font-size:11px;letter-spacing:1px;text-transform:uppercase;">#</th>
                <th style="padding:10px 12px;text-align:left;color:#B07D3F;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Item</th>
                <th style="padding:10px 12px;text-align:left;color:#B07D3F;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Photo</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>
        <div style="background:#F3EADC;padding:16px 24px;text-align:center;">
          <p style="color:#B07D3F;font-size:11px;margin:0;">Sais Creations Decor Service & Party Rentals LLC · San Jose, CA</p>
        </div>
      </div>
    `

    const subject = `New Quote Request from ${order.customerName} — ${(order.items || []).length} items`

    await transporter.sendMail({
      from: `"Sais Creation" <${smtpEmail}>`,
      to: smtpEmail,
      subject,
      html: emailHtml,
    })

    if (order.customerEmail) {
      const customerHtml = `
        <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#FBF7F0;border-radius:16px;overflow:hidden;border:1px solid #e8ddd0;">
          <div style="background:linear-gradient(135deg,#7B2D43,#5C1F31);padding:32px 24px;text-align:center;">
            <h1 style="color:#FBF7F0;font-size:24px;margin:0 0 4px;">✨ Sais Creation</h1>
            <p style="color:#D9A5A0;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0;">Quote Confirmation</p>
          </div>
          <div style="padding:28px 24px;">
            <p style="color:#2B2118;font-size:15px;line-height:1.6;">Hi ${order.customerName},</p>
            <p style="color:#2B2118;font-size:15px;line-height:1.6;">Thank you for your interest! We've received your quote request for <strong>${(order.items || []).length} item(s)</strong>. Our team will review your requirements and get back to you shortly with pricing and availability.</p>
            <h2 style="color:#7B2D43;font-size:16px;letter-spacing:2px;text-transform:uppercase;border-bottom:2px solid #D9A5A0;padding-bottom:8px;">Your Requested Items</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tbody>
                ${(order.items || []).map((item, i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e8df;color:#2B2118;font-size:14px;">${i + 1}. ${item.name}</td></tr>`).join('')}
              </tbody>
            </table>
            <p style="color:#2B2118;font-size:15px;line-height:1.6;margin-top:20px;">We'll be in touch soon! You can also reach us on WhatsApp at <strong>+1 (408) 387-4854</strong>.</p>
          </div>
          <div style="background:#F3EADC;padding:16px 24px;text-align:center;">
            <p style="color:#B07D3F;font-size:11px;margin:0;">Sais Creations Decor Service & Party Rentals LLC · San Jose, CA</p>
          </div>
        </div>
      `
      await transporter.sendMail({
        from: `"Sais Creation" <${smtpEmail}>`,
        to: order.customerEmail,
        subject: `Your Quote Request — Sais Creation`,
        html: customerHtml,
      })
    }

    await db.collection('orders').doc(orderId).update({ sentVia: 'email' })

    return { success: true }
  }
)

// ─── Telegram Notification on New Order ───
// Automatically notifies admin via Telegram when a new quote/order is created.
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

    const itemsList = (order.items || [])
      .map((item, i) => `  ${i + 1}. ${item.name}`)
      .join('\n')

    const message =
      `📋 <b>New Quote Request!</b>\n\n` +
      `<b>Customer:</b> ${order.customerName}\n` +
      `<b>Phone:</b> ${order.customerPhone}\n` +
      `${order.customerEmail ? `<b>Email:</b> ${order.customerEmail}\n` : ''}` +
      `\n<b>Items (${(order.items || []).length}):</b>\n${itemsList}\n\n` +
      `Check the admin panel for details.`

    for (const adminDoc of adminsSnap.docs) {
      const chatId = adminDoc.data().telegramChatId
      if (chatId) {
        try {
          await sendTelegramMessage(chatId, message, botToken)
        } catch {}
      }
    }
  }
)
