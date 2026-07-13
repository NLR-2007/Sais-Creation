import { useEffect, useState } from 'react'
import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { Eye, EyeOff, MessageSquare, Star } from 'lucide-react'
import { db } from '../../config/firebase'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState('')

  useEffect(() => {
    async function loadReviews() {
      try {
        const snapshot = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')))
        setReviews(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B1F2B] to-[#2E1822] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(59,31,43,0.4)]">
          <MessageSquare className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">Customer Reviews</h1>
          <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">Choose which reviews appear publicly</p>
        </div>
      </div>

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
                    {review.productName && <p className="mt-3 font-accent text-[10px] tracking-[0.15em] uppercase text-[#B07D3F]">Product: {review.productName}</p>}
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
