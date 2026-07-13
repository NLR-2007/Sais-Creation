import { useEffect, useState } from 'react'
import { addDoc, collection, doc, getDocs, orderBy, query, Timestamp, updateDoc } from 'firebase/firestore'
import { Eye, EyeOff, MessageSquare, Plus, Star, X } from 'lucide-react'
import { db } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'

const today = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function Reviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ productId: '', userName: '', rating: 5, comment: '', date: today() })

  useEffect(() => {
    async function loadReviews() {
      try {
        const [reviewSnapshot, productSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'products')),
        ])
        setReviews(reviewSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
        setProducts(productSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
      } catch (error) {
        alert('Error loading reviews: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [])

  const toggleVisibility = async (review) => {
    const visible = review.visible === false
    setUpdating(review.id)
    try {
      await updateDoc(doc(db, 'reviews', review.id), { visible })
      setReviews((items) => items.map((item) => item.id === review.id ? { ...item, visible } : item))
    } catch (error) {
      alert('Error updating review: ' + error.message)
    } finally {
      setUpdating('')
    }
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    const product = products.find((item) => item.id === form.productId)
    if (!product || !form.userName.trim() || !form.comment.trim()) return

    setSaving(true)
    try {
      const reviewData = {
        productId: product.id,
        productName: product.name || 'Product',
        userId: user?.uid || 'admin',
        userName: form.userName.trim(),
        rating: form.rating,
        comment: form.comment.trim(),
        photos: [],
        visible: true,
        adminCreated: true,
        createdAt: Timestamp.fromDate(new Date(`${form.date}T12:00:00`)),
      }
      const created = await addDoc(collection(db, 'reviews'), reviewData)
      setReviews((items) => [{ id: created.id, ...reviewData }, ...items])
      setForm({ productId: '', userName: '', rating: 5, comment: '', date: today() })
      setFormOpen(false)
    } catch (error) {
      alert('Error creating review: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B1F2B] to-[#2E1822] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(59,31,43,0.4)]">
            <MessageSquare className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">Customer Reviews</h1>
            <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">Create reviews and choose which appear publicly</p>
          </div>
        </div>
        <button onClick={() => setFormOpen((open) => !open)} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] px-6 py-3 font-accent text-[10px] font-medium tracking-[0.18em] uppercase text-white shadow-[0_8px_22px_-8px_rgba(123,45,67,0.55)]">
          {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {formOpen ? 'Close' : 'Add Review'}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="bg-white rounded-[1.5rem] border border-[#B07D3F]/15 shadow-[var(--shadow-sm)] p-6 md:p-8 mb-7">
          <h2 className="font-display text-xl font-semibold text-[#2B2118] mb-6">Write a Review</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.25em] uppercase text-[#2B2118]/60 block mb-2">Product *</label>
              <select required value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} className="lux-field !pl-5">
                <option value="">Select a product</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name || 'Unnamed product'}</option>)}
              </select>
            </div>
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.25em] uppercase text-[#2B2118]/60 block mb-2">User Name *</label>
              <input required type="text" value={form.userName} onChange={(event) => setForm({ ...form, userName: event.target.value })} className="lux-field !pl-5" placeholder="Reviewer name" />
            </div>
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.25em] uppercase text-[#2B2118]/60 block mb-2">Date *</label>
              <input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="lux-field !pl-5" />
            </div>
            <div>
              <label className="font-accent font-light text-[10px] tracking-[0.25em] uppercase text-[#2B2118]/60 block mb-2">Rating *</label>
              <div className="h-[48px] flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} type="button" onClick={() => setForm({ ...form, rating })} aria-label={`${rating} stars`} className="p-1">
                    <Star className={`w-6 h-6 transition-colors ${rating <= form.rating ? 'fill-[#B07D3F] text-[#B07D3F]' : 'text-[#B07D3F]/25'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="font-accent font-light text-[10px] tracking-[0.25em] uppercase text-[#2B2118]/60 block mb-2">Comment *</label>
              <textarea required rows={4} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} className="lux-field" placeholder="Write the review comment" />
            </div>
          </div>
          <button disabled={saving} type="submit" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] px-8 py-3.5 font-accent text-[10px] font-medium tracking-[0.18em] uppercase text-white disabled:opacity-50">
            {saving ? 'Publishing...' : 'Publish Review'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center font-body text-[#2B2118]/45">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-12 text-center">
          <MessageSquare className="w-9 h-9 text-[#B07D3F]/25 mx-auto mb-3" strokeWidth={1} />
          <p className="font-body italic text-[#2B2118]/45">No customer reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const visible = review.visible !== false
            return (
              <article key={review.id} className={`bg-white rounded-[1.25rem] border p-5 shadow-[var(--shadow-sm)] ${visible ? 'border-[#B07D3F]/15' : 'border-[#2B2118]/10 opacity-70'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <h2 className="font-display text-lg font-semibold text-[#2B2118]">{review.userName || 'Customer'}</h2>
                      <div className="flex gap-0.5" aria-label={`${review.rating || 0} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`w-3.5 h-3.5 ${star <= (review.rating || 0) ? 'fill-[#B07D3F] text-[#B07D3F]' : 'text-[#B07D3F]/20'}`} />)}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 font-accent text-[9px] tracking-[0.15em] uppercase ${visible ? 'bg-green-50 text-green-700' : 'bg-[#2B2118]/5 text-[#2B2118]/50'}`}>{visible ? 'Displayed' : 'Hidden'}</span>
                    </div>
                    <p className="font-body text-[14px] leading-relaxed text-[#2B2118]/65">{review.comment || 'No written comment'}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-accent text-[10px] tracking-[0.15em] uppercase text-[#B07D3F]">
                      {review.productName && <span>Product: {review.productName}</span>}
                      {review.createdAt?.toDate && <span>{review.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                    </div>
                  </div>
                  <button onClick={() => toggleVisibility(review)} disabled={updating === review.id} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#7B2D43]/20 px-5 py-2.5 font-accent text-[10px] tracking-[0.15em] uppercase text-[#7B2D43] hover:bg-[#7B2D43]/5 disabled:opacity-50 transition-colors">
                    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {updating === review.id ? 'Saving...' : visible ? 'Hide review' : 'Display review'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
