import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import {
  Menu, X, MessageCircle, Star, ChevronLeft, ChevronRight,
  PartyPopper, Sparkles, Flower2, Lamp, Phone,
  ArrowRight, Heart, Send, Crown, Gem,
  MapPin, Clock, CalendarDays, User, LogIn, LogOut, Shield, Eye, ShoppingCart, Check
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { db } from '../config/firebase'
import { doc, getDoc, collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore'

/* ─────────────────────────────────────────────
   SAIS CREATION — Warm Luxury · Modern Atelier Edition
   Theme: Light & welcoming with deep wine contrast strips
   Palette:
     Ivory      #FBF7F0   (main background)
     Champagne  #F3EADC   (alt sections / soft fills)
     Burgundy   #7B2D43   (primary accent — buttons, highlights)
     Rose Gold  #D9A5A0   (secondary accent — details, hovers)
     Bronze     #B07D3F   (luxury lines, icons, prices)
     Espresso   #2B2118   (text)
     Deep Wine  #3B1F2B   (dark contrast sections)
───────────────────────────────────────────── */

const WHATSAPP_NUMBER = '14083874854'
const NAV_LINKS = ['Home', 'Gallery', 'Rentals', 'Decors', 'About', 'Contact']

/* ── Shared button recipes ── */
const BTN_PRIMARY =
  'group relative inline-flex items-center justify-center gap-3 rounded-full ' +
  'bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] ' +
  'font-accent font-medium text-[12px] tracking-[0.22em] uppercase px-10 py-[18px] overflow-hidden ' +
  'shadow-[0_12px_32px_-10px_rgba(123,45,67,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] ' +
  'transition-all duration-500 hover:shadow-[0_22px_50px_-12px_rgba(123,45,67,0.6)] ' +
  'hover:-translate-y-0.5 active:translate-y-0'

const BTN_GHOST =
  'group inline-flex items-center justify-center gap-3 rounded-full ' +
  'border border-[#B07D3F]/45 bg-white/40 backdrop-blur-sm text-[#7B2D43] ' +
  'font-accent font-light text-[12px] tracking-[0.22em] uppercase px-10 py-[18px] ' +
  'shadow-[0_2px_10px_rgba(59,31,43,0.05)] transition-all duration-500 ' +
  'hover:border-[#7B2D43]/70 hover:bg-[#7B2D43]/5 hover:-translate-y-0.5 ' +
  'hover:shadow-[0_14px_34px_-12px_rgba(59,31,43,0.25)] active:translate-y-0'

/* ── Ornament divider ── */
const Ornament = ({ light = false }) => (
  <div className="flex items-center justify-center gap-4 mt-8">
    <span className={`block h-px w-16 bg-gradient-to-r from-transparent ${light ? 'to-[#D9A5A0]/70' : 'to-[#B07D3F]/60'}`} />
    <span className={`block w-1.5 h-1.5 rounded-full ${light ? 'bg-[#D9A5A0]/70' : 'bg-[#B07D3F]/60'}`} />
    <span className={`flex items-center justify-center w-9 h-9 rounded-full border ${light ? 'border-[#D9A5A0]/40 bg-[#D9A5A0]/5' : 'border-[#B07D3F]/30 bg-[#B07D3F]/5'}`}>
      <Gem className={`w-3.5 h-3.5 ${light ? 'text-[#D9A5A0]' : 'text-[#B07D3F]'}`} strokeWidth={1.2} />
    </span>
    <span className={`block w-1.5 h-1.5 rounded-full ${light ? 'bg-[#D9A5A0]/70' : 'bg-[#B07D3F]/60'}`} />
    <span className={`block h-px w-16 bg-gradient-to-l from-transparent ${light ? 'to-[#D9A5A0]/70' : 'to-[#B07D3F]/60'}`} />
  </div>
)

const fadeUp = isMobile
  ? { hidden: { opacity: 0 }, visible: () => ({ opacity: 1, transition: { duration: 0.3 } }) }
  : {
      hidden: { opacity: 0, y: 50 },
      visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.85, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
      }),
    }

const staggerContainer = isMobile
  ? { hidden: {}, visible: {} }
  : { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }

function SectionHeading({ eyebrow, title, titleItalic, subtitle, light = false }) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="text-center mb-14 md:mb-18"
    >
      {eyebrow && (
        <span className={`inline-flex items-center gap-2.5 font-accent font-light text-[11px] tracking-[0.4em] uppercase mb-6 px-5 py-2 rounded-full border ${
          light
            ? 'text-[#D9A5A0] border-[#D9A5A0]/25 bg-[#D9A5A0]/5'
            : 'text-[#B07D3F] border-[#B07D3F]/25 bg-white/50 shadow-[0_2px_10px_rgba(59,31,43,0.04)]'
        }`}>
          <span className={`block w-1 h-1 rounded-full ${light ? 'bg-[#D9A5A0]' : 'bg-[#B07D3F]'}`} />
          {eyebrow}
          <span className={`block w-1 h-1 rounded-full ${light ? 'bg-[#D9A5A0]' : 'bg-[#B07D3F]'}`} />
        </span>
      )}
      <h2 className={`font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-[-0.01em] ${light ? 'text-[#FBF7F0]' : 'text-[#2B2118]'}`}>
        {title}{' '}
        {titleItalic && (
          <em className={`${light ? 'blush-shimmer' : 'bronze-shimmer'} font-medium italic`}>{titleItalic}</em>
        )}
      </h2>
      {subtitle && (
        <p className={`font-body text-[15px] md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed ${light ? 'text-[#FBF7F0]/80 md:text-[#FBF7F0]/60' : 'text-[#2B2118]/80 md:text-[#2B2118]/55'}`}>
          {subtitle}
        </p>
      )}
      <Ornament light={light} />
    </motion.div>
  )
}

/* ─── DATA ─── */
const SERVICES = [
  { icon: PartyPopper, title: 'Balloon Artistry', desc: 'Sculpted arches, organic garlands & couture balloon installations' },
  { icon: Crown, title: 'Royal Stage Design', desc: 'Grand backdrops, silk drapery & themed stage architecture' },
  { icon: Flower2, title: 'Floral Couture', desc: 'Fresh & faux florals composed with an artist’s eye for romance' },
  { icon: Lamp, title: 'Lighting & Ambience', desc: 'Fairy-lit canopies, LED walls, neon signatures & golden glow' },
]

const PRODUCTS = [
  { id: 1, name: 'Golden Arch Kit', desc: 'Premium balloon arch in metallic gold & ivory tones', price: '₹2,499', tag: 'Bestseller' },
  { id: 2, name: 'Rose Petal Backdrop', desc: 'Luxurious draped backdrop with cascading rose petals', price: '₹3,999', tag: 'Premium' },
  { id: 3, name: 'LED Letter Lights', desc: 'Marquee-style 4ft illuminated letters for any occasion', price: '₹1,299', tag: null },
  { id: 4, name: 'Floral Centerpiece Set', desc: 'Six elegant table centerpieces with mixed blooms', price: '₹4,499', tag: 'New' },
  { id: 5, name: 'Stage Drape Package', desc: 'Full silk draping with fairy lights & golden swags', price: '₹7,999', tag: 'Premium' },
  { id: 6, name: 'Custom Neon Signature', desc: 'Bespoke neon sign with your words — the perfect photo moment', price: '₹2,999', tag: null },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', event: 'Wedding Reception', text: 'Sais Creation transformed our reception into a fairy tale. Every detail was impeccable — our guests were mesmerized from the moment they walked in.', rating: 5 },
  { name: 'Rahul Mehta', event: 'First Birthday', text: 'Beyond magical. The balloon arrangements were stunning, creative, and photographed beautifully. Worth every rupee.', rating: 5 },
  { name: 'Anita Desai', event: 'Corporate Gala', text: 'Professional, punctual, extraordinarily talented. The stage design was world-class — our leadership team was deeply impressed.', rating: 5 },
]

