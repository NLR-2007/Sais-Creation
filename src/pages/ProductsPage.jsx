import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { db } from '../config/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  Sparkles, Menu, X, Search, Tag, ShoppingCart, ArrowRight, ArrowLeft,
  Package, Heart, MessageCircle, Send, Filter, LogIn, LogOut, Shield, Gem,
  ChevronDown, Check, Eye,
} from 'lucide-react'

const WHATSAPP_NUMBER = '14083874854'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

function Navbar({ user, isAdmin, onLogout, pageType }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }} animate={{ y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className={`mx-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled
          ? `max-w-6xl mt-3 mx-3 sm:mx-6 lg:mx-auto ${mobileOpen ? 'rounded-[1.75rem]' : 'rounded-full'} bg-[#FBF7F0]/90 backdrop-blur-xl border border-[#B07D3F]/20 shadow-[0_18px_50px_-12px_rgba(59,31,43,0.18)] px-5 sm:px-7`
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
            <Link to="/" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300 group/nav">
              Home
            </Link>
            <Link to="/gallery" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300 group/nav">
              Gallery
            </Link>
            <Link to="/rentals" className={`relative font-accent font-light text-[12px] tracking-[0.25em] uppercase px-4 py-2 rounded-full transition-all duration-300 group/nav ${pageType === 'rentals' ? 'text-[#7B2D43] bg-[#7B2D43]/[0.06]' : 'text-[#2B2118]/65 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.05]'}`}>
              Rentals
              {pageType === 'rentals' && <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-[#7B2D43]" />}
            </Link>
            <Link to="/decors" className={`relative font-accent font-light text-[12px] tracking-[0.25em] uppercase px-4 py-2 rounded-full transition-all duration-300 group/nav ${pageType === 'decors' ? 'text-[#7B2D43] bg-[#7B2D43]/[0.06]' : 'text-[#2B2118]/65 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.05]'}`}>
              Decors
              {pageType === 'decors' && <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-[#7B2D43]" />}
            </Link>
            <a href="/#about" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300 group/nav">
              About
            </a>
            <a href="/#contact" className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300 group/nav">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#7B2D43] border border-[#7B2D43]/25 hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                    Admin
                  </Link>
                )}
                <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/25 hover:bg-white/50 transition-all duration-300">
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/25 hover:bg-white/50 transition-all duration-300">
                <LogIn className="w-4 h-4" strokeWidth={1.5} />
                Login
              </Link>
            )}
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
              className={`md:hidden overflow-hidden ${scrolled ? '' : 'rounded-[1.75rem] bg-[#FBF7F0]/95 backdrop-blur-xl border border-[#B07D3F]/15 shadow-[0_24px_60px_-16px_rgba(59,31,43,0.25)] mb-3'}`}
            >
              <div className="px-3 py-4 space-y-1">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Home <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </Link>
                <Link to="/gallery" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Gallery <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </Link>
                <Link to="/rentals" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Rentals <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </Link>
                <Link to="/decors" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Decors <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </Link>
                <a href="/#about" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  About <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </a>
                <a href="/#contact" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Contact <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                </a>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                        <span className="flex items-center gap-2"><Shield className="w-4 h-4" strokeWidth={1.5} /> Admin</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#7B2D43]/60" />
                      </Link>
                    )}
                    <button onClick={() => { onLogout(); setMobileOpen(false) }} className="w-full flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                      <span className="flex items-center gap-2"><LogOut className="w-4 h-4" strokeWidth={1.5} /> Logout</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#7B2D43]/60" />
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                    <span className="flex items-center gap-2"><LogIn className="w-4 h-4" strokeWidth={1.5} /> Login</span>
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

function ProductCard({ product, index, onAddToCart, inCart }) {
  return (
    <motion.div
      variants={fadeUp} custom={index}
      className="group relative bg-white rounded-[1.75rem] overflow-hidden border border-[#B07D3F]/15 shadow-[0_4px_16px_rgba(59,31,43,0.05)] hover:border-[#7B2D43]/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_36px_80px_-24px_rgba(59,31,43,0.3)]"
    >
      <div className="relative h-64 bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/50 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Package className="w-10 h-10 text-[#B07D3F]/25" strokeWidth={1} />
            <span className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#2B2118]/25">No Image</span>
          </div>
        )}

        {product.tag && (
          <span className="absolute top-4 left-4 z-10 font-accent font-medium text-[9px] tracking-[0.3em] uppercase bg-gradient-to-br from-[#8E3650] to-[#6A2438] text-[#FBF7F0] px-4 py-2 rounded-full shadow-[0_8px_20px_-6px_rgba(123,45,67,0.55)]">
            {product.tag}
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#2E1822]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-6 pb-7">
        <h3 className="font-display text-xl font-semibold text-[#2B2118] leading-snug mb-2 group-hover:text-[#7B2D43] transition-colors duration-500">
          {product.name}
        </h3>
        {product.desc && (
          <p className="font-body text-[14px] text-[#2B2118]/50 leading-relaxed line-clamp-2 mb-4">
            {product.desc}
          </p>
        )}

        <div className="flex gap-2.5">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full font-accent font-light text-[10px] tracking-[0.2em] uppercase border border-[#B07D3F]/25 text-[#7B2D43] bg-white hover:border-[#7B2D43]/40 hover:bg-[#7B2D43]/[0.04] transition-all duration-400"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
            Know More
          </Link>
          <button
            onClick={() => onAddToCart(product)}
            disabled={inCart}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full font-accent font-medium text-[10px] tracking-[0.2em] uppercase transition-all duration-400 ${
              inCart
                ? 'bg-green-50 text-green-700 border border-green-200 shadow-none cursor-default'
                : 'bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] shadow-[0_8px_20px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_12px_28px_-8px_rgba(123,45,67,0.6)] hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {inCart ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <ShoppingCart className="w-3.5 h-3.5" strokeWidth={1.6} />}
            {inCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProductsPage({ pageType }) {
  const [allProducts, setAllProducts] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const { addToCart, isInCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (!cancelled) setAllProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        if (!cancelled) setAllProducts([])
      }
      try {
        const cq = query(collection(db, 'categories'), orderBy('order', 'asc'))
        const csnap = await getDocs(cq)
        if (!cancelled) setAllCategories(csnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch { /* no categories yet */ }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const categories = pageType
    ? allCategories.filter((c) => (c.type || 'decors') === pageType)
    : allCategories

  const categoryIds = new Set(categories.map((c) => c.id))
  const products = pageType
    ? allProducts.filter((p) => p.categoryId && categoryIds.has(p.categoryId))
    : allProducts

  const isRentals = pageType === 'rentals'
  const pageTitle = isRentals ? 'Rentals' : pageType === 'decors' ? 'Decors' : 'Products'
  const pageSubtitle = isRentals
    ? 'Explore our premium rental items for your special occasions'
    : pageType === 'decors'
    ? 'Discover our curated collection of beautiful decor pieces'
    : 'Explore our complete collection of premium decor, curated pieces & event essentials'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleAddToCart = (product) => {
    addToCart(product)
  }

  const tags = [...new Set(products.map((p) => p.tag).filter(Boolean))]

  const filtered = products.filter((p) => {
    const matchesSearch = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || p.tag === selectedTag
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory
    return matchesSearch && matchesTag && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <SEO
        title={pageType === 'decors' ? 'Event Decoration Services - Wedding, Birthday & Party Decor' : pageType === 'rentals' ? 'Party Rental Equipment - Chairs, Tables, Tents & Sound Systems' : 'All Products - Decor & Rental Collection'}
        description={pageType === 'decors' ? 'Browse our premium event decoration collection: balloon artistry, stage backdrops, floral arrangements, and custom decor for weddings, birthdays, baby showers & corporate events in San Jose, CA.' : pageType === 'rentals' ? 'Rent high-quality party equipment in San Jose: chairs, tables, tents, canopies, lighting, sound systems, and stage setups. Delivery, setup & pickup included.' : 'Explore our complete collection of premium party decorations and rental equipment for events in San Jose, CA and the Bay Area.'}
        path={pageType ? `/${pageType}` : '/products'}
      />
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} pageType={pageType} />

      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(243,234,220,0.9),transparent_75%)]" />
          <div className="absolute top-[10%] left-[10%] w-80 h-80 rounded-full bg-[#D9A5A0]/20 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-[#E2BF7E]/20 blur-[110px]" />
        </div>
        <div className="grain" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <Link to="/" className="inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#7B2D43]/70 hover:text-[#7B2D43] transition-colors duration-300">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2.5 font-accent font-light text-[11px] tracking-[0.4em] uppercase mb-6 px-5 py-2 rounded-full border text-[#B07D3F] border-[#B07D3F]/25 bg-white/50 shadow-[0_2px_10px_rgba(59,31,43,0.04)]">
              <span className="block w-1 h-1 rounded-full bg-[#B07D3F]" />
              {isRentals ? 'Rental Collection' : pageType === 'decors' ? 'Decor Collection' : 'Our Collection'}
              <span className="block w-1 h-1 rounded-full bg-[#B07D3F]" />
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#2B2118] leading-[1.08] tracking-[-0.01em] mb-4">
              Browse All{' '}
              <em className="bronze-shimmer font-medium italic">{pageTitle}</em>
            </h1>
            <p className="font-body text-base md:text-lg text-[#2B2118]/55 max-w-2xl mx-auto leading-relaxed italic">
              {pageSubtitle}
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

      {/* Search & Filters */}
      <section className="sticky top-[72px] z-40 bg-[#FBF7F0]/90 backdrop-blur-xl border-b border-[#B07D3F]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${pageTitle.toLowerCase()}...`}
                className="w-full bg-white border border-[#B07D3F]/15 rounded-full py-3 pl-11 pr-4 font-body text-sm text-[#2B2118] placeholder:text-[#2B2118]/30 outline-none shadow-[0_2px_8px_rgba(59,31,43,0.04)] focus:border-[#7B2D43]/40 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300"
              />
            </div>

            {categories.length > 0 && (
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none w-full sm:w-auto bg-white border border-[#B07D3F]/15 rounded-full py-3 pl-5 pr-10 font-accent font-light text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/70 outline-none shadow-[0_2px_8px_rgba(59,31,43,0.04)] focus:border-[#7B2D43]/40 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B07D3F]/60 pointer-events-none" />
              </div>
            )}

            {tags.length > 0 && (
              <>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#B07D3F]/20 bg-white font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/60 hover:border-[#7B2D43]/30 transition-all duration-300"
                >
                  <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Filters
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className={`w-full sm:w-auto flex flex-wrap gap-2 ${showFilters ? '' : 'hidden sm:flex'}`}>
                  <button
                    onClick={() => setSelectedTag('')}
                    className={`px-4 py-2 rounded-full font-accent font-light text-[10px] tracking-[0.25em] uppercase border transition-all duration-300 ${
                      !selectedTag
                        ? 'bg-[#7B2D43] text-[#FBF7F0] border-[#7B2D43] shadow-[0_4px_14px_-4px_rgba(123,45,67,0.4)]'
                        : 'bg-white text-[#2B2118]/55 border-[#B07D3F]/15 hover:border-[#7B2D43]/30 hover:text-[#7B2D43]'
                    }`}
                  >
                    All
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-accent font-light text-[10px] tracking-[0.25em] uppercase border transition-all duration-300 ${
                        selectedTag === tag
                          ? 'bg-[#7B2D43] text-[#FBF7F0] border-[#7B2D43] shadow-[0_4px_14px_-4px_rgba(123,45,67,0.4)]'
                          : 'bg-white text-[#2B2118]/55 border-[#B07D3F]/15 hover:border-[#7B2D43]/30 hover:text-[#7B2D43]'
                      }`}
                    >
                      <Tag className="w-2.5 h-2.5" strokeWidth={1.5} />
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="ml-auto font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-[10%] -left-28 w-[26rem] h-[26rem] rounded-full bg-[#F2D9D2]/25 blur-[120px]" />
        <div className="absolute bottom-[10%] -right-28 w-[26rem] h-[26rem] rounded-full bg-[#E2BF7E]/15 blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-[1.75rem] border border-[#B07D3F]/10 overflow-hidden animate-pulse">
                  <div className="h-64 bg-[#F3EADC]" />
                  <div className="p-6">
                    <div className="h-5 bg-[#F3EADC] rounded-full w-2/3 mb-3" />
                    <div className="h-4 bg-[#F3EADC] rounded-full w-full mb-2" />
                    <div className="h-4 bg-[#F3EADC] rounded-full w-1/2 mb-4" />
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-[#F3EADC] rounded-full w-20" />
                      <div className="h-9 bg-[#F3EADC] rounded-full w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
                <Package className="w-8 h-8 text-[#B07D3F]/30" strokeWidth={1} />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#2B2118]/70 mb-2">
                {searchQuery || selectedTag || selectedCategory ? `No ${pageTitle.toLowerCase()} match your search` : `No ${pageTitle.toLowerCase()} yet`}
              </h3>
              <p className="font-body italic text-[#2B2118]/40 mb-6">
                {searchQuery || selectedTag || selectedCategory
                  ? 'Try adjusting your search or filters'
                  : `${pageTitle} will appear here once they are added`}
              </p>
              {(searchQuery || selectedTag || selectedCategory) && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedTag(''); setSelectedCategory('') }}
                  className="inline-flex items-center gap-2 font-accent text-[11px] tracking-[0.2em] uppercase text-[#7B2D43] border border-[#7B2D43]/25 rounded-full px-6 py-3 hover:bg-[#7B2D43]/[0.06] transition-all duration-300"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer} initial="hidden" animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onAddToCart={handleAddToCart}
                  inCart={isInCart(product.id)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#FBF7F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[2rem] bg-gradient-to-br from-[#46242F] via-[#3B1F2B] to-[#2E1822] px-6 py-14 md:py-16 text-center overflow-hidden shadow-[0_40px_90px_-30px_rgba(46,24,34,0.55),inset_0_1px_0_rgba(217,165,160,0.12)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(217,165,160,0.14),transparent_70%)]" />
            <div className="grain grain-strong" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#FBF7F0] leading-[1.1] mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="font-body italic text-[#FBF7F0]/50 mb-8 max-w-lg mx-auto">
                We create custom decor for every occasion. Tell us your vision and we'll make it happen.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Sais Creation! I need custom decor for my event. Can we discuss?')}`}
                target="_blank" rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-[#E8BBB4] via-[#D9A5A0] to-[#C28D87] text-[#3B1F2B] font-accent font-medium text-[12px] tracking-[0.25em] uppercase px-10 py-4 overflow-hidden shadow-[0_14px_40px_-10px_rgba(217,165,160,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(217,165,160,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-500"
              >
                <MessageCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" strokeWidth={1.6} />
                <span>Request Custom Decor</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

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
