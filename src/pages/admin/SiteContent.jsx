import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../config/firebase'
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore'
import {
  FileText, Save, Plus, Pencil, Trash2, X, Star, MessageSquare,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const SECTIONS = [
  { id: 'hero', label: 'Hero Section', fields: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'titleItalic', label: 'Title (Italic part)', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
    { key: 'badge', label: 'Badge Text', type: 'text' },
  ]},
  { id: 'about', label: 'About Section', fields: [
    { key: 'eyebrow', label: 'Eyebrow Text', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'titleItalic', label: 'Title (Italic part)', type: 'text' },
    { key: 'paragraph1', label: 'Paragraph 1', type: 'textarea' },
    { key: 'paragraph2', label: 'Paragraph 2', type: 'textarea' },
    { key: 'founderName', label: 'Founder Name', type: 'text' },
    { key: 'founderTitle', label: 'Founder Title', type: 'text' },
  ]},
  { id: 'contact', label: 'Contact Section', fields: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
    { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'hours', label: 'Business Hours', type: 'text' },
  ]},
  { id: 'cta', label: 'CTA Banner', fields: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'titleItalic', label: 'Title (Italic part)', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
    { key: 'buttonText', label: 'Button Text', type: 'text' },
  ]},
  { id: 'footer', label: 'Footer', fields: [
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'instagramUrl', label: 'Instagram URL', type: 'text' },
    { key: 'facebookUrl', label: 'Facebook URL', type: 'text' },
  ]},
]