const GALLERY_IMAGES = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  height: [300, 380, 330, 350, 310, 400, 320, 360, 300][i],
  gradient: [
    'from-[#D9A5A0]/45 via-[#F3EADC] to-[#B07D3F]/25',
    'from-[#B07D3F]/30 via-[#F3EADC] to-[#7B2D43]/20',
    'from-[#7B2D43]/25 via-[#D9A5A0]/30 to-[#F3EADC]',
    'from-[#E2BF7E]/40 via-[#F3EADC] to-[#D9A5A0]/35',
    'from-[#D9A5A0]/35 via-[#F3EADC] to-[#3B1F2B]/15',
    'from-[#F3EADC] via-[#D9A5A0]/30 to-[#B07D3F]/30',
    'from-[#B07D3F]/25 via-[#E2BF7E]/30 to-[#F3EADC]',
    'from-[#3B1F2B]/15 via-[#D9A5A0]/25 to-[#F3EADC]',
    'from-[#D9A5A0]/40 via-[#F3EADC] to-[#7B2D43]/15',
  ][i],
  label: ['Wedding Setup', 'Birthday Bash', 'Stage Design', 'Floral Beauty', 'Corporate Gala', 'Baby Shower', 'Engagement', 'Anniversary', 'Sangeet Night'][i],
}))

const EVENT_TYPES = ['Wedding', 'Birthday', 'Engagement', 'Baby Shower', 'Corporate Event', 'Anniversary', 'Other']

/* ─── PRODUCT ILLUSTRATIONS — bespoke line art per piece ─── */
function ProductArt({ id }) {
  const common = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (id) {
    case 1: /* Golden Arch Kit — balloon arch */
      return (
        <svg viewBox="0 0 220 150" className="w-full h-full" aria-hidden="true">
          <path d="M40 138 C40 60 180 60 180 138" stroke="#B07D3F" strokeWidth="1.2" strokeDasharray="2 6" {...common} />
          {[
            [40, 130, 11, '#E2BF7E'], [48, 108, 9, '#D9A5A0'], [60, 88, 11, '#FBF7F0'], [78, 73, 9, '#B07D3F'],
            [99, 65, 11, '#E2BF7E'], [121, 65, 9, '#D9A5A0'], [142, 73, 11, '#FBF7F0'], [160, 88, 9, '#E2BF7E'],
            [172, 108, 11, '#D9A5A0'], [180, 130, 9, '#B07D3F'],
          ].map(([cx, cy, r, c], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill={c} opacity="0.85" />
              <circle cx={cx} cy={cy} r={r} stroke="#7B2D43" strokeOpacity="0.25" strokeWidth="1" fill="none" />
              <circle cx={cx - r / 3} cy={cy - r / 3} r={r / 4} fill="#FFFFFF" opacity="0.55" />
            </g>
          ))}
          <line x1="28" y1="140" x2="192" y2="140" stroke="#B07D3F" strokeOpacity="0.4" strokeWidth="1.2" />
        </svg>
      )
    case 2: /* Rose Petal Backdrop — drapes & falling petals */
      return (
        <svg viewBox="0 0 220 150" className="w-full h-full" aria-hidden="true">
          <rect x="48" y="22" width="124" height="106" rx="14" fill="#FBF7F0" opacity="0.7" stroke="#B07D3F" strokeOpacity="0.35" strokeWidth="1.2" />
          <path d="M48 28 Q78 50 110 28 Q142 50 172 28" stroke="#7B2D43" strokeOpacity="0.5" strokeWidth="1.4" {...common} />
          <path d="M60 24 V120 M110 32 V124 M160 24 V120" stroke="#D9A5A0" strokeOpacity="0.6" strokeWidth="1.2" {...common} />
          {[[80, 62], [132, 56], [96, 88], [148, 92], [70, 104], [120, 110]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} q4 -7 8 0 q-4 7 -8 0`} fill="#D9A5A0" opacity="0.8" transform={`rotate(${i * 50} ${x} ${y})`} />
          ))}
          <circle cx="110" cy="20" r="3.5" fill="#B07D3F" opacity="0.7" />
        </svg>
      )
    case 3: /* LED Letter Lights — marquee letter */
      return (
        <svg viewBox="0 0 220 150" className="w-full h-full" aria-hidden="true">
          <path d="M82 128 L110 28 L138 128 M92 92 H128" stroke="#7B2D43" strokeWidth="9" strokeOpacity="0.18" {...common} />
          <path d="M82 128 L110 28 L138 128 M92 92 H128" stroke="#B07D3F" strokeWidth="2" {...common} />
          {[[110, 34], [99, 64], [121, 64], [93, 92], [127, 92], [86, 118], [134, 118]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="5.5" fill="#E2BF7E" opacity="0.45" />
              <circle cx={x} cy={y} r="2.6" fill="#E2BF7E" />
            </g>
          ))}
          <path d="M56 40 l4 0 m-2 -2 l0 4 M168 56 l4 0 m-2 -2 l0 4 M62 102 l4 0 m-2 -2 l0 4" stroke="#D9A5A0" strokeWidth="1.4" {...common} />
        </svg>
      )
    case 4: /* Floral Centerpiece — vase & blooms */
      return (
        <svg viewBox="0 0 220 150" className="w-full h-full" aria-hidden="true">
          <path d="M96 96 h28 l-5 36 h-18 z" fill="#FBF7F0" stroke="#B07D3F" strokeOpacity="0.5" strokeWidth="1.4" />
          <path d="M110 94 V64 M110 80 Q94 72 88 56 M110 76 Q126 68 134 54 M110 88 Q100 86 96 74 M110 84 Q122 82 126 70" stroke="#7B2D43" strokeOpacity="0.55" strokeWidth="1.4" {...common} />
          {[[110, 56, '#D9A5A0'], [85, 50, '#E2BF7E'], [137, 48, '#D9A5A0'], [94, 68, '#B07D3F'], [128, 64, '#E2BF7E']].map(([x, y, c], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx={x} cy={Number(y) - 6} rx="4" ry="7" fill={c} opacity="0.8" transform={`rotate(${a} ${x} ${y})`} />
              ))}
              <circle cx={x} cy={y} r="3" fill="#7B2D43" opacity="0.7" />
            </g>
          ))}
          <line x1="74" y1="134" x2="146" y2="134" stroke="#B07D3F" strokeOpacity="0.4" strokeWidth="1.2" />
        </svg>
      )
    case 5: /* Stage Drape Package — swags & fairy lights */
      return (
        <svg viewBox="0 0 220 150" className="w-full h-full" aria-hidden="true">
          <path d="M30 26 Q70 70 110 26 Q150 70 190 26" stroke="#7B2D43" strokeOpacity="0.55" strokeWidth="1.6" {...common} />
          <path d="M30 26 Q70 86 110 26 Q150 86 190 26" stroke="#D9A5A0" strokeOpacity="0.7" strokeWidth="1.3" {...common} />
          <path d="M38 30 V124 M110 34 V128 M182 30 V124" stroke="#B07D3F" strokeOpacity="0.45" strokeWidth="1.3" {...common} />
          <path d="M46 124 Q74 96 110 124 Q146 96 174 124" stroke="#D9A5A0" strokeOpacity="0.5" strokeWidth="1.1" strokeDasharray="1 7" {...common} />
          {[[58, 113], [84, 103], [110, 100], [136, 103], [162, 113]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.4" fill="#E2BF7E" />
          ))}
          <circle cx="110" cy="26" r="4" fill="#B07D3F" opacity="0.7" />
        </svg>
      )
    default: /* Custom Neon Signature — glowing script */
      return (
        <svg viewBox="0 0 220 150" className="w-full h-full" aria-hidden="true">
          <rect x="34" y="34" width="152" height="82" rx="18" stroke="#B07D3F" strokeOpacity="0.3" strokeWidth="1.2" fill="#FBF7F0" opacity="0.4" />
          <path d="M56 88 Q66 56 76 88 Q82 64 92 82 Q100 60 112 84 Q118 70 126 84 Q138 56 150 88 Q156 76 166 82"
            stroke="#7B2D43" strokeWidth="6" strokeOpacity="0.15" {...common} />
          <path d="M56 88 Q66 56 76 88 Q82 64 92 82 Q100 60 112 84 Q118 70 126 84 Q138 56 150 88 Q156 76 166 82"
            stroke="#D9A5A0" strokeWidth="2.2" {...common} />
          <path d="M48 44 l5 0 m-2.5 -2.5 l0 5 M172 100 l5 0 m-2.5 -2.5 l0 5" stroke="#E2BF7E" strokeWidth="1.5" {...common} />
          <circle cx="178" cy="46" r="2" fill="#D9A5A0" />
        </svg>
      )
  }
}

/* ─── NAVBAR ─── */
function Navbar({ cartCount, user, isAdmin, onLogout }) {
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
          ? `max-w-6xl mt-3 mx-3 sm:mx-6 lg:mx-auto ${mobileOpen ? 'rounded-[1.75rem]' : 'rounded-full'} bg-[#FBF7F0]/95 md:bg-[#FBF7F0]/90 md:backdrop-blur-xl border border-[#B07D3F]/20 shadow-[0_18px_50px_-12px_rgba(59,31,43,0.18)] px-5 sm:px-7`
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 border border-transparent'
      }`}>
        <div className="flex items-center justify-between py-3 md:py-3.5">
          <div className="flex items-center gap-3 group">
            <a href="#home" className="relative w-11 h-11 flex items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-[10px] border border-[#B07D3F]/60 bg-gradient-to-br from-[#F3EADC]/80 to-transparent group-hover:rotate-[135deg] group-hover:border-[#7B2D43]/50 transition-all duration-700 shadow-[0_4px_14px_-4px_rgba(176,125,63,0.4)]" />
              <Sparkles className="w-[18px] h-[18px] text-[#7B2D43]" strokeWidth={1.5} />
            </a>
            <div className="leading-none">
              <a href="#home" className="font-display text-2xl md:text-[26px] font-semibold text-[#2B2118] tracking-wide block group-hover:text-[#7B2D43] transition-colors duration-300">
                Sais Creation
              </a>
              <span className="font-accent font-light text-[8.5px] tracking-[0.5em] uppercase text-[#B07D3F]">
                <Link to="/rentals" className="hover:text-[#7B2D43] transition-colors duration-300">Rentals</Link>
                {' · '}
                <Link to="/decors" className="hover:text-[#7B2D43] transition-colors duration-300">Decor</Link>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isPage = link === 'Decors' || link === 'Rentals' || link === 'Gallery'
              return isPage ? (
                <Link key={link} to={`/${link.toLowerCase()}`}
                  className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300 group/nav"
                >
                  {link}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-[#7B2D43] scale-0 group-hover/nav:scale-100 transition-transform duration-300" />
                </Link>
              ) : (
                <a key={link} href={`#${link.toLowerCase()}`}
                  className="relative font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300 group/nav"
                >
                  {link}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-[#7B2D43] scale-0 group-hover/nav:scale-100 transition-transform duration-300" />
                </a>
              )
            })}
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" aria-label="Admin panel"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#7B2D43] border border-[#7B2D43]/25 hover:bg-[#7B2D43]/[0.06] transition-all duration-300"
                  >
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                    Admin
                  </Link>
                )}
                <button onClick={onLogout} aria-label="Sign out"
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/25 hover:bg-white/50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" aria-label="Sign in"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/25 hover:bg-white/50 transition-all duration-300"
              >
                <LogIn className="w-4 h-4" strokeWidth={1.5} />
                Login
              </Link>
            )}
            <Link to="/cart" aria-label="View cart"
              className="relative p-2.5 rounded-full text-[#2B2118]/70 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/30 hover:bg-white/60 hover:shadow-[0_6px_18px_-6px_rgba(59,31,43,0.2)] transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-[#8E3650] to-[#6A2438] text-[#FBF7F0] text-[10px] font-accent font-semibold rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(123,45,67,0.5)] ring-2 ring-[#FBF7F0]"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
              className="md:hidden p-2.5 rounded-full text-[#2B2118]/75 hover:text-[#7B2D43] hover:bg-white/60 transition-all duration-300"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className={`md:hidden overflow-hidden ${scrolled ? '' : 'rounded-[1.75rem] bg-[#FBF7F0]/98 border border-[#B07D3F]/15 shadow-[0_24px_60px_-16px_rgba(59,31,43,0.25)] mb-3'}`}
            >
              <div className="px-3 py-4 space-y-1">
                {NAV_LINKS.map((link, i) => {
                  const isPage = link === 'Decors' || link === 'Rentals' || link === 'Gallery'
                  return isPage ? (
                    <motion.div key={link} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}>
                      <Link to={`/${link.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300"
                      >
                        {link}
                        <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a key={link} href={`#${link.toLowerCase()}`}
                      initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300"
                    >
                      {link}
                      <ArrowRight className="w-3.5 h-3.5 text-[#B07D3F]/60" />
                    </motion.a>
                  )
                })}
                {user ? (
                  <>
                    {isAdmin && (
                      <motion.div initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: NAV_LINKS.length * 0.07 }}>
                        <Link to="/admin" onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300"
                        >
                          <span className="flex items-center gap-2"><Shield className="w-4 h-4" strokeWidth={1.5} /> Admin</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#7B2D43]/60" />
                        </Link>
                      </motion.div>
                    )}
                    <motion.div initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: (NAV_LINKS.length + 1) * 0.07 }}>
                      <button onClick={() => { onLogout(); setMobileOpen(false) }}
                        className="w-full flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300"
                      >
                        <span className="flex items-center gap-2"><LogOut className="w-4 h-4" strokeWidth={1.5} /> Logout</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#7B2D43]/60" />
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: NAV_LINKS.length * 0.07 }}>
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300"
                    >
                      <span className="flex items-center gap-2"><LogIn className="w-4 h-4" strokeWidth={1.5} /> Login</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#7B2D43]/60" />
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

