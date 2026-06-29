import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { db } from '../config/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  Sparkles, Menu, X, ArrowRight, ArrowLeft, Image as ImageIcon,
  LogIn, LogOut, Shield, Gem, Heart, ChevronLeft, ChevronRight, ShoppingCart,
} from 'lucide-react'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const fadeUp = isMobile
  ? { hidden: { opacity: 0 }, visible: () => ({ opacity: 1, transition: { duration: 0.3 } }) }
  : {
      hidden: { opacity: 0, y: 40 },
      visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
      }),
    }

const staggerContainer = isMobile
  ? { hidden: {}, visible: {} }
  : { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

function Navbar({ user, isAdmin, onLogout, cartCount }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={isMobile ? false : { y: -100 }} animate={{ y: 0 }}
      transition={isMobile ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className={`mx-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled
          ? `max-w-6xl mt-3 mx-3 sm:mx-6 lg:mx-auto ${mobileOpen ? 'rounded-[1.75rem]' : 'rounded-full'} bg-[#FBF7F0] md:bg-[#FBF7F0]/90 md:backdrop-blur-xl border border-[#B07D3F]/20 shadow-[0_18px_50px_-12px_rgba(59,31,43,0.18)] px-5 sm:px-7`
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 border border-transparent'
      }`}>
        <div className="flex items-center justify-between py-3 md:py-3.5">
          <div className="flex items-center gap-3 group">
            <Link to="/" className="relative w-11 h-11 flex items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-[10px] border border-[#B07D3F]/60 bg-gradient-to-br from-[#F3EADC]/80 to-transparent group-hover:rotate-[135deg] group-hover:border-[#7B2D43]/50 transition-all duration-700 shadow-[0_4px_14px_-4px_rgba(176,125,63,0.4)]" />
              <Sparkles className="w-[18px] h-[18px] text-[#7B2D43]" strokeWidth={1.5} />
            </Link>
            <div className="leading-none">
              <Link to="/" className="font-display text-2xl md:text-[26px] font-semibold text-[#2B2118] tracking-wide block group-hover:text-[#7B2D43] transition-colors duration-300">
                Sais Creation
              </Link>
              <span className="font-accent font-light text-[8.5px] tracking-[0.5em] uppercase text-[#B07D3F]">
                <Link to="/rentals" className="hover:text-[#7B2D43] transition-colors duration-300">Rentals</Link>
                {' · '}
                <Link to="/decors" className="hover:text-[#7B2D43] transition-colors duration-300">Decor</Link>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Home
            </Link>
            <span className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#7B2D43] px-4 py-2 rounded-full bg-[#7B2D43]/[0.06]">
              Gallery
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-[#7B2D43]" />
            </span>
            <Link to="/rentals" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Rentals
            </Link>
            <Link to="/decors" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Decors
            </Link>
            <a href="/#about" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              About
            </a>
            <a href="/#contact" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#7B2D43] border border-[#7B2D43]/25 hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                    <Shield className="w-4 h-4" strokeWidth={1.5} /> Admin
                  </Link>
                )}
                <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/25 hover:bg-white/50 transition-all duration-300">
                  <LogOut className="w-4 h-4" strokeWidth={1.5} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/25 hover:bg-white/50 transition-all duration-300">
                <LogIn className="w-4 h-4" strokeWidth={1.5} /> Login
              </Link>
            )}
            <Link to="/cart" aria-label="View cart"
              className="relative p-2.5 rounded-full text-[#2B2118]/70 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/30 hover:bg-white/60 hover:shadow-[0_6px_18px_-6px_rgba(59,31,43,0.2)] transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-[#8E3650] to-[#6A2438] text-[#FBF7F0] text-[10px] font-accent font-semibold rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(123,45,67,0.5)] ring-2 ring-[#FBF7F0]">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-full text-[#2B2118]/75 hover:text-[#7B2D43] hover:bg-white/60 transition-all duration-300">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className={`md:hidden overflow-hidden ${scrolled ? '' : 'rounded-[1.75rem] bg-[#FBF7F0] border border-[#B07D3F]/15 shadow-[0_24px_60px_-16px_rgba(59,31,43,0.25)] mb-3'}`}
            >
              <div className="px-3 py-4 space-y-1">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Home <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </Link>
                <Link to="/rentals" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Rentals <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </Link>
                <Link to="/decors" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Decors <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </Link>
                <a href="/#about" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  About <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </a>
                <a href="/#contact" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Contact <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </a>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                        <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Admin</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#7B2D43]/60" />
                      </Link>
                    )}
                    <button onClick={() => { onLogout(); setMobileOpen(false) }} className="w-full flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                      <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#7B2D43]/60" />
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                    <span className="flex items-center gap-2"><LogIn className="w-4 h-4" /> Login</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7B2D43]/60" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default function GalleryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const { user, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (!cancelled) setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        if (!cancelled) setImages([])
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const openLightbox = (index) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)
  const navigateLightbox = (dir) => {
    if (lightbox === null) return
    setLightbox((lightbox + dir + images.length) % images.length)
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <SEO
        title="Event Gallery - Wedding, Birthday & Party Decoration Photos"
        description="View our portfolio of stunning event decorations: wedding receptions, birthday parties, baby showers, corporate galas, and more. See real events styled by Sais Creation in San Jose, CA."
        path="/gallery"
      />
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} cartCount={cartCount} />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(243,234,220,0.9),transparent_75%)]" />
          <div className="hidden md:block absolute top-[10%] right-[10%] w-80 h-80 rounded-full bg-[#D9A5A0]/20 blur-[100px]" />
          <div className="hidden md:block absolute bottom-[10%] left-[10%] w-96 h-96 rounded-full bg-[#E2BF7E]/20 blur-[110px]" />
        </div>
        <div className="grain" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#7B2D43]/70 hover:text-[#7B2D43] transition-colors duration-300">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }} className="text-center">
            <span className="inline-flex items-center gap-2.5 font-accent font-light text-[11px] tracking-[0.4em] uppercase mb-6 px-5 py-2 rounded-full border text-[#B07D3F] border-[#B07D3F]/25 bg-white/50 shadow-[0_2px_10px_rgba(59,31,43,0.04)]">
              <span className="block w-1 h-1 rounded-full bg-[#B07D3F]" />
              Our Portfolio
              <span className="block w-1 h-1 rounded-full bg-[#B07D3F]" />
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#2B2118] leading-[1.08] tracking-[-0.01em] mb-4">
              Moments We{' '}
              <em className="bronze-shimmer font-medium italic">Created</em>
            </h1>
            <p className="font-body text-[15px] md:text-lg text-[#2B2118]/80 md:text-[#2B2118]/55 max-w-2xl mx-auto leading-relaxed italic">
              A glimpse into the celebrations we've brought to life — each one crafted with love and artistry
            </p>

            <div className="flex items-center justify-center gap-4 mt-8">
              <span className="block h-px w-16 bg-gradient-to-r from-transparent to-[#B07D3F]/60" />
              <span className="block w-1.5 h-1.5 rounded-full bg-[#B07D3F]/60" />
              <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#B07D3F]/30 bg-[#B07D3F]/5">
                <Gem className="w-3.5 h-3.5 text-[#B07D3F]" strokeWidth={1.2} />
              </span>
              <span className="block w-1.5 h-1.5 rounded-full bg-[#B07D3F]/60" />
              <span className="block h-px w-16 bg-gradient-to-l from-transparent to-[#B07D3F]/60" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        <div className="hidden md:block absolute top-[5%] -left-28 w-[26rem] h-[26rem] rounded-full bg-[#F2D9D2]/25 blur-[120px]" />
        <div className="hidden md:block absolute bottom-[5%] -right-28 w-[26rem] h-[26rem] rounded-full bg-[#E2BF7E]/15 blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F] mb-8 text-center">
            {images.length} {images.length === 1 ? 'photo' : 'photos'}
          </div>

          {loading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="break-inside-avoid bg-[#F3EADC] rounded-[1.25rem] animate-pulse" style={{ height: 200 + (i % 3) * 80 }} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-[#B07D3F]/30" strokeWidth={1} />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#2B2118]/70 mb-2">Gallery coming soon</h3>
              <p className="font-body italic text-[15px] text-[#2B2118]/65 md:text-[#2B2118]/40">Photos of our beautiful work will be added shortly</p>
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((img, i) => (
                <motion.div
                  key={img.id}
                  variants={fadeUp}
                  custom={i * 0.3}
                  className="group relative break-inside-avoid rounded-[1.25rem] overflow-hidden cursor-pointer shadow-[0_4px_16px_-6px_rgba(59,31,43,0.15)] hover:shadow-[0_24px_60px_-18px_rgba(59,31,43,0.35)] transition-shadow duration-700"
                  onClick={() => openLightbox(i)}
                >
                  {img.imageUrl ? (
                    <img
                      src={img.imageUrl}
                      alt={img.label || 'Gallery photo'}
                      className="w-full h-auto object-contain group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/50 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-[#B07D3F]/20" strokeWidth={1} />
                    </div>
                  )}

                  <span className="absolute inset-3 border border-white/0 group-hover:border-white/60 rounded-[0.9rem] transition-all duration-500 pointer-events-none" />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#3B1F2B]/85 via-[#3B1F2B]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                    <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      {img.label && (
                        <p className="font-display text-lg italic font-medium text-[#FBF7F0]">{img.label}</p>
                      )}
                      <p className="font-accent font-light text-[10px] text-[#D9A5A0] tracking-[0.3em] uppercase mt-1 flex items-center gap-2">
                        View <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && images[lightbox] && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeLightbox}
              className="fixed inset-0 bg-[#2E1822]/90 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-4 md:inset-12 z-[60] flex items-center justify-center"
            >
              <button onClick={closeLightbox} className="absolute top-2 right-2 md:top-4 md:right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 z-10">
                <X className="w-5 h-5" />
              </button>

              {images.length > 1 && (
                <>
                  <button onClick={() => navigateLightbox(-1)} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 z-10">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigateLightbox(1)} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 z-10">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <img
                src={images[lightbox].imageUrl}
                alt={images[lightbox].label || 'Gallery photo'}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]"
                onClick={(e) => e.stopPropagation()}
              />

              {images[lightbox].label && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/10">
                  <p className="font-display italic text-white text-sm">{images[lightbox].label}</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#2E1822] relative overflow-hidden rounded-t-[2.5rem] md:rounded-t-[3rem]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D9A5A0]/30 to-transparent" />
        <div className="grain" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <span className="absolute inset-0 rotate-45 rounded-[8px] border border-[#D9A5A0]/50 bg-[#D9A5A0]/[0.06]" />
                <Sparkles className="w-3.5 h-3.5 text-[#D9A5A0]" strokeWidth={1.5} />
              </div>
              <span className="font-display text-xl font-semibold text-[#FBF7F0]">Sais Creation</span>
            </div>
            <p className="font-accent font-light text-[10px] text-[#FBF7F0]/30 tracking-[0.25em] uppercase">
              &copy; {new Date().getFullYear()} Sais Creation · All rights reserved
            </p>
            <p className="font-accent font-light text-[10px] text-[#FBF7F0]/30 tracking-[0.25em] uppercase">
              Developed by{' '}
              <a href="https://nlrgroupofcompany.in" target="_blank" rel="noopener noreferrer" className="text-[#D9A5A0]/70 hover:text-[#D9A5A0] underline underline-offset-4 decoration-[#D9A5A0]/30 hover:decoration-[#D9A5A0]/70 transition-colors duration-300">
                NLR Group of Companies
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
