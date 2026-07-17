import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { db, storage } from '../config/firebase'
import {
  doc, getDoc, collection, getDocs, addDoc, deleteDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import compressImage from '../utils/compressImage'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  Sparkles, ArrowLeft, ShoppingCart, Check, Star,
  Send, Camera, X, Menu, LogIn, LogOut, Shield, Package, MessageCircle,
  Trash2, User,
} from 'lucide-react'

const WHATSAPP_NUMBER = '14083874854'
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const fadeUp = isMobile
  ? { hidden: { opacity: 0 }, visible: () => ({ opacity: 1, transition: { duration: 0.25 } }) }
  : {
      hidden: { opacity: 0, y: 30 },
      visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
      }),
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
    <motion.nav
      initial={{ y: -100 }} animate={{ y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
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
            <Link to="/" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Home
            </Link>
            <Link to="/gallery" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Gallery
            </Link>
            <Link to="/rentals" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Rentals
            </Link>
            <Link to="/decors" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Decors
            </Link>
            <a href="/#about" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              About
            </a>
            <a href="/#contact" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
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
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Home
                </Link>
                <Link to="/gallery" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Gallery
                </Link>
                <Link to="/rentals" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Rentals
                </Link>
                <Link to="/decors" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Decors
                </Link>
                <a href="/#about" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  About
                </a>
                <a href="/#contact" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Contact
                </a>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                        <Shield className="w-4 h-4" strokeWidth={1.5} /> Admin
                      </Link>
                    )}
                    <button onClick={() => { onLogout(); setMobileOpen(false) }} className="w-full flex items-center gap-2 font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                      <LogOut className="w-4 h-4" strokeWidth={1.5} /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
                    <LogIn className="w-4 h-4" strokeWidth={1.5} /> Login
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

