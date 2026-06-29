import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import {
  Phone, ArrowRight, Sparkles, User, Mail, Lock, MapPin, ChevronLeft, Eye, EyeOff, Globe,
} from 'lucide-react'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const fadeUp = isMobile
  ? { hidden: { opacity: 0 }, visible: () => ({ opacity: 1, transition: { duration: 0.3 } }) }
  : {
      hidden: { opacity: 0, y: 30 },
      visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
      }),
    }

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
]

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

export default function Register() {
  const { user, userProfile, isAdmin, loginWithGoogle, registerWithEmail } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+91',
    countryName: 'India',
    phone: '',
    address: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [countryOpen, setCountryOpen] = useState(false)

  useEffect(() => {
    if (user && userProfile) {
      navigate(isAdmin ? '/admin' : '/', { replace: true })
    }
  }, [user, userProfile, isAdmin, navigate])

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === form.countryCode && c.country === form.countryName) || COUNTRY_CODES[0]

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Please enter your full name'); return }
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) { setError('Please enter a valid email address'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (!form.phone.trim()) { setError('Please enter your phone number'); return }

    setLoading(true)
    try {
      await registerWithEmail({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.replace(/\D/g, ''),
        countryCode: form.countryCode,
        address: form.address.trim(),
      })
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Use at least 6 characters'
        : err.code === 'auth/invalid-email'
        ? 'Please enter a valid email address'
        : err.message || 'Registration failed. Please try again.'
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

  return (
    <div className="min-h-screen bg-[#FBF7F0] relative overflow-hidden flex items-center justify-center px-4 py-12">
      <SEO title="Create Account" description="Create a Sais Creation account to request quotes, track orders, and get personalized party decor recommendations." path="/register" noindex />
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden md:block absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#7B2D43]/[0.06] blur-[120px]" />
        <div className="hidden md:block absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#D9A5A0]/[0.08] blur-[120px]" />
        <div className="hidden md:block absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-[#B07D3F]/[0.04] blur-[80px]" />
      </div>
      <div className="grain" />

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.25em] uppercase text-[#2B2118]/50 hover:text-[#7B2D43] transition-colors duration-300 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
        Home
      </Link>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center mb-8">
          <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <span className="absolute inset-0 rotate-45 rounded-[12px] border border-[#B07D3F]/50 bg-gradient-to-br from-[#F3EADC]/80 to-transparent shadow-[0_8px_24px_-8px_rgba(176,125,63,0.35)]" />
            <Sparkles className="w-5 h-5 text-[#7B2D43] relative z-10" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118] mb-1.5">
            Create Account
          </h1>
          <p className="font-body italic text-sm text-[#2B2118]/50">
            Join the Sais Creation experience
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="relative bg-white md:bg-white/70 md:backdrop-blur-xl rounded-[2rem] border border-[#B07D3F]/15 shadow-[0_20px_60px_-20px_rgba(59,31,43,0.15),0_4px_16px_rgba(59,31,43,0.05)] p-7 md:p-9 overflow-hidden"
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

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <span className="flex-1 h-px bg-[#B07D3F]/15" />
            <span className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#2B2118]/30">or</span>
            <span className="flex-1 h-px bg-[#B07D3F]/15" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B07D3F]"><User className="w-4 h-4" strokeWidth={1.5} /></span>
                <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Your full name" className="lux-field" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Email Address (Optional)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B07D3F]"><Mail className="w-4 h-4" strokeWidth={1.5} /></span>
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="your@email.com" className="lux-field" />
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B07D3F]"><Lock className="w-4 h-4" strokeWidth={1.5} /></span>
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Min 6 characters" className="lux-field !pr-11" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B07D3F]/50 hover:text-[#7B2D43] transition-colors duration-300">
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B07D3F]"><Lock className="w-4 h-4" strokeWidth={1.5} /></span>
                  <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} placeholder="Re-enter password" className="lux-field" required />
                </div>
              </div>
            </div>

            {/* Phone with country code */}
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                {/* Country code selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCountryOpen(!countryOpen)}
                    className="flex items-center gap-1.5 h-full px-4 py-3.5 bg-white border border-[#B07D3F]/25 rounded-full font-accent text-[13px] text-[#2B2118] shadow-[var(--shadow-sm)] hover:border-[#B07D3F]/40 transition-all duration-300 whitespace-nowrap"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="text-[#2B2118]/70">{selectedCountry.code}</span>
                    <Globe className="w-3 h-3 text-[#B07D3F]/50" strokeWidth={1.5} />
                  </button>

                  <AnimatePresence>
                    {countryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 mt-2 w-64 max-h-52 overflow-y-auto bg-white rounded-2xl border border-[#B07D3F]/15 shadow-[var(--shadow-lg)] z-30 scrollbar-hide"
                      >
                        {COUNTRY_CODES.map((c, i) => (
                          <button
                            key={`${c.code}-${c.country}-${i}`}
                            type="button"
                            onClick={() => { setForm(prev => ({ ...prev, countryCode: c.code, countryName: c.country })); setCountryOpen(false) }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F3EADC]/60 transition-colors duration-200 ${
                              form.countryCode === c.code && form.countryName === c.country ? 'bg-[#7B2D43]/[0.06]' : ''
                            }`}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="font-accent text-[12px] text-[#2B2118]/70 flex-1">{c.country}</span>
                            <span className="font-accent text-[12px] text-[#B07D3F]">{c.code}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative flex-1">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B07D3F]"><Phone className="w-4 h-4" strokeWidth={1.5} /></span>
                  <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="98765 43210" className="lux-field" required />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1.5">Address</label>
              <div className="relative">
                <span className="absolute left-5 top-4 text-[#B07D3F]"><MapPin className="w-4 h-4" strokeWidth={1.5} /></span>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Your full address"
                  className="lux-field !pl-12"
                  rows={2}
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="px-5 py-3.5 rounded-2xl bg-[#7B2D43]/[0.07] border border-[#7B2D43]/15 text-[#7B2D43] font-body text-[13px]"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
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
              <span className="relative z-10">{loading ? 'Creating Account...' : 'Save Profile & Register'}</span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 pt-5 border-t border-[#B07D3F]/10 text-center">
            <p className="font-body text-[13px] text-[#2B2118]/45">
              Already have an account?{' '}
              <Link to="/login" className="text-[#7B2D43] font-medium hover:text-[#5C1F31] underline underline-offset-4 decoration-[#7B2D43]/30 hover:decoration-[#7B2D43]/70 transition-colors duration-300">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Click-away for country dropdown */}
      {countryOpen && <div className="fixed inset-0 z-10" onClick={() => setCountryOpen(false)} />}
    </div>
  )
}
