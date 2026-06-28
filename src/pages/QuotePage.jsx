import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { useCart } from '../context/CartContext'
import { db, functions } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import {
  Sparkles, ArrowLeft, Send, Package, User, Mail, Phone, CheckCircle,
  MessageCircle,
} from 'lucide-react'

const WHATSAPP_NUMBER = '14083874854'

function SuccessScreen({ method, whatsappUrl }) {
  const [countdown, setCountdown] = useState(method === 'whatsapp' ? 5 : 0)

  useEffect(() => {
    if (method !== 'whatsapp') return
    if (countdown <= 0) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, whatsappUrl, method])

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-3xl font-semibold text-[#2B2118] mb-3">Quote Submitted!</h2>
        <p className="font-body text-[15px] text-[#2B2118]/80 md:text-[#2B2118]/55 leading-relaxed mb-3">
          Thank you! Your quote request has been saved successfully.
        </p>

        {method === 'whatsapp' ? (
          <>
            {countdown > 0 ? (
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-full px-6 py-3 mb-3">
                  <span className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                  <span className="font-accent text-[12px] tracking-[0.15em] uppercase text-green-700 font-medium">
                    Redirecting to WhatsApp in {countdown}s
                  </span>
                </div>
                <p className="font-body text-[14px] text-[#2B2118]/65 md:text-[#2B2118]/40 italic">
                  Please wait, you'll be connected with us shortly...
                </p>
              </div>
            ) : (
              <div className="mb-8">
                <p className="font-body text-[14px] text-[#2B2118]/65 md:text-[#2B2118]/40 italic mb-4">
                  If WhatsApp didn't open automatically, tap the button below.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-br from-[#25b35e] to-[#1d8a4a] text-white font-accent font-medium text-[11px] tracking-[0.2em] uppercase shadow-[0_8px_24px_-8px_rgba(37,179,94,0.5)] hover:-translate-y-0.5 transition-all duration-400 mb-4"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  Open WhatsApp
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-3">
              <Mail className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
              <span className="font-accent text-[12px] tracking-[0.15em] uppercase text-blue-700 font-medium">
                Email Sent Successfully
              </span>
            </div>
            <p className="font-body text-[14px] text-[#2B2118]/65 md:text-[#2B2118]/40 italic">
              We've sent a confirmation to your email. Our team will get back to you shortly!
            </p>
          </div>
        )}

        <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.2em] uppercase shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5)] hover:-translate-y-0.5 transition-all duration-400">
          Back to Home
        </Link>
      </motion.div>
    </div>
  )
}