function StarRating({ rating, size = 'md', interactive = false, onChange }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }
  const iconSize = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
        >
          <Star
            className={`${iconSize} ${
              star <= rating
                ? 'fill-[#B07D3F] text-[#B07D3F]'
                : 'fill-none text-[#B07D3F]/25'
            } transition-colors duration-200`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, isOwner, onDelete }) {
  const [showFullComment, setShowFullComment] = useState(false)
  const [lightboxImg, setLightboxImg] = useState(null)
  const isLong = review.comment?.length > 200

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-6 shadow-[0_2px_12px_rgba(59,31,43,0.04)]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D9A5A0]/40 to-[#F3EADC] border border-[#B07D3F]/15 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[#7B2D43]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-accent font-medium text-[13px] text-[#2B2118]">{review.userName || 'Customer'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} size="sm" />
              {review.createdAt?.toDate && (
                <span className="font-accent font-light text-[10px] text-[#2B2118]/35">
                  {review.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(review.id)}
            className="p-2 rounded-full text-[#2B2118]/25 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {review.comment && (
        <p className="font-body text-[15px] md:text-[14px] text-[#2B2118]/80 md:text-[#2B2118]/60 leading-relaxed mb-3">
          {isLong && !showFullComment ? review.comment.slice(0, 200) + '...' : review.comment}
          {isLong && (
            <button
              onClick={() => setShowFullComment(!showFullComment)}
              className="ml-1 font-accent text-[11px] text-[#7B2D43] hover:underline"
            >
              {showFullComment ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      )}

      {review.photos?.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {review.photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightboxImg(url)}
              className="w-20 h-20 rounded-xl overflow-hidden border border-[#B07D3F]/10 hover:border-[#7B2D43]/30 transition-all duration-300 hover:shadow-[0_4px_16px_-4px_rgba(123,45,67,0.25)]"
            >
              <img src={url} alt="" className="w-full h-full object-contain bg-[#F3EADC]" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxImg && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
              className="fixed inset-0 bg-[#2E1822]/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] max-w-[90vw] max-h-[85vh]"
            >
              <img src={lightboxImg} alt="" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute -top-3 -right-3 p-2 rounded-full bg-white shadow-lg text-[#2B2118]/60 hover:text-[#7B2D43] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userProfile, isAdmin, logout } = useAuth()
  const { addToCart, isInCart, cartCount } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  const [newRating, setNewRating] = useState(0)
  const [reviewerName, setReviewerName] = useState('')
  const [newComment, setNewComment] = useState('')
  const [newPhotos, setNewPhotos] = useState([])
  const [photoPreview, setPhotoPreview] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() })
        }
      } catch { /* product not found */ }
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    async function fetchReviews() {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', id)
        )
        const snap = await getDocs(q)
        const visibleReviews = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((review) => review.visible !== false)
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0
            const bTime = b.createdAt?.toMillis?.() || 0
            return bTime - aTime
          })
        setReviews(visibleReviews)
      } catch (err) {
        console.error('Error loading reviews:', err)
        setReviews([])
      }
      setReviewsLoading(false)
    }
    fetchReviews()
  }, [id])

  const sortedStyles = (() => {
    if (!product) return []
    const items = []
    if (product.styles?.length > 0) {
      product.styles.forEach((s, i) => {
        if (s.photos?.length > 0) {
          items.push({
            photos: s.photos,
            desc: s.description || product.desc || '',
            price: s.price || '',
            order: s.order || 0,
            origIdx: i,
          })
        }
      })
    } else {
      if (product.imageUrl) {
        items.push({ photos: [product.imageUrl], desc: product.desc || '', order: 0, origIdx: -1, price: '' })
      }
      ;(product.photos || []).forEach((url, i) => {
        const desc = (product.photoDescriptions || [])[i] || product.desc || ''
        const order = (product.photoOrder || [])[i] || 0
        const price = (product.photoPrices || [])[i] || ''
        items.push({ photos: [url], desc, order, origIdx: i, price })
      })
    }
    items.sort((a, b) => (b.order || 0) - (a.order || 0))
    return items
  })()

  const [stylePhotoIndex, setStylePhotoIndex] = useState({})

  const getStylePhotoIdx = (styleIdx) => stylePhotoIndex[styleIdx] || 0

  const setStylePhotoIdx = (styleIdx, photoIdx) => {
    setStylePhotoIndex((prev) => ({ ...prev, [styleIdx]: photoIdx }))
  }

  const getStyleDesc = (styleIdx) => sortedStyles[styleIdx]?.desc || product?.desc || ''

  const getStylePrice = (styleIdx) => sortedStyles[styleIdx]?.price || product?.price || ''

  const getCartId = (styleIdx) => {
    const item = sortedStyles[styleIdx]
    if (!item) return `${product?.id}_style_${styleIdx}`
    if (item.origIdx === -1) return `${product?.id}_style_0`
    return `${product?.id}_style_${item.origIdx}`
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  const customerPhotos = reviews.flatMap((r) => (r.photos || []).map((url) => ({ url, userName: r.userName })))

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setNewPhotos((prev) => [...prev, ...files])
    const previews = files.map((f) => URL.createObjectURL(f))
    setPhotoPreview((prev) => [...prev, ...previews])
  }

  const removeNewPhoto = (index) => {
    URL.revokeObjectURL(photoPreview[index])
    setNewPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (newRating === 0) {
      alert('Please select a rating')
      return
    }
    setSubmitting(true)
    try {
      let uploadedUrls = []
      if (newPhotos.length > 0) {
        uploadedUrls = await Promise.all(
          newPhotos.map(async (file) => {
            const compressed = await compressImage(file)
            const storageRef = ref(storage, `reviews/${id}/${Date.now()}_${compressed.name}`)
            await uploadBytes(storageRef, compressed)
            return getDownloadURL(storageRef)
          })
        )
      }

      const reviewData = {
        productId: id,
        productName: product?.name || '',
        userId: user?.uid || '',
        userName: reviewerName.trim() || userProfile?.name || user?.displayName || 'Customer',
        rating: newRating,
        comment: newComment.trim(),
        photos: uploadedUrls,
        createdAt: serverTimestamp(),
        visible: true,
      }

      const docRef = await addDoc(collection(db, 'reviews'), reviewData)
      setReviews((prev) => [{ id: docRef.id, ...reviewData, createdAt: { toDate: () => new Date() } }, ...prev])
      setNewRating(0)
      if (!user) setReviewerName('')
      setNewComment('')
      photoPreview.forEach((url) => URL.revokeObjectURL(url))
      setNewPhotos([])
      setPhotoPreview([])
    } catch (err) {
      alert('Error submitting review: ' + err.message)
    }
    setSubmitting(false)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Delete this review?')) return
    try {
      await deleteDoc(doc(db, 'reviews', reviewId))
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch (err) {
      alert('Error deleting review: ' + err.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0]">
        <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} cartCount={cartCount} />
        <div className="pt-32 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#B07D3F]/20 border-t-[#7B2D43] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBF7F0]">
        <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} cartCount={cartCount} />
        <div className="pt-32 text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
            <Package className="w-8 h-8 text-[#B07D3F]/30" strokeWidth={1} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#2B2118]/70 mb-2">Product not found</h2>
          <p className="font-body italic text-[#2B2118]/40 mb-6">This product may have been removed or doesn't exist.</p>
          <Link to="/decors" className="inline-flex items-center gap-2 font-accent text-[11px] tracking-[0.2em] uppercase text-[#7B2D43] border border-[#7B2D43]/25 rounded-full px-6 py-3 hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
            <ArrowLeft className="w-3.5 h-3.5" /> Browse Collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <SEO
        title={product ? `${product.name} - Party Decor & Rentals` : 'Product Details'}
        description={product ? `${product.description || product.name} — available from Sais Creation in San Jose, CA. Custom event decor and rental props.` : 'View product details at Sais Creation.'}
        path={`/product/${id}`}
      />
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} cartCount={cartCount} />

      {/* Back link */}
      <div className="pt-28 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#7B2D43]/70 hover:text-[#7B2D43] transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </motion.div>
      </div>

      {/* Product Info Header */}
      <section className="relative overflow-hidden pb-8">
        <div className="absolute inset-0">
          <div className="hidden md:block absolute top-0 left-[5%] w-[30rem] h-[30rem] rounded-full bg-[#D9A5A0]/15 blur-[120px]" />
          <div className="hidden md:block absolute bottom-0 right-[5%] w-[26rem] h-[26rem] rounded-full bg-[#E2BF7E]/15 blur-[110px]" />
        </div>
        <div className="grain" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="max-w-3xl">
            <h1 className="font-display text-3xl md:text-4xl lg:text-[44px] font-semibold text-[#2B2118] leading-[1.08] tracking-[-0.01em] mb-5">
              {product.name}
            </h1>

            {product.price && (
              <p className="font-display italic text-2xl md:text-3xl text-[#B07D3F] font-semibold mb-4">{product.price}</p>
            )}

            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-5 py-3 px-5 bg-white rounded-2xl border border-[#B07D3F]/10 shadow-[0_2px_10px_rgba(59,31,43,0.04)] self-start w-fit">
                <StarRating rating={Math.round(Number(avgRating))} size="md" />
                <span className="font-display font-semibold text-[18px] text-[#2B2118]">{avgRating}</span>
                <span className="w-px h-5 bg-[#B07D3F]/15" />
                <span className="font-accent font-light text-[13px] md:text-[12px] text-[#2B2118]/70 md:text-[#2B2118]/45">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}

            {product.tag && (
              <span className="inline-flex font-accent font-medium text-[9px] tracking-[0.3em] uppercase bg-gradient-to-br from-[#8E3650] to-[#6A2438] text-[#FBF7F0] px-5 py-2.5 rounded-full shadow-[0_8px_24px_-6px_rgba(123,45,67,0.6)] mb-5">
                {product.tag}
              </span>
            )}

            <div className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-6 md:p-7 shadow-[0_4px_16px_rgba(59,31,43,0.04)]">
              <h3 className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#B07D3F] mb-3">About This Collection</h3>
              <p className="font-body text-[15px] text-[#2B2118]/80 md:text-[#2B2118]/60 leading-[1.9] whitespace-pre-line">
                {product.desc || 'No description available for this product.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Select Your Style — per-photo Add to Cart */}
      <section className="py-10 md:py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <div className="flex items-center gap-3 mb-8">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <span className="absolute inset-0 rotate-45 rounded-[9px] border border-[#B07D3F]/25 bg-[#B07D3F]/[0.04]" />
                <Sparkles className="w-4 h-4 text-[#7B2D43]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#2B2118]">
                  {sortedStyles.length > 1 ? 'Select Your Style' : 'Product'}
                </h2>
                <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
                  {sortedStyles.length > 1
                    ? `${sortedStyles.length} styles available — add the one you love`
                    : 'Add this item to your cart'}
                </p>
              </div>
            </div>
          </motion.div>

          <div className={`grid gap-6 ${sortedStyles.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {sortedStyles.map((style, i) => {
              const cartId = getCartId(i)
              const styleAdded = isInCart(cartId)
              const desc = getStyleDesc(i)
              const currentPhotoIdx = getStylePhotoIdx(i)
              const currentPhoto = style.photos[currentPhotoIdx] || style.photos[0]
              const hasMultiplePhotos = style.photos.length > 1

              return (
                <motion.div
                  key={i}
                  variants={fadeUp} custom={i}
                  initial="hidden" animate="visible"
                  className="group bg-white rounded-[1.75rem] overflow-hidden border border-[#B07D3F]/15 shadow-[0_4px_16px_rgba(59,31,43,0.05)] hover:border-[#7B2D43]/30 hover:shadow-[0_20px_50px_-16px_rgba(59,31,43,0.2)] transition-all duration-500"
                >
                  <div className="relative aspect-[4/5] bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/40 overflow-hidden">
                    <img
                      src={currentPhoto}
                      alt={`${product.name} - Style ${i + 1}`}
                      className="w-full h-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      loading="lazy"
                    />
                    {sortedStyles.length > 1 && (
                      <span className="absolute top-4 left-4 font-accent font-medium text-[9px] tracking-[0.2em] uppercase bg-white/90 backdrop-blur-sm text-[#2B2118]/70 px-3.5 py-1.5 rounded-full border border-[#B07D3F]/15 shadow-sm">
                        Style {i + 1}
                      </span>
                    )}
                    {hasMultiplePhotos && (
                      <>
                        <button
                          onClick={() => setStylePhotoIdx(i, (currentPhotoIdx - 1 + style.photos.length) % style.photos.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#B07D3F]/15 flex items-center justify-center text-[#2B2118]/60 hover:text-[#7B2D43] hover:bg-white shadow-sm transition-all duration-300"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setStylePhotoIdx(i, (currentPhotoIdx + 1) % style.photos.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#B07D3F]/15 flex items-center justify-center text-[#2B2118]/60 hover:text-[#7B2D43] hover:bg-white shadow-sm transition-all duration-300 rotate-180"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {style.photos.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              onClick={() => setStylePhotoIdx(i, dotIdx)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${dotIdx === currentPhotoIdx ? 'bg-[#7B2D43] scale-125' : 'bg-white/70 border border-[#2B2118]/15 hover:bg-white'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {hasMultiplePhotos && (
                      <span className="absolute top-4 right-4 font-accent font-light text-[9px] tracking-[0.15em] bg-[#2B2118]/60 backdrop-blur-sm text-white/90 px-2.5 py-1 rounded-full">
                        {currentPhotoIdx + 1}/{style.photos.length}
                      </span>
                    )}
                  </div>

                  {hasMultiplePhotos && (
                    <div className="px-4 pt-3 overflow-x-auto">
                      <div className="flex gap-1.5">
                        {style.photos.map((thumbUrl, tIdx) => (
                          <button
                            key={tIdx}
                            onClick={() => setStylePhotoIdx(i, tIdx)}
                            className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-300 ${tIdx === currentPhotoIdx ? 'border-[#7B2D43] shadow-[0_2px_8px_rgba(123,45,67,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <img src={thumbUrl} alt="" className="w-full h-full object-contain bg-[#F3EADC]" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-5 md:p-6">
                    {getStylePrice(i) && (
                      <p className="font-display italic text-lg text-[#B07D3F] font-semibold mb-2">{getStylePrice(i)}</p>
                    )}
                    {desc && (
                      <p className="font-body text-[14px] md:text-[13px] text-[#2B2118]/75 md:text-[#2B2118]/55 leading-relaxed line-clamp-3 mb-4">
                        {desc}
                      </p>
                    )}

                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => addToCart({
                          id: cartId,
                          productId: product.id,
                          styleIndex: style.origIdx,
                          name: sortedStyles.length > 1 ? `${product.name} — Style ${i + 1}` : product.name,
                          imageUrl: style.photos[0],
                          price: getStylePrice(i),
                          categoryId: product.categoryId || '',
                        })}
                        disabled={styleAdded}
                        className={`w-full inline-flex items-center justify-center gap-2.5 py-3.5 rounded-full font-accent font-medium text-[11px] tracking-[0.2em] uppercase transition-all duration-400 ${
                          styleAdded
                            ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                            : 'bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] shadow-[0_10px_28px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_16px_36px_-8px_rgba(123,45,67,0.6)] hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                      >
                        {styleAdded ? (<><Check className="w-4 h-4" strokeWidth={2} /> Added to Cart</>) : (<><ShoppingCart className="w-4 h-4" strokeWidth={1.6} /> Add to Cart</>)}
                      </button>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in "${product.name}"${sortedStyles.length > 1 ? ` (Style ${i + 1})` : ''}. Can you share more details?`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border border-[#B07D3F]/20 bg-white font-accent font-light text-[10px] tracking-[0.2em] uppercase text-[#2B2118]/60 hover:border-[#7B2D43]/35 hover:text-[#7B2D43] transition-all duration-300"
                      >
                        <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Enquire on WhatsApp
                      </a>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Customer Photos Section */}
      {customerPhotos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#B07D3F]/10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <span className="absolute inset-0 rotate-45 rounded-[9px] border border-[#B07D3F]/25 bg-[#B07D3F]/[0.04]" />
                <Camera className="w-4 h-4 text-[#7B2D43]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#2B2118]">Customer Photos</h2>
                <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
                  {customerPhotos.length} {customerPhotos.length === 1 ? 'photo' : 'photos'} from customers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {customerPhotos.map((photo, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-[#B07D3F]/10 hover:border-[#7B2D43]/30 transition-all duration-300 cursor-pointer shadow-[0_2px_8px_rgba(59,31,43,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(123,45,67,0.2)]">
                  <img src={photo.url} alt="" className="w-full h-full object-contain bg-[#F3EADC] group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E1822]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                    <span className="font-accent text-[9px] text-white/80 truncate">{photo.userName}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Ratings Summary & Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#B07D3F]/10">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-10">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-[9px] border border-[#B07D3F]/25 bg-[#B07D3F]/[0.04]" />
              <Star className="w-4 h-4 text-[#7B2D43]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#2B2118]">Ratings & Reviews</h2>
              <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 mb-12">
              {/* Rating summary */}
              <div className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-7 shadow-[0_2px_12px_rgba(59,31,43,0.04)] self-start">
                <div className="text-center mb-5">
                  <p className="font-display text-5xl font-semibold text-[#2B2118]">{avgRating}</p>
                  <StarRating rating={Math.round(Number(avgRating))} size="md" />
                  <p className="font-accent font-light text-[11px] text-[#2B2118]/40 mt-1.5">
                    {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}
                  </p>
                </div>
                <div className="space-y-2">
                  {ratingCounts.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="font-accent text-[11px] text-[#2B2118]/50 w-3 text-right">{star}</span>
                      <Star className="w-3 h-3 fill-[#B07D3F] text-[#B07D3F]" strokeWidth={1.5} />
                      <div className="flex-1 h-2 bg-[#F3EADC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#B07D3F] to-[#D9A5A0] rounded-full transition-all duration-700"
                          style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="font-accent text-[10px] text-[#2B2118]/35 w-6">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isOwner={user?.uid === review.userId || isAdmin}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>
            </div>
          )}

          {reviews.length === 0 && !reviewsLoading && (
            <div className="text-center py-12 mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
                <Star className="w-6 h-6 text-[#B07D3F]/25" strokeWidth={1} />
              </div>
              <p className="font-display text-lg text-[#2B2118]/70 md:text-[#2B2118]/50 mb-1">No reviews yet</p>
              <p className="font-body italic text-[14px] md:text-[13px] text-[#2B2118]/60 md:text-[#2B2118]/35">Be the first to review this product!</p>
            </div>
          )}

          {/* Write a Review */}
          <div className="bg-white rounded-[1.75rem] border border-[#B07D3F]/10 p-7 md:p-9 shadow-[0_2px_12px_rgba(59,31,43,0.04)]">
            <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-6">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-5">
              <div>
                <label className="font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/50 block mb-2.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder={userProfile?.name || user?.displayName || 'Your name'}
                  className="w-full bg-[#FBF7F0] border border-[#B07D3F]/15 rounded-full px-5 py-4 font-body text-[14px] text-[#2B2118] placeholder:text-[#2B2118]/25 outline-none focus:border-[#7B2D43]/30 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300"
                />
              </div>

              <div>
                <label className="font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/50 block mb-2.5">
                  Your Rating
                </label>
                <StarRating rating={newRating} size="lg" interactive onChange={setNewRating} />
              </div>

              <div>
                <label className="font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/50 block mb-2.5">
                  Your Review
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product..."
                  className="w-full bg-[#FBF7F0] border border-[#B07D3F]/15 rounded-2xl px-5 py-4 font-body text-[14px] text-[#2B2118] placeholder:text-[#2B2118]/25 outline-none resize-none focus:border-[#7B2D43]/30 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300"
                />
              </div>

              <div>
                <label className="font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/50 block mb-2.5">
                  Add Photos <span className="normal-case tracking-normal text-[#2B2118]/30">(optional)</span>
                </label>
                {photoPreview.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {photoPreview.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-20 h-20 rounded-xl object-contain bg-[#F3EADC] border border-[#B07D3F]/15" />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(i)}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-white border border-red-200 text-red-400 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-dashed border-[#B07D3F]/25 font-accent font-light text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/45 hover:border-[#7B2D43]/40 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.03] transition-all duration-300"
                >
                  <Camera className="w-4 h-4" strokeWidth={1.5} />
                  Upload Photos
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || newRating === 0}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.25em] uppercase shadow-[0_10px_28px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_16px_40px_-10px_rgba(123,45,67,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                )}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2E1822] relative overflow-hidden rounded-t-[2.5rem] md:rounded-t-[3rem] mt-8">
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
            <div className="flex gap-2">
              <a href="https://www.instagram.com/decor_by_saiscreations_llc" target="_blank" rel="noopener noreferrer" aria-label="Instagram Decors" className="w-10 h-10 rounded-full border border-[#FBF7F0]/12 hover:border-[#D9A5A0]/70 flex items-center justify-center text-[#FBF7F0]/40 hover:text-[#D9A5A0] transition-all duration-400 hover:bg-[#D9A5A0]/10">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/></svg>
              </a>
              <a href="https://www.instagram.com/decor_by_saiscreations_rentals" target="_blank" rel="noopener noreferrer" aria-label="Instagram Rentals" className="w-10 h-10 rounded-full border border-[#FBF7F0]/12 hover:border-[#D9A5A0]/70 flex items-center justify-center text-[#FBF7F0]/40 hover:text-[#D9A5A0] transition-all duration-400 hover:bg-[#D9A5A0]/10">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/></svg>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="font-accent font-light text-[10px] tracking-[0.2em] uppercase text-[#FBF7F0]/40 hover:text-[#D9A5A0] transition-colors duration-300">Privacy Policy</Link>
              <span className="w-1 h-1 rounded-full bg-[#FBF7F0]/15" />
              <Link to="/terms" className="font-accent font-light text-[10px] tracking-[0.2em] uppercase text-[#FBF7F0]/40 hover:text-[#D9A5A0] transition-colors duration-300">Terms</Link>
            </div>
            <p className="font-accent font-light text-[10px] text-[#FBF7F0]/30 tracking-[0.25em] uppercase">
              &copy; {new Date().getFullYear()} Sais Creation · All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
