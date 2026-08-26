import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { db } from '../config/firebase'
import { addDoc, collection, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { cachedDocs } from '../utils/firestoreCache'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { sortReviewsByPriority } from '../utils/sortReviews'
import { isAdminReviewProduct } from '../utils/reviewProducts'
import {
  ArrowLeft, Gem, Home, LogIn, LogOut, Menu, MessageSquare, Shield, ShoppingCart,
  CheckCircle2, Send, Sparkles, Star, X,
} from 'lucide-react'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const fadeUp = isMobile
  ? { hidden: { opacity: 0 }, visible: () => ({ opacity: 1, transition: { duration: 0.25 } }) }
  : {
      hidden: { opacity: 0, y: 28 },
      visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
      }),
    }

function Navbar({ user, isAdmin, onLogout, cartCount }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    ['Home', '/'],
    ['Gallery', '/gallery'],
    ['Rentals', '/rentals'],
    ['Decors', '/decors'],
    ['Reviews', '/reviews'],
    ['About', '/#about'],
    ['Contact', '/#contact'],
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className={`max-w-6xl mt-3 mx-3 sm:mx-6 lg:mx-auto ${mobileOpen ? 'rounded-[1.75rem]' : 'rounded-full'} bg-[#FBF7F0]/95 md:bg-[#FBF7F0]/90 md:backdrop-blur-xl border border-[#B07D3F]/20 shadow-[0_18px_50px_-12px_rgba(59,31,43,0.18)] px-5 sm:px-7 transition-all duration-300`}>
        <div className="flex items-center justify-between py-3 md:py-3.5">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="relative w-11 h-11 flex items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-[10px] border border-[#B07D3F]/60 bg-gradient-to-br from-[#F3EADC]/80 to-transparent group-hover:rotate-[135deg] transition-all duration-700" />
              <Sparkles className="w-[18px] h-[18px] text-[#7B2D43] relative z-10" strokeWidth={1.5} />
            </span>
            <span className="font-display text-2xl md:text-[26px] font-semibold text-[#2B2118] tracking-wide group-hover:text-[#7B2D43] transition-colors">Sais Creation</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(([label, to]) => (
              <Link key={to} to={to} className={`relative font-accent font-light text-[12px] tracking-[0.25em] uppercase px-4 py-2 rounded-full transition-all duration-300 ${to === '/reviews' ? 'text-[#7B2D43] bg-[#7B2D43]/[0.06]' : 'text-[#2B2118]/65 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.05]'}`}>
                {label}
                {to === '/reviews' && <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1 h-1 rounded-full bg-[#7B2D43]" />}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#7B2D43] border border-[#7B2D43]/25 hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                    <Shield className="w-4 h-4" strokeWidth={1.5} /> Admin
                  </Link>
                )}
                <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43]">
                  <LogOut className="w-4 h-4" strokeWidth={1.5} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/55 hover:text-[#7B2D43]">
                <LogIn className="w-4 h-4" strokeWidth={1.5} /> Login
              </Link>
            )}
            <Link to="/cart" aria-label="View cart" className="relative p-2.5 rounded-full text-[#2B2118]/70 hover:text-[#7B2D43] transition-all duration-300">
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#7B2D43] text-[#FBF7F0] text-[10px] rounded-full flex items-center justify-center ring-2 ring-[#FBF7F0]">{cartCount}</span>}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-full text-[#2B2118]/75 hover:text-[#7B2D43] hover:bg-white/60 transition-all duration-300">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden overflow-hidden pb-4">
            {links.map(([label, to]) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06]">
                <Shield className="w-4 h-4" strokeWidth={1.5} /> Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function ReviewCard({ review, index }) {
  return (
    <motion.article
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="bg-white rounded-[1.5rem] border border-[#B07D3F]/12 p-6 md:p-7 shadow-[0_4px_16px_rgba(59,31,43,0.05)]"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-[#2B2118]">{review.userName || 'Customer'}</h3>
          <p className="font-accent font-light text-[10px] tracking-[0.22em] uppercase text-[#B07D3F] mt-1">
            {review.productName || (review.categoryType === 'rentals' ? 'Rentals' : review.categoryType === 'decors' ? 'Decor' : 'Celebration')}
          </p>
        </div>
        <div className="flex gap-0.5" aria-label={`${review.rating || 0} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-4 h-4 ${star <= (review.rating || 0) ? 'fill-[#B07D3F] text-[#B07D3F]' : 'text-[#B07D3F]/20'}`} strokeWidth={1.5} />
          ))}
        </div>
      </div>

      <p className="font-body text-[15px] md:text-[14px] leading-relaxed text-[#2B2118]/65">{review.comment || 'No written comment'}</p>

      {review.photos?.length > 0 && (
        <div className="flex gap-2 mt-5 flex-wrap">
          {review.photos.slice(0, 4).map((url, photoIndex) => (
            <img key={url} src={url} alt={`Review photo ${photoIndex + 1}`} className="w-20 h-20 rounded-xl object-contain bg-[#F3EADC] border border-[#B07D3F]/10" loading="lazy" decoding="async" />
          ))}
        </div>
      )}
    </motion.article>
  )
}

