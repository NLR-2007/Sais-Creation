import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import {
  Phone, ArrowRight, Shield, Sparkles, Gem, Eye, EyeOff, KeyRound, ChevronLeft, Mail, Lock,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Login() {
  const { user, userProfile, isAdmin, adminVerified, loginWithEmail, loginWithMobile, loginWithGoogle, sendAdminOtp, verifyAdminOtp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('email') // 'email' | 'mobile'
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Derive step from auth state — no setState needed
  const needsAdminOtp = user && userProfile && isAdmin && !adminVerified
  const shouldRedirect = user && userProfile && (!isAdmin || adminVerified)

  useEffect(() => {
    if (shouldRedirect) {
      navigate(isAdmin && adminVerified ? '/admin' : '/', { replace: true })
    }
  }, [shouldRedirect, isAdmin, adminVerified, navigate])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'email') {
        if (!email.trim() || !password) { setError('Please enter email and password'); setLoading(false); return }
        await loginWithEmail(email.trim(), password)
      } else {
        if (!phone.trim() || !password) { setError('Please enter mobile number and password'); setLoading(false); return }
        await loginWithMobile(phone.replace(/\D/g, ''), password)
      }
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential'
        ? 'Invalid credentials. Please check and try again.'
        : err.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : err.message || 'Login failed. Please try again.'
      setError(msg)
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed')
      }
    }
    setGoogleLoading(false)
  }

  // Admin OTP handlers
  const handleSendAdminOtp = async () => {
    setError('')
    setLoading(true)
    try {
      await sendAdminOtp()
      setCountdown(60)
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    }
    setLoading(false)
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`admin-otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`admin-otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) setOtp(pasted.split(''))
  }

  const handleVerifyAdminOtp = async (e) => {
    e.preventDefault()
    setError('')
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit OTP'); return }
    setLoading(true)
    try {
      await verifyAdminOtp(code)
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.')
    }
    setLoading(false)
  }

  // Admin OTP step
  if (needsAdminOtp) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] relative overflow-hidden flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#D9A5A0]/[0.08] blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#7B2D43]/[0.06] blur-[120px]" />
        </div>
        <div className="grain" />

        <div className="relative z-10 w-full max-w-md">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center mb-8">
            <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-dashed border-[#7B2D43]/30 animate-spin" style={{ animationDuration: '20s' }} />
              <Shield className="w-7 h-7 text-[#7B2D43]" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-3xl font-semibold text-[#2B2118] mb-2">Admin Verification</h1>
            <p className="font-body italic text-sm text-[#2B2118]/50">Two-factor authentication via Telegram</p>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="relative bg-white/70 backdrop-blur-xl rounded-[2rem] border border-[#B07D3F]/15 shadow-[0_20px_60px_-20px_rgba(59,31,43,0.15)] p-8 md:p-10 overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7B2D43]/30 to-transparent" />

            <div className="flex items-center justify-center gap-2.5 mb-7">
              <span className="flex items-center gap-2 font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#7B2D43] px-4 py-2 rounded-full border border-[#7B2D43]/20 bg-[#7B2D43]/[0.04]">
                <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                Admin 2FA Required
              </span>
            </div>

            {countdown === 0 && otp.every((d) => d === '') ? (
              <div className="text-center">
                <p className="font-body text-sm text-[#2B2118]/55 mb-6">
                  We need to verify your admin identity. Click below to receive a one-time code on your Telegram.
                </p>
                <button
                  onClick={handleSendAdminOtp}
                  disabled={loading}
                  className="w-full group relative inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[12px] tracking-[0.22em] uppercase px-10 py-[18px] overflow-hidden shadow-[0_12px_32px_-10px_rgba(123,45,67,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-500 hover:shadow-[0_22px_50px_-12px_rgba(123,45,67,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
                >
                  <span className="shine absolute top-0 bottom-0 w-1/3 bg-white/30 -translate-x-[150%]" />
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <KeyRound className="w-4 h-4 relative z-10" strokeWidth={1.8} />}
                  <span className="relative z-10">{loading ? 'Sending...' : 'Send OTP to Telegram'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyAdminOtp}>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/60 border border-[#B07D3F]/20 flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(176,125,63,0.3)]">
                    <KeyRound className="w-5 h-5 text-[#7B2D43]" strokeWidth={1.5} />
                  </div>
                  <p className="font-body text-sm text-[#2B2118]/60">Enter the code sent to your Telegram</p>
                </div>

                <div className="flex justify-center gap-2.5 mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`admin-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                      className="w-12 h-14 md:w-14 md:h-16 text-center font-display text-2xl font-semibold text-[#2B2118] bg-white border border-[#B07D3F]/25 rounded-xl shadow-[0_2px_8px_rgba(59,31,43,0.04)] outline-none transition-all duration-300 focus:border-[#7B2D43]/55 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.08),0_10px_30px_rgba(59,31,43,0.1)] hover:border-[#B07D3F]/40"
                    />
                  ))}
                </div>

                <div className="text-center mb-6">
                  {countdown > 0 ? (
                    <p className="font-accent font-light text-[11px] tracking-[0.15em] text-[#2B2118]/40">
                      Resend in <span className="text-[#7B2D43] font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button type="button" onClick={handleSendAdminOtp} disabled={loading} className="font-accent font-light text-[11px] tracking-[0.15em] text-[#7B2D43] underline underline-offset-4 decoration-[#7B2D43]/30 hover:decoration-[#7B2D43]/70 transition-colors duration-300">
                      Resend OTP
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="mb-5 px-5 py-3.5 rounded-2xl bg-[#7B2D43]/[0.07] border border-[#7B2D43]/15 text-[#7B2D43] font-body text-[13px]">
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full group relative inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[12px] tracking-[0.22em] uppercase px-10 py-[18px] overflow-hidden shadow-[0_12px_32px_-10px_rgba(123,45,67,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-500 hover:shadow-[0_22px_50px_-12px_rgba(123,45,67,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4 relative z-10" strokeWidth={1.8} />}
                  <span className="relative z-10">{loading ? 'Verifying...' : 'Verify & Access Admin'}</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // Normal login step
  return (
    <div className="min-h-screen bg-[#FBF7F0] relative overflow-hidden flex items-center justify-center px-4 py-12">
      <SEO title="Sign In" description="Sign in to your Sais Creation account to manage orders, save favorites, and get personalized party decor quotes." path="/login" noindex />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#D9A5A0]/[0.08] blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#7B2D43]/[0.06] blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#B07D3F]/[0.04] blur-[80px]" />
      </div>
      <div className="grain" />

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.25em] uppercase text-[#2B2118]/50 hover:text-[#7B2D43] transition-colors duration-300 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
        Home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center mb-8">
          <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <span className="absolute inset-0 rotate-45 rounded-[12px] border border-[#B07D3F]/50 bg-gradient-to-br from-[#F3EADC]/80 to-transparent shadow-[0_8px_24px_-8px_rgba(176,125,63,0.35)]" />
            <Sparkles className="w-5 h-5 text-[#7B2D43] relative z-10" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118] mb-1.5">Welcome Back</h1>
          <p className="font-body italic text-sm text-[#2B2118]/50">Sign in to your Sais Creation account</p>
        </motion.div>

        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="relative bg-white/70 backdrop-blur-xl rounded-[2rem] border border-[#B07D3F]/15 shadow-[0_20px_60px_-20px_rgba(59,31,43,0.15),0_4px_16px_rgba(59,31,43,0.05)] p-7 md:p-9 overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B07D3F]/30 to-transparent" />

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full border border-[#B07D3F]/20 bg-white hover:bg-[#F3EADC]/50 hover:border-[#B07D3F]/35 shadow-[0_2px_8px_rgba(59,31,43,0.04)] hover:shadow-[0_6px_18px_rgba(59,31,43,0.08)] transition-all duration-400 font-accent text-[12px] tracking-[0.12em] text-[#2B2118]/70 disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-[#B07D3F]/30 border-t-[#7B2D43] rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <span className="flex-1 h-px bg-[#B07D3F]/15" />
            <span className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#2B2118]/30">or</span>
            <span className="flex-1 h-px bg-[#B07D3F]/15" />
          </div>

          {/* Mode toggle */}
          <div className="flex bg-[#F3EADC]/60 rounded-full p-1 mb-6 border border-[#B07D3F]/10">
            <button
              type="button"
              onClick={() => { setMode('email'); setError('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-accent text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ${
                mode === 'email'
                  ? 'bg-white text-[#7B2D43] shadow-[var(--shadow-sm)]'
                  : 'text-[#2B2118]/40 hover:text-[#2B2118]/60'
              }`}
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
              Email
            </button>
            <button
              type="button"
              onClick={() => { setMode('mobile'); setError('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-accent text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ${
                mode === 'mobile'
                  ? 'bg-white text-[#7B2D43] shadow-[var(--shadow-sm)]'
                  : 'text-[#2B2118]/40 hover:text-[#2B2118]/60'
              }`}
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
              Mobile
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'email' ? (
                <motion.div key="email" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.25 }}>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B07D3F]"><Mail className="w-4 h-4" strokeWidth={1.5} /></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="lux-field" autoFocus required />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="mobile" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B07D3F]"><Phone className="w-4 h-4" strokeWidth={1.5} /></span>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" className="lux-field" autoFocus required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B07D3F]"><Lock className="w-4 h-4" strokeWidth={1.5} /></span>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="lux-field !pr-11" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B07D3F]/50 hover:text-[#7B2D43] transition-colors duration-300">
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="px-5 py-3.5 rounded-2xl bg-[#7B2D43]/[0.07] border border-[#7B2D43]/15 text-[#7B2D43] font-body text-[13px]">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[12px] tracking-[0.22em] uppercase px-10 py-[18px] overflow-hidden shadow-[0_12px_32px_-10px_rgba(123,45,67,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-500 hover:shadow-[0_22px_50px_-12px_rgba(123,45,67,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
            >
              <span className="shine absolute top-0 bottom-0 w-1/3 bg-white/30 -translate-x-[150%]" />
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={1.8} />
              )}
              <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-[#B07D3F]/10 text-center">
            <p className="font-body text-[13px] text-[#2B2118]/45">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#7B2D43] font-medium hover:text-[#5C1F31] underline underline-offset-4 decoration-[#7B2D43]/30 hover:decoration-[#7B2D43]/70 transition-colors duration-300">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="flex items-center justify-center gap-6 mt-7">
          {[
            { icon: Shield, text: 'Encrypted' },
            { icon: Eye, text: 'Private' },
            { icon: Gem, text: 'Secure' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1.5 font-accent font-light text-[9px] tracking-[0.3em] uppercase text-[#B07D3F]/60">
              <Icon className="w-3 h-3" strokeWidth={1.3} />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
