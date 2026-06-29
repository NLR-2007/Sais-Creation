import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  Sparkles, ShoppingCart, Trash2, ArrowLeft, ArrowRight, Package, X,
  Menu, LogIn, LogOut, Shield,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const fadeUp = isMobile
  ? { hidden: { opacity: 0 }, visible: () => ({ opacity: 1, transition: { duration: 0.3 } }) }
  : {
      hidden: { opacity: 0, y: 30 },
      visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
    }

function Navbar({ user, isAdmin, onLogout, cartCount }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav initial={isMobile ? false : { y: -100 }} animate={{ y: 0 }} transition={isMobile ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="fixed top-0 left-0 right-0 z-50">
      <div className={`mx-auto transition-all duration-500 ${scrolled ? `max-w-6xl mt-3 mx-3 sm:mx-6 lg:mx-auto ${mobileOpen ? 'rounded-[1.75rem]' : 'rounded-full'} bg-[#FBF7F0] md:bg-[#FBF7F0]/90 md:backdrop-blur-xl border border-[#B07D3F]/20 shadow-[0_18px_50px_-12px_rgba(59,31,43,0.18)] px-5 sm:px-7` : 'max-w-7xl px-4 sm:px-6 lg:px-8 border border-transparent'}`}>
        <div className="flex items-center justify-between py-3 md:py-3.5">
          <div className="flex items-center gap-3 group">
            <Link to="/" className="relative w-11 h-11 flex items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-[10px] border border-[#B07D3F]/60 bg-gradient-to-br from-[#F3EADC]/80 to-transparent group-hover:rotate-[135deg] group-hover:border-[#7B2D43]/50 transition-all duration-700 shadow-[0_4px_14px_-4px_rgba(176,125,63,0.4)]" />
              <Sparkles className="w-[18px] h-[18px] text-[#7B2D43]" strokeWidth={1.5} />
            </Link>
            <div className="leading-none">
              <Link to="/" className="font-display text-2xl md:text-[26px] font-semibold text-[#2B2118] tracking-wide block group-hover:text-[#7B2D43] transition-colors duration-300">Sais Creation</Link>
              <span className="font-accent font-light text-[8.5px] tracking-[0.5em] uppercase text-[#B07D3F]">
                <Link to="/rentals" className="hover:text-[#7B2D43] transition-colors duration-300">Rentals</Link>
                {' · '}
                <Link to="/decors" className="hover:text-[#7B2D43] transition-colors duration-300">Decor</Link>
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">Home</Link>
            <Link to="/gallery" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">Gallery</Link>
            <Link to="/rentals" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">Rentals</Link>
            <Link to="/decors" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">Decors</Link>
          </div>
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#7B2D43] border border-[#7B2D43]/25 hover:bg-[#7B2D43]/[0.06] transition-all duration-300"><Shield className="w-4 h-4" strokeWidth={1.5} />Admin</Link>}
                <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/25 hover:bg-white/50 transition-all duration-300"><LogOut className="w-4 h-4" strokeWidth={1.5} />Logout</button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43] border border-transparent hover:border-[#B07D3F]/25 hover:bg-white/50 transition-all duration-300"><LogIn className="w-4 h-4" strokeWidth={1.5} />Login</Link>
            )}
            <Link to="/cart" aria-label="View cart"
              className="relative p-2.5 rounded-full text-[#7B2D43] border border-[#B07D3F]/30 bg-white/60 shadow-[0_6px_18px_-6px_rgba(59,31,43,0.2)] transition-all duration-300"
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
      </div>
    </motion.nav>
  )
}

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartCount } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <SEO title="Your Cart" description="Review your selected party decor and rental items before requesting a quote from Sais Creation." path="/cart" noindex />
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} cartCount={cartCount} />

      <section className="pt-32 pb-8 md:pt-40 md:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6">
            <Link to="/decors" className="inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#7B2D43]/70 hover:text-[#7B2D43] transition-colors duration-300">
              <ArrowLeft className="w-3.5 h-3.5" />Browse Collection
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B2D43] to-[#5C1F31] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(123,45,67,0.4)]">
                <ShoppingCart className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118]">Your Cart</h1>
                <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">{cart.length} {cart.length === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {cart.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-[#B07D3F]/30" strokeWidth={1} />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#2B2118]/70 mb-2">Your cart is empty</h3>
              <p className="font-body italic text-[#2B2118]/40 mb-8">Browse our collection and add items you're interested in</p>
              <Link to="/decors" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.2em] uppercase shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5)] hover:-translate-y-0.5 transition-all duration-400">
                <Package className="w-4 h-4" strokeWidth={1.5} />Browse Collection
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {cart.map((item, i) => (
                  <motion.div
                    key={item.id}
                    variants={fadeUp} custom={i}
                    initial="hidden" animate="visible"
                    className="group bg-white rounded-[1.5rem] border border-[#B07D3F]/15 shadow-[0_4px_16px_rgba(59,31,43,0.04)] hover:border-[#7B2D43]/25 hover:shadow-[0_12px_30px_-10px_rgba(59,31,43,0.12)] transition-all duration-500 overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-4 sm:p-5">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/50 overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-[#B07D3F]/25" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-semibold text-[#2B2118] truncate">{item.name}</h3>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2.5 rounded-xl border border-[#B07D3F]/15 bg-white text-red-400 hover:bg-red-50 hover:border-red-200 transition-all duration-300 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#B07D3F]/10">
                <button
                  onClick={clearCart}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#B07D3F]/20 font-accent font-light text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/55 hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-all duration-300"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />Clear Cart
                </button>
                <Link
                  to="/quote"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[12px] tracking-[0.25em] uppercase shadow-[0_10px_30px_-8px_rgba(123,45,67,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_16px_40px_-8px_rgba(123,45,67,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400"
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="bg-[#2E1822] relative overflow-hidden rounded-t-[2.5rem] md:rounded-t-[3rem]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D9A5A0]/30 to-transparent" />
        <div className="grain" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 flex items-center justify-center"><span className="absolute inset-0 rotate-45 rounded-[8px] border border-[#D9A5A0]/50 bg-[#D9A5A0]/[0.06]" /><Sparkles className="w-3.5 h-3.5 text-[#D9A5A0]" strokeWidth={1.5} /></div>
              <span className="font-display text-xl font-semibold text-[#FBF7F0]">Sais Creation</span>
            </div>
            <p className="font-accent font-light text-[10px] text-[#FBF7F0]/30 tracking-[0.25em] uppercase">&copy; {new Date().getFullYear()} Sais Creation · All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