export default function ReviewsPage() {
  const { user, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    categoryType: 'decors',
    productId: '',
    userName: '',
    rating: 5,
    comment: '',
  })

  // Reviews are small and are what the page renders, so they load on their own.
  // The product catalogue is over a megabyte and is only needed for the review form
  // and as a fallback for older reviews with no stored product name — it loads after.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await cachedDocs('reviews', () => query(collection(db, 'reviews'), orderBy('createdAt', 'desc')))
        if (cancelled) return
        setReviews(sortReviewsByPriority(items
          .map((data) => ({
            ...data,
            productName: data.productName || '',
            // Kept so the catalogue pass below can tell "the review stored a type"
            // from "we defaulted it", and only fall back to the product's type.
            storedCategoryType: data.categoryType || '',
            categoryType: data.categoryType || 'decors',
          }))
          .filter((review) => review.showOnReviews === true && review.visible !== false)))
      } catch {
        if (!cancelled) setReviews([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [productItems, categories] = await Promise.all([
          cachedDocs('products', () => collection(db, 'products')),
          cachedDocs('categories', () => collection(db, 'categories')),
        ])
        if (cancelled) return

        const categoryById = new Map(categories.map((item) => [item.id, item]))
        const withType = productItems.map((data) => ({
          ...data,
          categoryType: categoryById.get(data.categoryId)?.type || data.categoryType || 'decors',
        }))
        const productById = new Map(withType.map((item) => [item.id, item]))

        setProducts(withType
          .filter(isAdminReviewProduct)
          .sort((a, b) => (a.name || '').localeCompare(b.name || '')))

        setReviews((current) => current.map((review) => {
          const product = productById.get(review.productId)
          if (!product) return review
          return {
            ...review,
            productName: review.productName || product.name || '',
            categoryType: review.storedCategoryType || product.categoryType || review.categoryType,
          }
        }))
      } catch { /* form falls back to an empty product list */ }
    })()
    return () => { cancelled = true }
  }, [])

  const groupedReviews = useMemo(() => ({
    decors: reviews.filter((review) => review.categoryType === 'decors'),
    rentals: reviews.filter((review) => review.categoryType === 'rentals'),
    other: reviews.filter((review) => !['decors', 'rentals'].includes(review.categoryType)),
  }), [reviews])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const availableProducts = products.filter((product) => product.categoryType === reviewForm.categoryType)

  const handleSubmitReview = async (event) => {
    event.preventDefault()
    if (!reviewForm.userName.trim() || !reviewForm.comment.trim() || reviewForm.rating < 1) return

    setSubmitting(true)
    setSubmitted(false)
    try {
      const product = products.find((item) => item.id === reviewForm.productId)
      const reviewData = {
        productId: product?.id || '',
        productName: product?.name || '',
        categoryType: product?.categoryType || reviewForm.categoryType,
        userId: user?.uid || '',
        userName: reviewForm.userName.trim(),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        photos: [],
        visible: true,
        showOnHome: false,
        showOnReviews: false,
        createdAt: serverTimestamp(),
      }
      await addDoc(collection(db, 'reviews'), reviewData)
      setReviewForm((current) => ({ ...current, productId: '', userName: '', rating: 5, comment: '' }))
      setSubmitted(true)
    } catch (error) {
      alert('Error submitting review: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const sections = [
    ['decors', 'Decor Reviews', 'Client notes for event styling, balloon decor, stages, florals, and custom celebration setups.'],
    ['rentals', 'Rental Reviews', 'Feedback for party rental items, pickup, delivery, condition, and overall rental experience.'],
    ['other', 'Other Reviews', 'General celebration experiences and notes that are not tied to a specific decor or rental category.'],
  ]

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <SEO
        title="Customer Reviews - Decor & Rental Experiences"
        description="Read customer reviews for Sais Creations decor services and party rentals, organized by category."
        path="/reviews"
      />
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} cartCount={cartCount} />

      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(243,234,220,0.9),transparent_75%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#7B2D43]/70 hover:text-[#7B2D43] transition-colors duration-300 mb-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          <div className="text-center">
            <span className="inline-flex items-center gap-2.5 font-accent font-light text-[11px] tracking-[0.4em] uppercase mb-6 px-5 py-2 rounded-full border text-[#B07D3F] border-[#B07D3F]/25 bg-white/50">
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
              Client Reviews
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#2B2118] leading-[1.08] mb-5">
              Celebrations, Shared <em className="bronze-shimmer font-medium italic">By Clients</em>
            </h1>
            <p className="font-body text-[15px] md:text-lg text-[#2B2118]/70 max-w-2xl mx-auto leading-relaxed italic">
              Reviews are organized category-wise so decor and rental experiences stay easy to browse.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className="block h-px w-16 bg-gradient-to-r from-transparent to-[#B07D3F]/60" />
              <Gem className="w-5 h-5 text-[#B07D3F]" strokeWidth={1.2} />
              <span className="block h-px w-16 bg-gradient-to-l from-transparent to-[#B07D3F]/60" />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <section className="mb-16 rounded-[1.75rem] border border-[#B07D3F]/15 bg-white p-6 md:p-9 shadow-[0_12px_36px_-20px_rgba(59,31,43,0.2)]">
          <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-8 lg:gap-12">
            <div>
              <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">Share Your Experience</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118] mt-2">Give Us a Review</h2>
              <p className="font-body italic text-[15px] leading-relaxed text-[#2B2118]/55 mt-4">
                Tell us about your decor or rental experience. Your feedback helps future clients plan their celebrations.
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.22em] uppercase text-[#2B2118]/55 block mb-2">Review Type</label>
                  <select
                    value={reviewForm.categoryType}
                    onChange={(event) => setReviewForm((current) => ({ ...current, categoryType: event.target.value, productId: '' }))}
                    className="lux-field !pl-5"
                  >
                    <option value="decors">Decor</option>
                    <option value="rentals">Rental</option>
                    <option value="other">Other Experience</option>
                  </select>
                </div>
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.22em] uppercase text-[#2B2118]/55 block mb-2">Product / Service (optional)</label>
                  <select
                    value={reviewForm.productId}
                    onChange={(event) => setReviewForm((current) => ({ ...current, productId: event.target.value }))}
                    className="lux-field !pl-5"
                    disabled={reviewForm.categoryType === 'other'}
                  >
                    <option value="">General {reviewForm.categoryType === 'rentals' ? 'rental' : 'decor'} experience</option>
                    {availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-accent font-light text-[10px] tracking-[0.22em] uppercase text-[#2B2118]/55 block mb-2">Your Name *</label>
                <input
                  required
                  type="text"
                  value={reviewForm.userName}
                  onChange={(event) => setReviewForm((current) => ({ ...current, userName: event.target.value }))}
                  placeholder="Your name"
                  className="lux-field !pl-5"
                />
              </div>

              <div>
                <label className="font-accent font-light text-[10px] tracking-[0.22em] uppercase text-[#2B2118]/55 block mb-2.5">Your Rating *</label>
                <div className="flex items-center gap-1" aria-label={`${reviewForm.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm((current) => ({ ...current, rating: star }))}
                      aria-label={`Rate ${star} out of 5`}
                      className="p-1 rounded-full hover:scale-110 transition-transform"
                    >
                      <Star className={`w-7 h-7 ${star <= reviewForm.rating ? 'fill-[#B07D3F] text-[#B07D3F]' : 'text-[#B07D3F]/25'}`} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-accent font-light text-[10px] tracking-[0.22em] uppercase text-[#2B2118]/55 block mb-2">Your Review *</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                  placeholder="Share your experience..."
                  className="lux-field !pl-5 !rounded-2xl resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.22em] uppercase shadow-[0_10px_28px_-8px_rgba(123,45,67,0.5)] disabled:opacity-55 transition-all"
                >
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                {submitted && (
                  <p className="inline-flex items-center gap-2 font-body text-[14px] text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> Thank you! Your review was submitted for approval.
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>

        {loading ? (
          <div className="py-16 text-center font-body text-[#2B2118]/45">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-12 text-center">
            <MessageSquare className="w-9 h-9 text-[#B07D3F]/25 mx-auto mb-3" strokeWidth={1} />
            <p className="font-body italic text-[#2B2118]/45">No reviews have been added to this page yet</p>
          </div>
        ) : (
          <div className="space-y-16">
            {sections.map(([key, title, subtitle]) => {
              const items = groupedReviews[key]
              if (items.length === 0) return null
              return (
                <section key={key}>
                  <div className="mb-7 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <div>
                      <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">{items.length} {items.length === 1 ? 'review' : 'reviews'}</p>
                      <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118] mt-1">{title}</h2>
                    </div>
                    <p className="font-body italic text-[14px] text-[#2B2118]/55 max-w-xl">{subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {items.map((review, index) => <ReviewCard key={review.id} review={review} index={index} />)}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      <footer className="bg-[#2E1822] rounded-t-[2.5rem] md:rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-3 text-[#FBF7F0]">
            <Home className="w-4 h-4 text-[#D9A5A0]" strokeWidth={1.5} />
            <span className="font-display text-xl font-semibold">Sais Creation</span>
          </Link>
          <p className="font-accent font-light text-[10px] text-[#FBF7F0]/30 tracking-[0.25em] uppercase">
            &copy; {new Date().getFullYear()} Sais Creation
          </p>
        </div>
      </footer>
    </div>
  )
}
