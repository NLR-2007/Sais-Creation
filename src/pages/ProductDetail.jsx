import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { db, storage } from '../config/firebase'
import {
  doc, getDoc, collection, getDocs, addDoc, deleteDoc,
  query, orderBy, where, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  Sparkles, ArrowLeft, ShoppingCart, Check, Star, ChevronLeft, ChevronRight,
  Send, Camera, X, Menu, LogIn, LogOut, Shield, Package, MessageCircle,
  Trash2, User, Image as ImageIcon,
} from 'lucide-react'

const WHATSAPP_NUMBER = '14083874854'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

function Navbar({ user, isAdmin, onLogout }) {
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
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-[10px] border border-[#B07D3F]/60 bg-gradient-to-br from-[#F3EADC]/80 to-transparent group-hover:rotate-[135deg] group-hover:border-[#7B2D43]/50 transition-all duration-700 shadow-[0_4px_14px_-4px_rgba(176,125,63,0.4)]" />
              <Sparkles className="w-[18px] h-[18px] text-[#7B2D43]" strokeWidth={1.5} />
            </div>
            <div className="leading-none">
              <span className="font-display text-2xl md:text-[26px] font-semibold text-[#2B2118] tracking-wide block group-hover:text-[#7B2D43] transition-colors duration-300">
                Sais Creation
              </span>
              <span className="font-accent font-light text-[8.5px] tracking-[0.5em] uppercase text-[#B07D3F]">
                Decor &nbsp;·&nbsp; Rentals
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Home
            </Link>
            <Link to="/gallery" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Gallery
            </Link>
            <Link to="/products" className="font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/65 hover:text-[#7B2D43] px-4 py-2 rounded-full hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
              Products
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
                  Home
                </Link>
                <Link to="/gallery" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Gallery
                </Link>
                <Link to="/products" onClick={() => setMobileOpen(false)} className="flex items-center justify-between font-accent font-light text-[13px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:text-[#7B2D43] px-5 py-3.5 rounded-2xl hover:bg-[#F3EADC]/70 transition-all duration-300">
                  Products
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
        <p className="font-body text-[14px] text-[#2B2118]/60 leading-relaxed mb-3">
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
              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
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
  const { addToCart, isInCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  const [newRating, setNewRating] = useState(0)
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
          where('productId', '==', id),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch { /* no reviews yet */ }
      setReviewsLoading(false)
    }
    fetchReviews()
  }, [id])

  const allPhotos = product
    ? [...(product.imageUrl ? [product.imageUrl] : []), ...(product.photos || [])]
    : []

  const inCart = product ? isInCart(product.id) : false

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
    if (!user) return
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
            const storageRef = ref(storage, `reviews/${id}/${Date.now()}_${file.name}`)
            await uploadBytes(storageRef, file)
            return getDownloadURL(storageRef)
          })
        )
      }

      const reviewData = {
        productId: id,
        userId: user.uid,
        userName: userProfile?.name || user.displayName || 'Customer',
        rating: newRating,
        comment: newComment.trim(),
        photos: uploadedUrls,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'reviews'), reviewData)
      setReviews((prev) => [{ id: docRef.id, ...reviewData, createdAt: { toDate: () => new Date() } }, ...prev])
      setNewRating(0)
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
        <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />
        <div className="pt-32 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#B07D3F]/20 border-t-[#7B2D43] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBF7F0]">
        <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />
        <div className="pt-32 text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
            <Package className="w-8 h-8 text-[#B07D3F]/30" strokeWidth={1} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#2B2118]/70 mb-2">Product not found</h2>
          <p className="font-body italic text-[#2B2118]/40 mb-6">This product may have been removed or doesn't exist.</p>
          <Link to="/products" className="inline-flex items-center gap-2 font-accent text-[11px] tracking-[0.2em] uppercase text-[#7B2D43] border border-[#7B2D43]/25 rounded-full px-6 py-3 hover:bg-[#7B2D43]/[0.06] transition-all duration-300">
            <ArrowLeft className="w-3.5 h-3.5" /> Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />

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

      {/* Product Hero */}
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-[5%] w-[30rem] h-[30rem] rounded-full bg-[#D9A5A0]/15 blur-[120px]" />
          <div className="absolute bottom-0 right-[5%] w-[26rem] h-[26rem] rounded-full bg-[#E2BF7E]/15 blur-[110px]" />
        </div>
        <div className="grain" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Photo Gallery */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="sticky top-28">
              <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/40 aspect-[4/5] shadow-[0_30px_80px_-20px_rgba(59,31,43,0.22)] border border-white/60">
                {allPhotos.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activePhoto}
                        src={allPhotos[activePhoto]}
                        alt={product.name}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    {allPhotos.length > 1 && (
                      <>
                        <button
                          onClick={() => setActivePhoto((p) => (p - 1 + allPhotos.length) % allPhotos.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 backdrop-blur-md text-[#2B2118]/60 hover:text-[#7B2D43] shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] hover:scale-105 transition-all duration-300"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActivePhoto((p) => (p + 1) % allPhotos.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 backdrop-blur-md text-[#2B2118]/60 hover:text-[#7B2D43] shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] hover:scale-105 transition-all duration-300"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 bg-[#2E1822]/40 backdrop-blur-md px-4 py-2 rounded-full">
                          {allPhotos.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActivePhoto(i)}
                              className={`h-2 rounded-full transition-all duration-400 ${i === activePhoto ? 'bg-white w-7' : 'bg-white/40 w-2 hover:bg-white/70'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {product.tag && (
                      <span className="absolute top-5 left-5 font-accent font-medium text-[9px] tracking-[0.3em] uppercase bg-gradient-to-br from-[#8E3650] to-[#6A2438] text-[#FBF7F0] px-5 py-2.5 rounded-full shadow-[0_8px_24px_-6px_rgba(123,45,67,0.6)]">
                        {product.tag}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <Package className="w-16 h-16 text-[#B07D3F]/20" strokeWidth={1} />
                    <span className="font-accent font-light text-[11px] tracking-[0.3em] uppercase text-[#2B2118]/20">No Image</span>
                  </div>
                )}
              </div>

              {allPhotos.length > 1 && (
                <div className="flex gap-3 mt-5 overflow-x-auto pb-2 scrollbar-hide">
                  {allPhotos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-[0_4px_12px_rgba(59,31,43,0.06)] ${
                        i === activePhoto
                          ? 'border-[#7B2D43] shadow-[0_6px_20px_-4px_rgba(123,45,67,0.35)] scale-105'
                          : 'border-white/80 opacity-55 hover:opacity-100 hover:border-[#B07D3F]/40'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="flex flex-col pt-2">
              <h1 className="font-display text-3xl md:text-4xl lg:text-[44px] font-semibold text-[#2B2118] leading-[1.08] tracking-[-0.01em] mb-5">
                {product.name}
              </h1>

              {product.price && (
                <p className="font-display italic text-2xl md:text-3xl text-[#B07D3F] font-semibold mb-4">{product.price}</p>
              )}

              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-5 py-3 px-5 bg-white rounded-2xl border border-[#B07D3F]/10 shadow-[0_2px_10px_rgba(59,31,43,0.04)] self-start">
                  <StarRating rating={Math.round(Number(avgRating))} size="md" />
                  <span className="font-display font-semibold text-[18px] text-[#2B2118]">{avgRating}</span>
                  <span className="w-px h-5 bg-[#B07D3F]/15" />
                  <span className="font-accent font-light text-[12px] text-[#2B2118]/45">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 my-5">
                <span className="h-px flex-1 bg-gradient-to-r from-[#B07D3F]/30 to-transparent" />
                <Sparkles className="w-3.5 h-3.5 text-[#B07D3F]/30" strokeWidth={1.2} />
                <span className="h-px flex-1 bg-gradient-to-l from-[#B07D3F]/30 to-transparent" />
              </div>

              <div className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-6 md:p-7 shadow-[0_4px_16px_rgba(59,31,43,0.04)] mb-8">
                <h3 className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#B07D3F] mb-3">Description</h3>
                <p className="font-body text-[15px] text-[#2B2118]/60 leading-[1.9] whitespace-pre-line">
                  {product.desc || 'No description available for this product.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => addToCart({ id: product.id, name: product.name, price: product.price || '', imageUrl: product.imageUrl || '' })}
                  disabled={inCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 py-4.5 rounded-full font-accent font-medium text-[12px] tracking-[0.25em] uppercase transition-all duration-400 ${
                    inCart
                      ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                      : 'bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] shadow-[0_14px_40px_-10px_rgba(123,45,67,0.55),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_20px_50px_-12px_rgba(123,45,67,0.6)] hover:-translate-y-1 active:translate-y-0'
                  }`}
                >
                  {inCart ? (<><Check className="w-4 h-4" /> Added to Cart</>) : (<><ShoppingCart className="w-4 h-4" strokeWidth={1.6} /> Add to Cart</>)}
                </button>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in "${product.name}". Can you share more details?`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-4.5 rounded-full border border-[#B07D3F]/25 bg-white font-accent font-light text-[12px] tracking-[0.25em] uppercase text-[#2B2118]/70 hover:border-[#7B2D43]/40 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.03] hover:-translate-y-1 transition-all duration-400 shadow-[0_4px_16px_rgba(59,31,43,0.04)]"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  Enquire on WhatsApp
                </a>
              </div>
            </motion.div>
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
                  <img src={photo.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
              <p className="font-display text-lg text-[#2B2118]/50 mb-1">No reviews yet</p>
              <p className="font-body italic text-[13px] text-[#2B2118]/35">Be the first to review this product!</p>
            </div>
          )}

          {/* Write a Review */}
          {user ? (
            <div className="bg-white rounded-[1.75rem] border border-[#B07D3F]/10 p-7 md:p-9 shadow-[0_2px_12px_rgba(59,31,43,0.04)]">
              <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-6">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-5">
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
                          <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover border border-[#B07D3F]/15" />
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
          ) : (
            <div className="bg-[#F3EADC]/50 rounded-[1.5rem] border border-[#B07D3F]/10 p-8 text-center">
              <p className="font-body text-[14px] text-[#2B2118]/50 mb-4">Sign in to write a review</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.2em] uppercase shadow-[0_8px_20px_-8px_rgba(123,45,67,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(123,45,67,0.55)] hover:-translate-y-0.5 transition-all duration-400"
              >
                <LogIn className="w-4 h-4" strokeWidth={1.5} />
                Sign In
              </Link>
            </div>
          )}
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