/* ─── HERO ─── */
function Hero({ content = {} }) {
  const particleCount = isMobile ? 0 : 14
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    left: `${(i * 53) % 100}%`,
    size: 3 + ((i * 7) % 5),
    duration: 10 + ((i * 3) % 9),
    delay: (i * 1.3) % 10,
  }))

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FBF7F0]">
      {/* Warm atmosphere — layered gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(243,234,220,0.9),transparent_75%)]" />
        {!isMobile && <>
          <div className="absolute top-[6%] left-[10%] w-96 h-96 rounded-full bg-[#D9A5A0]/25 blur-[110px]" />
          <div className="absolute bottom-[10%] right-[6%] w-[30rem] h-[30rem] rounded-full bg-[#E2BF7E]/28 blur-[130px]" />
          <div className="absolute top-[42%] right-[24%] w-64 h-64 rounded-full bg-[#7B2D43]/8 blur-[90px]" />
          <div className="absolute bottom-[20%] left-[18%] w-72 h-72 rounded-full bg-[#F2D9D2]/40 blur-[100px]" />
        </>}
      </div>
      <div className="grain" />

      {/* Concentric arch rings behind the headline */}
      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] w-[min(92vw,880px)] opacity-[0.5] pointer-events-none" viewBox="0 0 880 560" fill="none" aria-hidden="true">
        <path d="M110 560 C110 240 770 240 770 560" stroke="#B07D3F" strokeOpacity="0.22" strokeWidth="1.2" />
        <path d="M170 560 C170 300 710 300 710 560" stroke="#B07D3F" strokeOpacity="0.16" strokeWidth="1" />
        <path d="M230 560 C230 356 650 356 650 560" stroke="#D9A5A0" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 8" />
        <circle cx="110" cy="430" r="3.5" fill="#D9A5A0" opacity="0.7" />
        <circle cx="770" cy="430" r="3.5" fill="#B07D3F" opacity="0.5" />
        <circle cx="440" cy="252" r="2.5" fill="#B07D3F" opacity="0.6" />
      </svg>

      {/* Floating rose-gold dust */}
      {particles.map((p, i) => (
        <span key={i} className="rose-particle"
          style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}
        />
      ))}

      {/* Slow-spinning ornamental ring */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1.2 }}
        className="absolute top-[16%] right-[8%] hidden lg:block pointer-events-none"
      >
        <div className="spin-slow w-28 h-28 rounded-full border border-dashed border-[#B07D3F]/35 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-[#D9A5A0]/40" />
        </div>
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-[#B07D3F]/60" strokeWidth={1.2} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1.2 }}
        className="absolute bottom-[24%] left-[7%] hidden lg:block pointer-events-none"
      >
        <div className="spin-slow w-20 h-20 rounded-full border border-dashed border-[#D9A5A0]/45" style={{ animationDirection: 'reverse' }} />
        <Flower2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-[#D9A5A0]/80" strokeWidth={1.2} />
      </motion.div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24 pb-16">
        <motion.div
          initial={isMobile ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.3 : 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-3 font-accent font-light text-[10px] md:text-[11px] tracking-[0.45em] uppercase text-[#7B2D43]/85 bg-white/80 md:bg-white/55 md:backdrop-blur-sm border border-[#B07D3F]/25 rounded-full px-6 py-3 shadow-[0_8px_24px_-8px_rgba(59,31,43,0.15)]">
            <span className="relative block w-1.5 h-1.5 rounded-full bg-[#B07D3F] pulse-dot" />
            {content.badge || 'Elegant Traditional Décor, Premium Rental Collections'}
          </span>
        </motion.div>

        <h1 className="font-display font-semibold text-[#2B2118] leading-[0.98] mb-8">
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: isMobile ? 0.3 : 1, delay: isMobile ? 0 : 0.25 }}
            className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[-0.01em]"
          >
            {content.title || 'Where Celebrations'}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: isMobile ? 0.3 : 1, delay: isMobile ? 0 : 0.45 }}
            className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl italic font-medium bronze-shimmer py-2"
          >
            {content.titleItalic || 'Become Art'}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: isMobile ? 0.3 : 0.9, delay: isMobile ? 0 : 0.7 }}
          className="font-body text-[15px] md:text-lg lg:text-xl text-[#2B2118]/80 md:text-[#2B2118]/55 max-w-xl mx-auto mb-12 leading-relaxed italic"
        >
          {content.subtitle || 'Custom event décor and high-quality rental props for weddings, birthdays, baby showers, festivals & more — crafted for moments you will never forget.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: isMobile ? 0.3 : 0.9, delay: isMobile ? 0 : 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Link to="/decors" className={BTN_PRIMARY}>
            <span className="shine absolute top-0 bottom-0 w-1/3 bg-white/25 -translate-x-[150%]" />
            <span className="relative z-10">Explore Collection</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Sais Creation! I would like to get a quote for party decoration services.')}`}
            target="_blank" rel="noopener noreferrer"
            className={BTN_GHOST}
          >
            <MessageCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" strokeWidth={1.5} />
            <span>Get a Quote</span>
          </a>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: isMobile ? 0.3 : 1, delay: isMobile ? 0 : 1.25 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {[
            ['10+ Years of Craft'],
            ['500+ Events Styled'],
            ['Rated 5★ by Clients'],
          ].map(([label], i) => (
            <span key={label} className="flex items-center gap-8">
              {i > 0 && <span className="hidden sm:block w-1 h-1 rounded-full bg-[#B07D3F]/50" />}
              <span className="font-accent font-light text-[12px] md:text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/70 md:text-[#2B2118]/45">{label}</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="font-accent font-light text-[9px] tracking-[0.45em] uppercase text-[#2B2118]/35">Scroll</span>
          <motion.span
            animate={{ scaleY: [1, 0.4, 1], opacity: [0.7, 0.25, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="block w-px h-12 bg-gradient-to-b from-[#B07D3F] to-transparent origin-top"
          />
        </motion.div>
      )}
    </section>
  )
}

/* ─── MARQUEE STRIP — deep wine ribbon ─── */
function MarqueeStrip() {
  const items = ['Weddings', 'Birthdays', 'Engagements', 'Baby Showers', 'Corporate Galas', 'Sangeet Nights', 'Anniversaries', 'Festivals']
  const row = [...items, ...items]
  return (
    <div className="bg-[#FBF7F0] px-4 sm:px-6 lg:px-8 pb-4">
      <div className="relative max-w-7xl mx-auto bg-gradient-to-r from-[#331A25] via-[#3B1F2B] to-[#331A25] rounded-[2rem] py-6 overflow-hidden shadow-[0_24px_60px_-20px_rgba(46,24,34,0.55),inset_0_1px_0_rgba(217,165,160,0.12)]">
        <div className="grain grain-strong" />
        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#361C27] to-transparent z-10 rounded-l-[2rem]" />
        <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#361C27] to-transparent z-10 rounded-r-[2rem]" />
        <div className="marquee-track flex w-max items-center gap-10">
          {row.map((item, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="font-display italic text-lg md:text-xl text-[#D9A5A0] whitespace-nowrap">{item}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#D9A5A0]/50" strokeWidth={1.2} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── SERVICES ─── */
function Services() {
  return (
    <section className="py-24 md:py-36 bg-[#F3EADC] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-[#B07D3F]/50 to-transparent" />
      {!isMobile && <>
        <div className="absolute -top-20 -right-24 w-96 h-96 rounded-full bg-[#D9A5A0]/15 blur-[110px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#E2BF7E]/18 blur-[110px]" />
      </>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="The Atelier"
          title="Our"
          titleItalic="Signature Services"
          subtitle="From intimate gatherings to grand celebrations — each event composed like a work of art"
        />

        <div className="flex md:grid md:grid-cols-4 gap-7 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true, margin: '-50px' }} custom={i}
              className="group relative min-w-[270px] md:min-w-0 snap-center bg-gradient-to-b from-white to-[#FBF7F0] p-9 pt-10 rounded-[1.75rem] border border-[#B07D3F]/15 shadow-[0_4px_16px_rgba(59,31,43,0.05)] hover:border-[#7B2D43]/30 transition-all duration-700 hover:shadow-[0_36px_80px_-24px_rgba(59,31,43,0.3)] hover:-translate-y-2.5 cursor-default overflow-hidden"
            >
              {/* Ghost index numeral */}
              <span className="absolute -top-3 right-5 font-display italic text-[88px] leading-none text-[#B07D3F]/[0.09] group-hover:text-[#7B2D43]/[0.12] transition-colors duration-700 select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              {/* Top accent line that grows on hover */}
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-12 rounded-b-full bg-gradient-to-r from-[#B07D3F]/0 via-[#B07D3F]/70 to-[#B07D3F]/0 group-hover:w-28 transition-all duration-700" />

              <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/70 border border-[#B07D3F]/25 shadow-[0_8px_20px_-8px_rgba(176,125,63,0.4)] group-hover:rotate-6 group-hover:scale-110 group-hover:border-[#7B2D43]/35 transition-all duration-500" />
                <service.icon className="w-6 h-6 text-[#7B2D43] relative z-10 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.4} />
              </div>
              <h3 className="font-display text-[22px] font-semibold text-[#2B2118] mb-3 group-hover:text-[#7B2D43] transition-colors duration-500">{service.title}</h3>
              <p className="font-body text-[15px] text-[#2B2118]/80 md:text-[#2B2118]/55 leading-relaxed">{service.desc}</p>

              <span className="mt-7 inline-flex items-center gap-2 font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                Crafted to order <ArrowRight className="w-3 h-3" />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── PRODUCT DETAIL MODAL ─── */
/* ─── PRODUCTS ─── */
function Products({ items = PRODUCTS }) {
  const GRADIENTS = [
    'from-[#E2BF7E]/45 to-[#D9A5A0]/35', 'from-[#D9A5A0]/45 to-[#E2BF7E]/30', 'from-[#F3EADC] to-[#B07D3F]/30',
    'from-[#D9A5A0]/40 to-[#7B2D43]/15', 'from-[#E2BF7E]/35 to-[#3B1F2B]/12', 'from-[#F3EADC] to-[#D9A5A0]/45',
  ]

  return (
    <section id="products" className="py-24 md:py-36 bg-[#FBF7F0] relative overflow-hidden">
      {!isMobile && <>
        <div className="absolute top-[10%] -left-28 w-[26rem] h-[26rem] rounded-full bg-[#F2D9D2]/35 blur-[120px]" />
        <div className="absolute bottom-[6%] -right-28 w-[26rem] h-[26rem] rounded-full bg-[#E2BF7E]/20 blur-[120px]" />
      </>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="Curated Collection"
          title="Featured" titleItalic="Pieces"
          subtitle="Handpicked decor essentials, each one chosen to elevate your celebration"
        />

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-7"
        >
          {items.map((product, i) => {
            const pid = product.id || `home-${i}`
            const hasImage = !!product.imageUrl
            return (
              <motion.div
                key={pid} variants={fadeUp} custom={i}
                className="group relative bg-white rounded-[1.75rem] overflow-hidden border border-[#B07D3F]/15 shadow-[0_4px_16px_rgba(59,31,43,0.05)] hover:border-[#7B2D43]/30 transition-all duration-700 hover:-translate-y-2.5 hover:shadow-[0_40px_90px_-28px_rgba(59,31,43,0.35)]"
              >
                <div className={`relative h-60 m-3 mb-0 rounded-[1.35rem] bg-gradient-to-br overflow-hidden ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center`}>
                  <span className="shine absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] z-10" />
                  {hasImage ? (
                    <img src={product.imageUrl} alt={product.name} loading="lazy" className="absolute inset-0 w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  ) : (
                    <div className="absolute inset-0 p-6 group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
                      <ProductArt id={typeof product.id === 'number' ? product.id : i + 1} />
                    </div>
                  )}
                  {product.tag && (
                    <span className="absolute top-4 left-4 z-20 font-accent font-medium text-[9px] tracking-[0.3em] uppercase bg-gradient-to-br from-[#8E3650] to-[#6A2438] text-[#FBF7F0] px-4 py-2 rounded-full shadow-[0_8px_20px_-6px_rgba(123,45,67,0.55)]">
                      {product.tag}
                    </span>
                  )}
                </div>

                <div className="p-7">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display text-[22px] font-semibold text-[#2B2118] leading-snug group-hover:text-[#7B2D43] transition-colors duration-500">{product.name}</h3>
                    {product.price && (
                      <span className="font-display italic text-lg text-[#B07D3F] font-semibold whitespace-nowrap mt-1">{product.price}</span>
                    )}
                  </div>
                  <p className="font-body text-[15px] md:text-[14px] text-[#2B2118]/75 md:text-[#2B2118]/50 mb-6 leading-relaxed line-clamp-2">{product.desc}</p>

                  <Link
                    to={`/product/${pid}`}
                    className="w-full font-accent text-[10px] tracking-[0.25em] uppercase py-4 px-6 rounded-full transition-all duration-400 flex items-center justify-center gap-2.5 bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-medium shadow-[0_10px_26px_-10px_rgba(123,45,67,0.55),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_16px_38px_-10px_rgba(123,45,67,0.6)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                    View & Select Style
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

    </section>
  )
}

/* ─── GALLERY ─── */
function Gallery({ images = GALLERY_IMAGES }) {
  const tileIcons = [Heart, PartyPopper, Crown, Flower2, Gem, Sparkles, Heart, Star, Lamp]
  const HEIGHTS = [300, 380, 330, 350, 310, 400, 320, 360, 300]
  const FALLBACK_GRADIENTS = [
    'from-[#D9A5A0]/45 via-[#F3EADC] to-[#B07D3F]/25',
    'from-[#B07D3F]/30 via-[#F3EADC] to-[#7B2D43]/20',
    'from-[#7B2D43]/25 via-[#D9A5A0]/30 to-[#F3EADC]',
    'from-[#E2BF7E]/40 via-[#F3EADC] to-[#D9A5A0]/35',
    'from-[#D9A5A0]/35 via-[#F3EADC] to-[#3B1F2B]/15',
    'from-[#F3EADC] via-[#D9A5A0]/30 to-[#B07D3F]/30',
    'from-[#B07D3F]/25 via-[#E2BF7E]/30 to-[#F3EADC]',
    'from-[#3B1F2B]/15 via-[#D9A5A0]/25 to-[#F3EADC]',
    'from-[#D9A5A0]/40 via-[#F3EADC] to-[#7B2D43]/15',
  ]

  return (
    <section id="gallery" className="py-24 md:py-36 bg-[#F3EADC] relative overflow-hidden">
      {!isMobile && <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-[#FBF7F0]/70 blur-[100px]" />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="Our Portfolio"
          title="Moments We" titleItalic="Created"
          subtitle="A glimpse into the celebrations we've brought to life across the city"
        />

        <div className="columns-2 md:columns-3 gap-5 space-y-5">
          {images.map((img, i) => {
            const TileIcon = tileIcons[i % tileIcons.length]
            const arch = i % 3 === 1
            const hasImage = !!img.imageUrl
            const height = img.height || HEIGHTS[i % HEIGHTS.length]
            const gradient = img.gradient || FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]
            return (
              <motion.div
                key={img.id}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true, margin: '-30px' }} custom={i * 0.4}
                className={`group relative overflow-hidden break-inside-avoid cursor-pointer ${arch ? 'rounded-t-[7rem] rounded-b-[1.5rem]' : 'rounded-[1.5rem]'} shadow-[0_6px_20px_-8px_rgba(59,31,43,0.18)] hover:shadow-[0_30px_70px_-22px_rgba(59,31,43,0.4)] transition-shadow duration-700`}
              >
                <div className={`${hasImage ? 'bg-[#F3EADC]' : `bg-gradient-to-br ${gradient}`} relative transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]`}
                  style={{ height }}
                >
                  {hasImage ? (
                    <img src={img.imageUrl} alt={img.label || ''} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <TileIcon className="w-7 h-7 text-[#7B2D43]/30 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
                      <span className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/35">{img.label}</span>
                    </div>
                  )}
                </div>

                <span className={`absolute inset-3 border border-white/0 group-hover:border-white/70 transition-all duration-500 pointer-events-none ${arch ? 'rounded-t-[6rem] rounded-b-[1.1rem]' : 'rounded-[1.1rem]'}`} />

                <div className="absolute inset-0 bg-gradient-to-t from-[#3B1F2B]/90 via-[#3B1F2B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="font-display text-xl italic font-medium text-[#FBF7F0]">{img.label}</p>
                    <p className="font-accent font-light text-[10px] text-[#D9A5A0] tracking-[0.35em] uppercase mt-1.5 flex items-center gap-2">
                      View Details <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-16">
          <Link to="/gallery" className={BTN_GHOST}>
            View Full Gallery
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── ABOUT ─── */
function About({ content = {} }) {
  const values = [
    'Bespoke designs tailored to every story',
    'Premium materials & meticulous detailing',
    'On-time setup with a dedicated crew',
    'Transparent pricing — no hidden surprises',
  ]

  return (
    <section id="about" className="py-24 md:py-36 bg-[#FBF7F0] relative overflow-hidden">
      {!isMobile && <>
        <div className="absolute top-[15%] -left-24 w-80 h-80 rounded-full bg-[#D9A5A0]/15 blur-[100px]" />
        <div className="absolute bottom-[10%] -right-24 w-96 h-96 rounded-full bg-[#E2BF7E]/18 blur-[120px]" />
      </>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Visual side — arched portrait frame */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative"
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              {/* Offset bronze echo frame */}
              <span className="absolute -top-5 -left-5 w-full h-full rounded-t-[12rem] rounded-b-[2rem] border border-[#B07D3F]/35 pointer-events-none" />
              {/* Main visual — grand arch */}
              <div className="relative h-[440px] md:h-[500px] rounded-t-[12rem] rounded-b-[2rem] bg-gradient-to-br from-[#D9A5A0]/40 via-[#F3EADC] to-[#B07D3F]/25 overflow-hidden shadow-[0_40px_90px_-30px_rgba(59,31,43,0.35)]">
                <div className="grain" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <span className="spin-slow absolute inset-0 rounded-full border border-dashed border-[#7B2D43]/30" />
                    <span className="absolute inset-3 rounded-full bg-white/50 backdrop-blur-sm border border-[#B07D3F]/30 shadow-[0_10px_30px_-10px_rgba(176,125,63,0.5)]" />
                    <Crown className="w-8 h-8 text-[#7B2D43]/70 relative z-10" strokeWidth={1.2} />
                  </div>
                  <span className="font-accent font-light text-[10px] tracking-[0.4em] uppercase text-[#7B2D43]/50">
                    Founder / Studio Image
                  </span>
                </div>
                <span className="absolute inset-4 rounded-t-[11rem] rounded-b-[1.6rem] border border-white/60 pointer-events-none" />
              </div>
              {/* Floating experience badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -4 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.7, type: 'spring', stiffness: 120 }}
                className="absolute -bottom-8 -right-4 md:-right-10 bg-gradient-to-br from-[#44232F] to-[#2E1822] px-9 py-7 text-center rounded-[1.5rem] shadow-[0_30px_70px_-18px_rgba(46,24,34,0.6),inset_0_1px_0_rgba(217,165,160,0.18)] border border-[#D9A5A0]/15"
              >
                <span className="font-display text-4xl md:text-5xl font-semibold blush-shimmer block leading-none">10+</span>
                <span className="font-accent font-light text-[9px] tracking-[0.35em] uppercase text-[#FBF7F0]/70 mt-2.5 block">
                  Years of Craft
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2.5 font-accent font-light text-[11px] tracking-[0.4em] uppercase text-[#B07D3F] mb-6 px-5 py-2 rounded-full border border-[#B07D3F]/25 bg-white/50">
              <span className="block w-1 h-1 rounded-full bg-[#B07D3F]" />
              {content.eyebrow || 'Our Story'}
            </motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-[52px] font-semibold text-[#2B2118] leading-[1.08] tracking-[-0.01em] mb-7">
              {content.title || 'Crafting Joy,'}{' '}
              <em className="bronze-shimmer font-medium italic">{content.titleItalic || 'One Celebration at a Time'}</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="font-body text-[15px] md:text-lg text-[#2B2118]/85 md:text-[#2B2118]/60 leading-relaxed mb-5">
              {content.paragraph1 || 'At Sais Creations Party Rentals & Decor Services, we believe every celebration deserves a beautiful setting. We offer custom event décor and high-quality rental props for weddings, birthdays, baby showers, housewarming ceremonies, festivals, corporate events, and more.'}
            </motion.p>
            <motion.p variants={fadeUp} className="font-body text-[15px] md:text-lg text-[#2B2118]/85 md:text-[#2B2118]/60 leading-relaxed mb-10">
              {content.paragraph2 || 'With creative designs, personalized service, and attention to every detail, we help turn your special moments into unforgettable memories. From intimate home celebrations to grand receptions, your vision becomes our canvas — and the joy on your guests\' faces, our greatest reward.'}
            </motion.p>

            <motion.ul variants={fadeUp} className="space-y-4 mb-11">
              {values.map((value) => (
                <li key={value} className="group/item flex items-start gap-4">
                  <span className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/80 border border-[#B07D3F]/35 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_4px_10px_-4px_rgba(176,125,63,0.4)] group-hover/item:scale-110 group-hover/item:border-[#7B2D43]/45 transition-all duration-300">
                    <Check className="w-3 h-3 text-[#7B2D43]" strokeWidth={2.5} />
                  </span>
                  <span className="font-body text-[15px] text-[#2B2118]/85 md:text-[#2B2118]/70 leading-relaxed pt-1">{value}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <a href="#contact" className={BTN_PRIMARY}>
                <span className="shine absolute top-0 bottom-0 w-1/3 bg-white/25 -translate-x-[150%]" />
                <span className="relative z-10">Plan With Us</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
              </a>
              <div className="flex items-center gap-3">
                <span className="block h-px w-8 bg-[#B07D3F]/50" />
                <span className="font-display italic text-lg text-[#7B2D43]">— {content.founderName || 'The Sais Creation Family'}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── WHY CHOOSE US — deep wine contrast section ─── */
function StatCard({ stat, index }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = stat.end / (2000 / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= stat.end) { setCount(stat.end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, stat.end])

  return (
    <motion.div
      ref={ref}
      variants={fadeUp} initial="hidden" whileInView="visible"
      viewport={{ once: true }} custom={index}
      className="group relative text-center px-8 py-14 rounded-[1.75rem] border border-[#D9A5A0]/15 bg-gradient-to-b from-[#D9A5A0]/[0.08] to-[#D9A5A0]/[0.02] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(217,165,160,0.12)] hover:border-[#D9A5A0]/35 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] transition-all duration-700 overflow-hidden"
    >
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-16 group-hover:w-32 h-[2px] rounded-b-full bg-gradient-to-r from-transparent via-[#D9A5A0]/80 to-transparent transition-all duration-700" />
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-24 rounded-full bg-[#D9A5A0]/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="font-display text-6xl md:text-7xl font-semibold blush-shimmer mb-5 leading-none">
        {count}{stat.suffix}
      </div>
      <h3 className="font-accent font-light text-[12px] tracking-[0.35em] uppercase text-[#FBF7F0] mb-3">{stat.label}</h3>
      <p className="font-body text-[15px] italic text-[#FBF7F0]/75 md:text-[#FBF7F0]/50 leading-relaxed">{stat.desc}</p>
    </motion.div>
  )
}

function WhyChooseUs() {
  const stats = [
    { end: 10, suffix: '+', label: 'Years of Craft', desc: 'Designing unforgettable celebrations since 2014' },
    { end: 500, suffix: '+', label: 'Events Delivered', desc: 'From intimate soirées to grand weddings' },
    { end: 100, suffix: '%', label: 'Client Delight', desc: 'Every event, a story our clients love retelling' },
  ]

  return (
    <section className="py-24 md:py-36 bg-[#3B1F2B] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(217,165,160,0.12),transparent_60%)]" />
      {!isMobile && <div className="absolute bottom-0 left-1/4 w-[28rem] h-64 rounded-full bg-[#7B2D43]/25 blur-[120px]" />}
      <div className="grain grain-strong" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          light eyebrow="The Sais Difference"
          title="Why Choose" titleItalic="Sais Creation"
          subtitle="Numbers that reflect a decade of passion and uncompromising standards"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {stats.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ─── TESTIMONIALS ─── */
function Testimonials({ items = TESTIMONIALS }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % items.length), 5500)
  }

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current) }, [])

  const navigate = (dir) => {
    setCurrent((p) => (p + dir + items.length) % items.length)
    resetTimer()
  }

  return (
    <section className="py-24 md:py-36 bg-[#FBF7F0] relative overflow-hidden">
      {!isMobile && <div className="absolute top-[20%] -right-24 w-80 h-80 rounded-full bg-[#F2D9D2]/40 blur-[110px]" />}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Kind Words"
          title="Stories From" titleItalic="Our Clients"
        />

        <div className="relative">
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 font-display text-[150px] leading-none text-[#D9A5A0]/35 select-none pointer-events-none z-10">"</span>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.985 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-gradient-to-b from-white to-[#FBF7F0] px-8 py-14 md:px-16 md:py-16 rounded-[2.5rem] border border-[#B07D3F]/15 shadow-[0_36px_90px_-30px_rgba(59,31,43,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] text-center overflow-hidden"
            >
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-[#D9A5A0]/70 to-transparent" />

              <div className="flex items-center justify-center gap-1.5 mb-8">
                {Array.from({ length: items[current].rating }).map((_, s) => (
                  <motion.span key={s}
                    initial={{ opacity: 0, scale: 0, rotate: -90 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15 + s * 0.07, type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    <Star className="w-[18px] h-[18px] fill-[#B07D3F] text-[#B07D3F] drop-shadow-[0_2px_4px_rgba(176,125,63,0.35)]" />
                  </motion.span>
                ))}
              </div>

              <blockquote className="font-display italic text-2xl md:text-[28px] text-[#2B2118]/80 leading-relaxed mb-10">
                {items[current].text}
              </blockquote>

              <div className="flex items-center justify-center gap-5">
                <span className="block h-px w-10 bg-gradient-to-r from-transparent to-[#B07D3F]/50" />
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D9A5A0]/50 to-[#B07D3F]/30 border border-[#B07D3F]/30 flex items-center justify-center font-display text-lg font-semibold text-[#7B2D43] shadow-[0_6px_16px_-6px_rgba(176,125,63,0.5)]">
                    {items[current].name.charAt(0)}
                  </span>
                  <div className="text-left">
                    <p className="font-accent font-medium text-[13px] tracking-[0.25em] uppercase text-[#2B2118]">{items[current].name}</p>
                    <p className="font-accent font-light text-[10px] tracking-[0.3em] text-[#7B2D43] uppercase mt-1">{items[current].event}</p>
                  </div>
                </div>
                <span className="block h-px w-10 bg-gradient-to-l from-transparent to-[#B07D3F]/50" />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-5 mt-12">
            <button onClick={() => navigate(-1)} aria-label="Previous testimonial"
              className="p-3.5 rounded-full border border-[#2B2118]/12 bg-white/70 hover:border-[#7B2D43]/50 hover:text-[#7B2D43] text-[#2B2118]/40 shadow-[0_4px_12px_-4px_rgba(59,31,43,0.12)] hover:shadow-[0_10px_24px_-8px_rgba(123,45,67,0.35)] hover:-translate-x-0.5 transition-all duration-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2.5">
              {items.map((_, i) => (
                <button key={i} onClick={() => { setCurrent(i); resetTimer() }} aria-label={`Testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-gradient-to-r from-[#8E3650] to-[#6A2438] shadow-[0_2px_8px_rgba(123,45,67,0.4)]' : 'w-2 bg-[#2B2118]/15 hover:bg-[#D9A5A0]'}`}
                />
              ))}
            </div>
            <button onClick={() => navigate(1)} aria-label="Next testimonial"
              className="p-3.5 rounded-full border border-[#2B2118]/12 bg-white/70 hover:border-[#7B2D43]/50 hover:text-[#7B2D43] text-[#2B2118]/40 shadow-[0_4px_12px_-4px_rgba(59,31,43,0.12)] hover:shadow-[0_10px_24px_-8px_rgba(123,45,67,0.35)] hover:translate-x-0.5 transition-all duration-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── CONTACT ─── */
function Contact({ content = {} }) {
  const [name, setName] = useState('')
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')

  const whatsapp = content.whatsappNumber || WHATSAPP_NUMBER

  const handleSend = () => {
    if (!name.trim()) { setError('Please tell us your name so we can greet you properly.'); return }
    if (!eventType) { setError('Please select your event type.'); return }
    setError('')

    const lines = [
      `Hi Sais Creation! I'm ${name.trim()}.`,
      `I'm planning a ${eventType}${eventDate ? ` on ${eventDate}` : ''}.`,
      details.trim() ? `Details: ${details.trim()}` : '',
      'Please share a quote. Thank you!',
    ].filter(Boolean)

    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank', 'noopener,noreferrer'
    )
  }
  const infoCards = [
    { icon: MessageCircle, label: 'WhatsApp Us', value: 'Fastest replies — usually within minutes', href: `https://wa.me/${whatsapp}` },
    { icon: Phone, label: 'Call Us', value: content.phone || '+1 (408) 387-4854', href: `tel:+${whatsapp}` },
    { icon: Clock, label: 'Working Hours', value: content.hours || 'Mon–Sun · 9 AM – 9 PM', href: null },
    { icon: MapPin, label: 'Service Area', value: content.address || 'San Jose, CA & surrounding areas', href: null },
  ]

  return (
    <section id="contact" className="py-24 md:py-36 bg-[#F3EADC] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-[#B07D3F]/50 to-transparent" />
      {!isMobile && <div className="absolute top-[20%] -left-24 w-80 h-80 rounded-full bg-[#FBF7F0]/80 blur-[100px]" />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="Let's Talk"
          title={content.title || "Begin Your"} titleItalic={content.titleItalic || "Celebration"}
          subtitle={content.subtitle || "Share a few details and we'll craft a personalised quote — delivered straight to your WhatsApp"}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">

          {/* Contact info cards */}
          <motion.div
            variants={staggerContainer} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="lg:col-span-2 space-y-5"
          >
            {infoCards.map((card, i) => {
              const Inner = (
                <div className="flex items-start gap-5 p-6 bg-gradient-to-b from-white to-[#FBF7F0] rounded-[1.5rem] border border-[#B07D3F]/15 shadow-[0_4px_14px_rgba(59,31,43,0.05)] hover:border-[#7B2D43]/30 transition-all duration-500 hover:shadow-[0_24px_55px_-18px_rgba(59,31,43,0.3)] hover:-translate-y-1 group h-full">
                  <div className="relative w-13 h-13 min-w-12 min-h-12 flex items-center justify-center shrink-0">
                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/70 border border-[#B07D3F]/30 shadow-[0_6px_16px_-6px_rgba(176,125,63,0.45)] group-hover:rotate-6 group-hover:scale-110 transition-all duration-500" />
                    <card.icon className="w-5 h-5 text-[#7B2D43] relative z-10" strokeWidth={1.4} />
                  </div>
                  <div>
                    <h3 className="font-accent font-medium text-[11px] tracking-[0.3em] uppercase text-[#2B2118] mb-1.5 group-hover:text-[#7B2D43] transition-colors duration-300">{card.label}</h3>
                    <p className="font-body text-[15px] md:text-[14px] text-[#2B2118]/80 md:text-[#2B2118]/55 leading-relaxed">{card.value}</p>
                  </div>
                </div>
              )
              return (
                <motion.div key={card.label} variants={fadeUp} custom={i}>
                  {card.href
                    ? <a href={card.href} target="_blank" rel="noopener noreferrer" className="block">{Inner}</a>
                    : Inner}
                </motion.div>
              )
            })}
          </motion.div>

          {/* Enquiry composer */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="lg:col-span-3"
          >
            <div className="relative bg-gradient-to-b from-white to-[#FBF7F0] rounded-[2rem] border border-[#B07D3F]/20 p-8 md:p-12 shadow-[0_36px_90px_-28px_rgba(59,31,43,0.32),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-[#B07D3F]/60 to-transparent" />
              <span className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#F2D9D2]/40 blur-[60px] pointer-events-none" />

              <h3 className="font-display text-3xl md:text-[34px] font-semibold text-[#2B2118] mb-2">Request a Quote</h3>
              <p className="font-body italic text-[15px] md:text-[14px] text-[#2B2118]/70 md:text-[#2B2118]/45 mb-9">
                We'll open WhatsApp with your message ready to send
              </p>

              <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]/60 pointer-events-none z-10" strokeWidth={1.5} />
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name" aria-label="Your name" className="lux-field"
                    />
                  </div>
                  <div className="relative">
                    <CalendarDays className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]/60 pointer-events-none z-10" strokeWidth={1.5} />
                    <input
                      type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                      aria-label="Event date" className="lux-field"
                    />
                  </div>
                </div>

                <div className="relative">
                  <PartyPopper className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]/60 pointer-events-none z-10" strokeWidth={1.5} />
                  <select
                    value={eventType} onChange={(e) => setEventType(e.target.value)}
                    aria-label="Event type" className="lux-field"
                  >
                    <option value="">Select your event type…</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-[#B07D3F]/60 pointer-events-none" strokeWidth={1.5} />
                </div>

                <textarea
                  value={details} onChange={(e) => setDetails(e.target.value)}
                  rows={4} placeholder="Tell us about your vision — theme, colours, venue, guest count…"
                  aria-label="Event details" className="lux-field"
                />

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="font-body italic text-[13px] text-[#7B2D43] bg-[#7B2D43]/[0.06] border border-[#7B2D43]/20 rounded-full px-5 py-2.5 inline-block"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button onClick={handleSend} className={`${BTN_PRIMARY} w-full`}>
                  <span className="shine absolute top-0 bottom-0 w-1/3 bg-white/25 -translate-x-[150%]" />
                  <Send className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.6} />
                  <span className="relative z-10">Send Enquiry on WhatsApp</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA BANNER — inset deep wine card ─── */
function CTABanner({ content = {} }) {
  return (
    <section className="relative py-20 md:py-24 bg-[#FBF7F0] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative rounded-[2.5rem] bg-gradient-to-br from-[#46242F] via-[#3B1F2B] to-[#2E1822] px-6 py-20 md:py-24 text-center overflow-hidden shadow-[0_50px_110px_-35px_rgba(46,24,34,0.65),inset_0_1px_0_rgba(217,165,160,0.15)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(217,165,160,0.16),transparent_70%)]" />
          {!isMobile && <>
            <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#7B2D43]/35 blur-[100px]" />
            <div className="absolute -top-20 -right-12 w-72 h-72 rounded-full bg-[#B07D3F]/15 blur-[90px]" />
          </>}
          <div className="grain grain-strong" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="relative w-16 h-16 mx-auto mb-7 flex items-center justify-center">
              <span className="spin-slow absolute inset-0 rounded-full border border-dashed border-[#D9A5A0]/35" />
              <Crown className="w-7 h-7 text-[#D9A5A0]" strokeWidth={1.2} />
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#FBF7F0] leading-[1.08] mb-5">
              {content.title || 'Your Dream Event,'}{' '}
              <em className="blush-shimmer font-medium italic">{content.titleItalic || 'One Message Away'}</em>
            </h2>
            <p className="font-body italic text-[15px] md:text-lg text-[#FBF7F0]/75 md:text-[#FBF7F0]/55 mb-11 max-w-xl mx-auto">
              {content.subtitle || 'Tell us your vision — we\'ll handle the magic. Quick quotes, friendly conversation, no obligations.'}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Sais Creation! I want to plan my dream event. Can we talk?')}`}
              target="_blank" rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-[#E8BBB4] via-[#D9A5A0] to-[#C28D87] text-[#3B1F2B] font-accent font-medium text-[12px] tracking-[0.28em] uppercase px-12 py-5 overflow-hidden shadow-[0_16px_45px_-12px_rgba(217,165,160,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(217,165,160,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-500"
            >
              <span className="shine absolute top-0 bottom-0 w-1/3 bg-white/40 -translate-x-[150%]" />
              <MessageCircle className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" strokeWidth={1.8} />
              <span className="relative z-10">{content.buttonText || 'Start Planning on WhatsApp'}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── FOOTER — deep wine ─── */
function Footer({ content = {} }) {
  return (
    <footer className="bg-[#2E1822] relative overflow-hidden rounded-t-[2.5rem] md:rounded-t-[3rem]">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D9A5A0]/30 to-transparent" />
      {!isMobile && <div className="absolute -top-24 left-1/3 w-96 h-48 rounded-full bg-[#D9A5A0]/[0.07] blur-[80px]" />}
      <div className="grain" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18 md:py-20 pt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <span className="absolute inset-0 rotate-45 rounded-[9px] border border-[#D9A5A0]/50 bg-[#D9A5A0]/[0.06]" />
                <Sparkles className="w-4 h-4 text-[#D9A5A0]" strokeWidth={1.5} />
              </div>
              <span className="font-display text-2xl font-semibold text-[#FBF7F0]">Sais Creation</span>
            </div>
            <p className="font-body italic text-[15px] text-[#FBF7F0]/70 md:text-[#FBF7F0]/45 leading-relaxed mb-7">
              {content.description || 'Crafting unforgettable celebrations with premium decor, bespoke designs & flawless execution.'}
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://www.instagram.com/decor_by_saiscreations_llc', label: 'Instagram Decors', icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/>
                  </svg>
                )},
                { href: 'https://www.instagram.com/decor_by_saiscreations_rentals', label: 'Instagram Rentals', icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/>
                  </svg>
                )},
                { href: content.facebookUrl || 'https://facebook.com/saiscreation', label: 'Facebook', icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                )},
                { href: `https://wa.me/${WHATSAPP_NUMBER}`, label: 'WhatsApp', icon: <Phone className="w-[15px] h-[15px]" strokeWidth={1.6} /> },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-11 h-11 rounded-full border border-[#FBF7F0]/12 hover:border-[#D9A5A0]/70 flex items-center justify-center text-[#FBF7F0]/40 hover:text-[#D9A5A0] transition-all duration-400 hover:bg-[#D9A5A0]/10 hover:-translate-y-1 hover:shadow-[0_10px_24px_-8px_rgba(217,165,160,0.35)]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-accent font-light text-[11px] tracking-[0.4em] uppercase text-[#D9A5A0] mb-7">Explore</h4>
            <ul className="space-y-3.5">
              {NAV_LINKS.map((link) => {
                const isPage = link === 'Decors' || link === 'Rentals' || link === 'Gallery'
                return (
                  <li key={link}>
                    {isPage ? (
                      <Link to={`/${link.toLowerCase()}`}
                        className="group inline-flex items-center gap-2 font-body text-[15px] text-[#FBF7F0]/50 hover:text-[#D9A5A0] transition-all duration-300 hover:translate-x-1"
                      >
                        <span className="block w-0 group-hover:w-4 h-px bg-[#D9A5A0] transition-all duration-300" />
                        {link}
                      </Link>
                    ) : (
                      <a href={`#${link.toLowerCase()}`}
                        className="group inline-flex items-center gap-2 font-body text-[15px] text-[#FBF7F0]/50 hover:text-[#D9A5A0] transition-all duration-300 hover:translate-x-1"
                      >
                        <span className="block w-0 group-hover:w-4 h-px bg-[#D9A5A0] transition-all duration-300" />
                        {link}
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h4 className="font-accent font-light text-[11px] tracking-[0.4em] uppercase text-[#D9A5A0] mb-7">Get in Touch</h4>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full border border-[#D9A5A0]/50 hover:border-[#D9A5A0] text-[#F2D9D2] hover:text-[#D9A5A0] font-accent font-light text-[11px] tracking-[0.3em] uppercase px-8 py-4 transition-all duration-500 hover:bg-[#D9A5A0]/10 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(217,165,160,0.4)]"
            >
              <MessageCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" strokeWidth={1.5} />
              Chat on WhatsApp
            </a>
            <p className="font-body italic text-[13px] text-[#FBF7F0]/30 mt-5">
              Available Mon–Sun, 9 AM – 9 PM IST
            </p>
          </div>
        </div>

        <div className="border-t border-[#FBF7F0]/8 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-accent font-light text-[10px] text-[#FBF7F0]/30 tracking-[0.25em] uppercase">
            &copy; {new Date().getFullYear()} Sais Creations Decor Service &amp; Party Rentals LLC · All rights reserved
          </p>
          <p className="font-body italic text-xs text-[#FBF7F0]/25 flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-[#D9A5A0] fill-[#D9A5A0]" /> for beautiful celebrations
          </p>
          <p className="font-accent font-light text-[10px] text-[#FBF7F0]/30 tracking-[0.25em] uppercase">
            Developed by{' '}
            <a
              href="https://nlrgroupofcompany.in"
              target="_blank" rel="noopener noreferrer"
              className="text-[#D9A5A0]/70 hover:text-[#D9A5A0] underline underline-offset-4 decoration-[#D9A5A0]/30 hover:decoration-[#D9A5A0]/70 transition-colors duration-300"
            >
              NLR Group of Companies
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─── HOME PAGE ─── */
export default function Home() {
  const { cartCount } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [siteContent, setSiteContent] = useState({})
  const [dynamicTestimonials, setDynamicTestimonials] = useState(null)
  const [featuredProducts, setFeaturedProducts] = useState(null)
  const [galleryImages, setGalleryImages] = useState(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        const sections = ['hero', 'about', 'contact', 'cta', 'footer']
        const data = {}
        await Promise.all(
          sections.map(async (sec) => {
            const snap = await getDoc(doc(db, 'siteContent', sec))
            if (snap.exists()) data[sec] = snap.data()
          })
        )
        setSiteContent(data)
      } catch { /* siteContent not available yet */ }

      try {
        const tq = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
        const tSnap = await getDocs(tq)
        if (tSnap.size > 0) {
          setDynamicTestimonials(tSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
        }
      } catch { /* testimonials not available yet */ }

      try {
        const pq = query(collection(db, 'products'), where('featured', '==', true), limit(6))
        const pSnap = await getDocs(pq)
        if (pSnap.size > 0) {
          setFeaturedProducts(pSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
        }
      } catch { /* featured products not available yet */ }

      try {
        const gq = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(9))
        const gSnap = await getDocs(gq)
        if (gSnap.size > 0) {
          setGalleryImages(gSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
        }
      } catch { /* gallery not available yet */ }
    }
    fetchContent()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <SEO
        title="#1 Party Decor & Rental Services in San Jose, CA"
        description="Sais Creations offers premium custom event decor, balloon artistry, stage design, floral arrangements, and party rental props for weddings, birthdays, baby showers & corporate events in San Jose, California and the Bay Area."
        path="/"
      />
      <Navbar cartCount={cartCount} user={user} isAdmin={isAdmin} onLogout={handleLogout} />
      <Hero content={siteContent.hero} />
      <MarqueeStrip />
      <Services />
      <Products items={featuredProducts || PRODUCTS} />
      <Gallery images={galleryImages || GALLERY_IMAGES} />
      <About content={siteContent.about} />
      <WhyChooseUs />
      <Testimonials items={dynamicTestimonials || TESTIMONIALS} />
      <Contact content={siteContent.contact} />
      <CTABanner content={siteContent.cta} />
      <Footer content={siteContent.footer} />
    </div>
  )
}