export default function SiteContent() {
  const [activeSection, setActiveSection] = useState('hero')
  const [sectionData, setSectionData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  // Testimonials
  const [testimonials, setTestimonials] = useState([])
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [testForm, setTestForm] = useState({ name: '', event: '', text: '', rating: 5 })
  const [testSaving, setTestSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const allData = {}
        for (const sec of SECTIONS) {
          const snap = await getDoc(doc(db, 'siteContent', sec.id))
          if (snap.exists()) allData[sec.id] = snap.data()
          else allData[sec.id] = {}
        }
        setSectionData(allData)

        const tq = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
        const tSnap = await getDocs(tq)
        setTestimonials(tSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        // Firestore not set up yet
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  const handleFieldChange = (sectionId, fieldKey, value) => {
    setSectionData((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [fieldKey]: value },
    }))
  }

  const handleSaveSection = async (sectionId) => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'siteContent', sectionId), {
        ...sectionData[sectionId],
        updatedAt: serverTimestamp(),
      }, { merge: true })
      setSavedMsg(sectionId)
      setTimeout(() => setSavedMsg(''), 2000)
    } catch (err) {
      alert('Error saving: ' + err.message)
    }
    setSaving(false)
  }

  // Testimonials CRUD
  const fetchTestimonials = async () => {
    try {
      const tq = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(tq)
      setTestimonials(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch { /* */ }
  }

  const openTestCreate = () => {
    setEditingTest(null)
    setTestForm({ name: '', event: '', text: '', rating: 5 })
    setTestModalOpen(true)
  }

  const openTestEdit = (t) => {
    setEditingTest(t)
    setTestForm({ name: t.name, event: t.event, text: t.text, rating: t.rating || 5 })
    setTestModalOpen(true)
  }

  const handleTestSave = async (e) => {
    e.preventDefault()
    if (!testForm.name.trim() || !testForm.text.trim()) return
    setTestSaving(true)
    try {
      const data = {
        name: testForm.name.trim(),
        event: testForm.event.trim(),
        text: testForm.text.trim(),
        rating: testForm.rating,
      }
      if (editingTest) {
        await updateDoc(doc(db, 'testimonials', editingTest.id), { ...data, updatedAt: serverTimestamp() })
      } else {
        await addDoc(collection(db, 'testimonials'), { ...data, createdAt: serverTimestamp() })
      }
      await fetchTestimonials()
      setTestModalOpen(false)
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setTestSaving(false)
  }

  const handleTestDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id))
      await fetchTestimonials()
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setDeleteConfirm(null)
  }

  const currentSection = SECTIONS.find((s) => s.id === activeSection)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B1F2B] to-[#2E1822] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(59,31,43,0.4)]">
          <FileText className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">Site Content</h1>
          <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
            Edit text, testimonials & more
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Section tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:sticky lg:top-24 lg:self-start">
          <nav className="bg-white rounded-[1.25rem] border border-[#B07D3F]/10 shadow-[var(--shadow-sm)] p-2 space-y-1">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-accent text-[12px] tracking-[0.1em] transition-all duration-300 ${
                  activeSection === sec.id
                    ? 'bg-[#7B2D43]/[0.08] text-[#7B2D43] font-medium'
                    : 'text-[#2B2118]/50 hover:text-[#2B2118]/70 hover:bg-[#F3EADC]/50'
                }`}
              >
                {sec.label}
              </button>
            ))}
            <button
              onClick={() => setActiveSection('testimonials')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-accent text-[12px] tracking-[0.1em] transition-all duration-300 ${
                activeSection === 'testimonials'
                  ? 'bg-[#7B2D43]/[0.08] text-[#7B2D43] font-medium'
                  : 'text-[#2B2118]/50 hover:text-[#2B2118]/70 hover:bg-[#F3EADC]/50'
              }`}
            >
              Testimonials
            </button>
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {loading ? (
            <div className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-8 animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-[#F3EADC] rounded-full w-1/4 mb-3" />
                  <div className="h-10 bg-[#F3EADC] rounded-full" />
                </div>
              ))}
            </div>
          ) : activeSection === 'testimonials' ? (
            /* Testimonials Section */
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-semibold text-[#2B2118]">Testimonials</h2>
                <button onClick={openTestCreate} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.15em] uppercase px-5 py-2.5 shadow-[0_6px_18px_-6px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_12px_28px_-8px_rgba(123,45,67,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400">
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  Add
                </button>
              </div>

              {testimonials.length === 0 ? (
                <div className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-12 text-center">
                  <MessageSquare className="w-8 h-8 text-[#B07D3F]/25 mx-auto mb-3" strokeWidth={1} />
                  <p className="font-body italic text-[#2B2118]/40">No testimonials yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testimonials.map((t) => (
                    <div key={t.id} className="group bg-white rounded-[1.25rem] border border-[#B07D3F]/10 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-400 p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2] border border-[#B07D3F]/15 flex items-center justify-center shrink-0 font-display font-semibold text-[#7B2D43] text-sm">
                          {t.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-display text-base font-semibold text-[#2B2118]">{t.name}</span>
                            {t.event && <span className="font-accent font-light text-[10px] tracking-[0.15em] text-[#B07D3F]">— {t.event}</span>}
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < (t.rating || 5) ? 'text-[#B07D3F] fill-[#B07D3F]' : 'text-[#B07D3F]/20'}`} strokeWidth={1.5} />
                            ))}
                          </div>
                          <p className="font-body text-[13px] text-[#2B2118]/55 leading-relaxed line-clamp-2">{t.text}</p>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                          <button onClick={() => openTestEdit(t)} className="p-2 rounded-lg border border-[#B07D3F]/15 text-[#7B2D43] hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setDeleteConfirm(t.id)} className="p-2 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-all duration-300">
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentSection ? (
            /* Regular section editor */
            <div className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="px-7 py-5 border-b border-[#B07D3F]/10 bg-gradient-to-b from-[#F3EADC]/40 to-transparent flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-[#2B2118]">{currentSection.label}</h2>
                <AnimatePresence>
                  {savedMsg === activeSection && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="font-accent text-[11px] tracking-[0.15em] text-green-600 bg-green-50 px-3 py-1 rounded-full"
                    >
                      Saved!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="px-7 py-6 space-y-5">
                {currentSection.fields.map((field) => (
                  <div key={field.key}>
                    <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={sectionData[activeSection]?.[field.key] || ''}
                        onChange={(e) => handleFieldChange(activeSection, field.key, e.target.value)}
                        className="lux-field"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={sectionData[activeSection]?.[field.key] || ''}
                        onChange={(e) => handleFieldChange(activeSection, field.key, e.target.value)}
                        className="lux-field !pl-5"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="px-7 py-5 border-t border-[#B07D3F]/10 bg-gradient-to-t from-[#F3EADC]/30 to-transparent">
                <button
                  onClick={() => handleSaveSection(activeSection)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.15em] uppercase px-8 py-3.5 shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_14px_36px_-8px_rgba(123,45,67,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* Testimonial Delete */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="fixed inset-0 bg-[#2E1822]/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[1.5rem] shadow-[var(--shadow-lg)] p-8 z-50 text-center"
            >
              <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-2">Delete Testimonial?</h3>
              <p className="font-body text-sm text-[#2B2118]/50 mb-7">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-full border border-[#B07D3F]/20 font-accent text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/60">Cancel</button>
                <button onClick={() => handleTestDelete(deleteConfirm)} className="flex-1 py-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-accent text-[11px] tracking-[0.15em] uppercase shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)]">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Testimonial Create/Edit Modal */}
      <AnimatePresence>
        {testModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTestModalOpen(false)} className="fixed inset-0 bg-[#2E1822]/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[1.75rem] border border-[#B07D3F]/15 shadow-[var(--shadow-lg)] z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-[#B07D3F]/10 bg-gradient-to-b from-[#F3EADC]/40 to-transparent">
                <h3 className="font-display text-xl font-semibold text-[#2B2118]">
                  {editingTest ? 'Edit Testimonial' : 'Add Testimonial'}
                </h3>
                <button onClick={() => setTestModalOpen(false)} className="p-2 rounded-full text-[#2B2118]/30 hover:text-[#7B2D43] transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTestSave} className="px-7 py-6 space-y-5">
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Name *</label>
                  <input type="text" value={testForm.name} onChange={(e) => setTestForm({ ...testForm, name: e.target.value })} placeholder="Customer name" className="lux-field !pl-5" required />
                </div>
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Event</label>
                  <input type="text" value={testForm.event} onChange={(e) => setTestForm({ ...testForm, event: e.target.value })} placeholder="e.g. Wedding Reception" className="lux-field !pl-5" />
                </div>
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Review *</label>
                  <textarea value={testForm.text} onChange={(e) => setTestForm({ ...testForm, text: e.target.value })} placeholder="Their feedback..." className="lux-field" rows={3} required />
                </div>
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" onClick={() => setTestForm({ ...testForm, rating: r })} className="p-1">
                        <Star className={`w-5 h-5 transition-colors duration-200 ${r <= testForm.rating ? 'text-[#B07D3F] fill-[#B07D3F]' : 'text-[#B07D3F]/20'}`} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="px-7 py-5 border-t border-[#B07D3F]/10 flex gap-3">
                <button type="button" onClick={() => setTestModalOpen(false)} className="flex-1 py-3.5 rounded-full border border-[#B07D3F]/20 font-accent text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/60">Cancel</button>
                <button
                  onClick={handleTestSave}
                  disabled={testSaving || !testForm.name.trim() || !testForm.text.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.15em] uppercase shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] disabled:opacity-60 disabled:pointer-events-none"
                >
                  {testSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
                  {testSaving ? 'Saving...' : editingTest ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
