import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ClipboardList, Plus, Save, Trash2 } from 'lucide-react'
import { db } from '../../config/firebase'

const DEFAULT_EVENT_TYPES = ['Wedding', 'Birthday', 'Engagement', 'Baby Shower', 'Corporate Event', 'Anniversary', 'Other']

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const parseEventTypes = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

export default function RequestQuote() {
  const [eventTypes, setEventTypes] = useState(DEFAULT_EVENT_TYPES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadEventTypes() {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'contact'))
        if (snap.exists()) {
          const savedTypes = parseEventTypes(snap.data().eventTypes)
          if (savedTypes.length > 0) setEventTypes(savedTypes)
        }
      } catch (error) {
        alert('Error loading request quote settings: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
    loadEventTypes()
  }, [])

  const updateType = (index, value) => {
    setEventTypes((items) => items.map((item, i) => (i === index ? value : item)))
  }

  const addType = () => {
    setEventTypes((items) => [...items, ''])
  }

  const removeType = (index) => {
    setEventTypes((items) => items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    const cleanedTypes = eventTypes.map((item) => item.trim()).filter(Boolean)
    if (cleanedTypes.length === 0) {
      alert('Please add at least one event type.')
      return
    }

    setSaving(true)
    try {
      await setDoc(doc(db, 'siteContent', 'contact'), {
        eventTypes: cleanedTypes,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      setEventTypes(cleanedTypes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      alert('Error saving event types: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B1F2B] to-[#2E1822] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(59,31,43,0.4)]">
            <ClipboardList className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">Request Quote</h1>
            <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
              Manage event type dropdown options
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] disabled:opacity-60 disabled:pointer-events-none"
        >
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="px-7 py-5 border-b border-[#B07D3F]/10 bg-gradient-to-b from-[#F3EADC]/40 to-transparent">
          <h2 className="font-display text-xl font-semibold text-[#2B2118]">Select Your Event Type</h2>
          <p className="font-body text-[14px] text-[#2B2118]/55 mt-1">
            These options appear in the public request quote dropdown.
          </p>
        </div>

        <div className="px-7 py-6 space-y-4">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((item) => <div key={item} className="h-12 rounded-full bg-[#F3EADC]" />)}
            </div>
          ) : (
            eventTypes.map((eventType, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={eventType}
                  onChange={(event) => updateType(index, event.target.value)}
                  placeholder="Event type"
                  className="lux-field !pl-5"
                />
                <button
                  type="button"
                  onClick={() => removeType(index)}
                  disabled={eventTypes.length === 1}
                  aria-label="Remove event type"
                  className="shrink-0 w-12 h-12 rounded-full border border-red-200 text-red-400 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={addType}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[#B07D3F]/30 bg-white/60 text-[#7B2D43] font-accent font-light text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:border-[#7B2D43]/50 hover:bg-[#7B2D43]/[0.04] disabled:opacity-60 transition-all duration-300"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Event Type
          </button>
        </div>
      </motion.div>
    </div>
  )
}