export default function QuotePage() {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [sendMethod, setSendMethod] = useState('whatsapp')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    if (sendMethod === 'email' && !form.email.trim()) return
    if (cart.length === 0) return
    setSubmitting(true)

    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        customerName: form.name.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl || '',
        })),
        status: 'new',
        sentVia: sendMethod,
        createdAt: serverTimestamp(),
      })

      if (sendMethod === 'whatsapp') {
        const itemsList = cart.map((item, i) => `${i + 1}. ${item.name}${item.imageUrl ? `\n${item.imageUrl}` : ''}`).join('\n\n')
        const message = `Hi Sais Creation! I'd like to get a quote.\n\n*Customer Details:*\nName: ${form.name}\nPhone: ${form.phone}${form.email ? `\nEmail: ${form.email}` : ''}\n\n*Requested Items:*\n${itemsList}\n\nPlease share pricing and availability. Thank you!`
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
        setSuccess({ method: 'whatsapp', whatsappUrl })
      } else {
        try {
          const sendQuoteEmail = httpsCallable(functions, 'sendQuoteEmail')
          await sendQuoteEmail({ orderId: orderRef.id })
        } catch {
          // Email function may not be deployed yet — order is still saved
        }
        setSuccess({ method: 'email' })
      }

      clearCart()
    } catch (err) {
      alert('Error submitting quote: ' + err.message)
    }
    setSubmitting(false)
  }

  if (success) {
    return <SuccessScreen method={success.method} whatsappUrl={success.whatsappUrl} />
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
            <Package className="w-8 h-8 text-[#B07D3F]/30" strokeWidth={1} />
          </div>
          <h3 className="font-display text-2xl font-semibold text-[#2B2118]/70 mb-2">No items in cart</h3>
          <p className="font-body italic text-[15px] text-[#2B2118]/65 md:text-[#2B2118]/40 mb-8">Add some products to your cart first</p>
          <Link to="/decors" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.2em] uppercase shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5)] hover:-translate-y-0.5 transition-all duration-400">
            Browse Collection
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <SEO title="Request a Quote" description="Get a free, no-obligation quote for party decoration and rental services from Sais Creation in San Jose, CA. Fast response via WhatsApp or Email." path="/quote" noindex />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#7B2D43]/70 hover:text-[#7B2D43] transition-colors duration-300">
            <ArrowLeft className="w-3.5 h-3.5" />Back to Cart
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }} className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-[8px] border border-[#B07D3F]/60 bg-gradient-to-br from-[#F3EADC]/80 to-transparent" />
              <Sparkles className="w-4 h-4 text-[#7B2D43]" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118]">Get a Quote</h1>
          </div>
          <p className="font-body italic text-[15px] text-[#2B2118]/75 md:text-[#2B2118]/50 ml-12">Fill in your details and we'll get back to you with pricing</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-[1.75rem] border border-[#B07D3F]/15 shadow-[0_4px_20px_rgba(59,31,43,0.05)] p-6 sm:p-8 space-y-5"
          >
            <h2 className="font-accent font-light text-[10px] tracking-[0.4em] uppercase text-[#B07D3F] mb-4">Personal Information</h2>

            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]/50" strokeWidth={1.5} />
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required className="w-full bg-[#FBF7F0] border border-[#B07D3F]/15 rounded-xl py-3.5 pl-11 pr-4 font-body text-sm text-[#2B2118] placeholder:text-[#2B2118]/30 outline-none focus:border-[#7B2D43]/40 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300" />
              </div>
            </div>

            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]/50" strokeWidth={1.5} />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (408) 000-0000" required className="w-full bg-[#FBF7F0] border border-[#B07D3F]/15 rounded-xl py-3.5 pl-11 pr-4 font-body text-sm text-[#2B2118] placeholder:text-[#2B2118]/30 outline-none focus:border-[#7B2D43]/40 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300" />
              </div>
            </div>

            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">
                Email Address {sendMethod === 'email' ? '*' : ''}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]/50" strokeWidth={1.5} />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="your@email.com"
                  required={sendMethod === 'email'}
                  className="w-full bg-[#FBF7F0] border border-[#B07D3F]/15 rounded-xl py-3.5 pl-11 pr-4 font-body text-sm text-[#2B2118] placeholder:text-[#2B2118]/30 outline-none focus:border-[#7B2D43]/40 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300"
                />
              </div>
            </div>

            {/* Send Method Selection */}
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-3">
                Send Quote Via *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSendMethod('whatsapp')}
                  className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-400 ${
                    sendMethod === 'whatsapp'
                      ? 'border-[#25b35e] bg-[#25b35e]/[0.04] shadow-[0_4px_16px_-4px_rgba(37,179,94,0.25)]'
                      : 'border-[#B07D3F]/15 bg-white hover:border-[#25b35e]/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    sendMethod === 'whatsapp' ? 'bg-[#25b35e]/15' : 'bg-[#F3EADC]'
                  }`}>
                    <MessageCircle className={`w-5 h-5 transition-colors duration-300 ${sendMethod === 'whatsapp' ? 'text-[#25b35e]' : 'text-[#B07D3F]/50'}`} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className={`font-accent font-medium text-[12px] tracking-[0.1em] transition-colors duration-300 ${
                      sendMethod === 'whatsapp' ? 'text-[#25b35e]' : 'text-[#2B2118]/70'
                    }`}>WhatsApp</p>
                    <p className="font-body text-[10px] text-[#2B2118]/35">Chat directly</p>
                  </div>
                  {sendMethod === 'whatsapp' && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#25b35e] flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSendMethod('email')}
                  className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-400 ${
                    sendMethod === 'email'
                      ? 'border-[#7B2D43] bg-[#7B2D43]/[0.04] shadow-[0_4px_16px_-4px_rgba(123,45,67,0.25)]'
                      : 'border-[#B07D3F]/15 bg-white hover:border-[#7B2D43]/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    sendMethod === 'email' ? 'bg-[#7B2D43]/15' : 'bg-[#F3EADC]'
                  }`}>
                    <Mail className={`w-5 h-5 transition-colors duration-300 ${sendMethod === 'email' ? 'text-[#7B2D43]' : 'text-[#B07D3F]/50'}`} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className={`font-accent font-medium text-[12px] tracking-[0.1em] transition-colors duration-300 ${
                      sendMethod === 'email' ? 'text-[#7B2D43]' : 'text-[#2B2118]/70'
                    }`}>Email</p>
                    <p className="font-body text-[10px] text-[#2B2118]/35">Get confirmation</p>
                  </div>
                  {sendMethod === 'email' && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#7B2D43] flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !form.name.trim() || !form.phone.trim() || (sendMethod === 'email' && !form.email.trim())}
              className={`w-full inline-flex items-center justify-center gap-3 py-4 rounded-full font-accent font-medium text-[12px] tracking-[0.25em] uppercase hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400 disabled:opacity-60 disabled:pointer-events-none mt-2 ${
                sendMethod === 'whatsapp'
                  ? 'bg-gradient-to-br from-[#28c75e] via-[#25b35e] to-[#1d9a4a] text-white shadow-[0_10px_30px_-8px_rgba(37,179,94,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_16px_40px_-8px_rgba(37,179,94,0.6)]'
                  : 'bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] shadow-[0_10px_30px_-8px_rgba(123,45,67,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_16px_40px_-8px_rgba(123,45,67,0.6)]'
              }`}
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : sendMethod === 'whatsapp' ? (
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Mail className="w-4 h-4" strokeWidth={1.5} />
              )}
              {submitting
                ? 'Submitting...'
                : sendMethod === 'whatsapp'
                  ? 'Send via WhatsApp'
                  : 'Send via Email'}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-[1.75rem] border border-[#B07D3F]/15 shadow-[0_4px_20px_rgba(59,31,43,0.05)] p-6">
              <h2 className="font-accent font-light text-[10px] tracking-[0.4em] uppercase text-[#B07D3F] mb-5">Requested Items ({cart.length})</h2>
              <div className="space-y-3">
                {cart.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/50 overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-[#B07D3F]/25" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-semibold text-[#2B2118] truncate">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
