import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db, storage } from '../../config/firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import {
  LayoutList, Plus, Pencil, Trash2, X, Save, Upload, GripVertical,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const EMPTY = { name: '', imageUrl: '', type: 'decors' }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'))
      const snap = await getDocs(q)
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      setCategories([])
    }
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, 'categories'), orderBy('order', 'asc'))
        const snap = await getDocs(q)
        if (!cancelled) setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        if (!cancelled) setCategories([])
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setImageFile(null)
    setImagePreview('')
    setModalOpen(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, imageUrl: cat.imageUrl || '', type: cat.type || 'decors' })
    setImageFile(null)
    setImagePreview(cat.imageUrl || '')
    setModalOpen(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    try {
      let imageUrl = form.imageUrl

      if (imageFile) {
        const storageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }

      const data = {
        name: form.name.trim(),
        imageUrl,
        type: form.type || 'decors',
      }

      if (editing) {
        await updateDoc(doc(db, 'categories', editing.id), { ...data, updatedAt: serverTimestamp() })
      } else {
        await addDoc(collection(db, 'categories'), {
          ...data,
          order: categories.length,
          createdAt: serverTimestamp(),
        })
      }

      await fetchCategories()
      setModalOpen(false)
    } catch (err) {
      alert('Error saving category: ' + err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      const cat = categories.find((c) => c.id === id)
      if (cat?.imageUrl) {
        try {
          const imgRef = ref(storage, cat.imageUrl)
          await deleteObject(imgRef)
        } catch { /* may not exist */ }
      }
      await deleteDoc(doc(db, 'categories', id))
      await fetchCategories()
    } catch (err) {
      alert('Error deleting category: ' + err.message)
    }
    setDeleteConfirm(null)
  }

  const moveCategory = async (index, direction) => {
    const newList = [...categories]
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= newList.length) return
    ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]

    setCategories(newList)
    try {
      await Promise.all(
        newList.map((cat, i) => updateDoc(doc(db, 'categories', cat.id), { order: i }))
      )
    } catch (err) {
      alert('Error reordering: ' + err.message)
      await fetchCategories()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B07D3F] to-[#8C5A2B] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(176,125,63,0.4)]">
            <LayoutList className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">Categories</h1>
            <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
              {categories.length} categories · Organize your products
            </p>
          </div>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.2em] uppercase px-6 py-3 shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_14px_36px_-8px_rgba(123,45,67,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400">
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Category
        </button>
      </motion.div>

      <p className="font-body text-sm text-[#2B2118]/45 mb-6 italic">
        Create categories to organize your products. Customers will be able to filter products by category. Use the arrows to reorder.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[1.25rem] border border-[#B07D3F]/10 p-5 animate-pulse flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F3EADC] rounded-xl" />
              <div className="flex-1">
                <div className="h-5 bg-[#F3EADC] rounded-full w-1/3 mb-2" />
                <div className="h-3 bg-[#F3EADC] rounded-full w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
            <LayoutList className="w-7 h-7 text-[#B07D3F]/30" strokeWidth={1} />
          </div>
          <p className="font-body italic text-[#2B2118]/40 mb-2">No categories yet</p>
          <button onClick={openCreate} className="font-accent text-[12px] tracking-[0.15em] text-[#7B2D43] underline underline-offset-4 decoration-[#7B2D43]/30 hover:decoration-[#7B2D43]/70 transition-colors duration-300">
            Create your first category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              variants={fadeUp} initial="hidden" animate="visible"
              className="group bg-white rounded-[1.25rem] border border-[#B07D3F]/10 shadow-[0_2px_10px_rgba(59,31,43,0.04)] hover:border-[#7B2D43]/25 hover:shadow-[0_12px_30px_-10px_rgba(59,31,43,0.15)] transition-all duration-500 overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveCategory(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded text-[#2B2118]/25 hover:text-[#7B2D43] disabled:opacity-20 disabled:cursor-default transition-colors duration-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button
                    onClick={() => moveCategory(index, 1)}
                    disabled={index === categories.length - 1}
                    className="p-1 rounded text-[#2B2118]/25 hover:text-[#7B2D43] disabled:opacity-20 disabled:cursor-default transition-colors duration-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>

                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/50 border border-[#B07D3F]/15 overflow-hidden shrink-0">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LayoutList className="w-5 h-5 text-[#B07D3F]/25" strokeWidth={1} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-[#2B2118] truncate">{cat.name}</h3>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full font-accent text-[9px] tracking-[0.2em] uppercase ${cat.type === 'rentals' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {cat.type === 'rentals' ? 'Rentals' : 'Decors'}
                    </span>
                  </div>
                  <p className="font-accent font-light text-[10px] tracking-[0.2em] uppercase text-[#B07D3F]">
                    Position {index + 1}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2.5 rounded-xl border border-[#B07D3F]/15 bg-white text-[#7B2D43] hover:bg-[#7B2D43]/[0.05] hover:border-[#7B2D43]/30 transition-all duration-300"
                  >
                    <Pencil className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat.id)}
                    className="p-2.5 rounded-xl border border-[#B07D3F]/15 bg-white text-red-400 hover:bg-red-50 hover:border-red-200 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="fixed inset-0 bg-[#2E1822]/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[1.5rem] border border-[#B07D3F]/15 shadow-[var(--shadow-lg)] p-8 z-50 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-2">Delete Category?</h3>
              <p className="font-body text-sm text-[#2B2118]/50 mb-7">Products in this category won't be deleted but will become uncategorized.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-full border border-[#B07D3F]/20 font-accent text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/60 hover:border-[#B07D3F]/40 transition-all duration-300">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-accent text-[11px] tracking-[0.15em] uppercase shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 transition-all duration-300">
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="fixed inset-0 bg-[#2E1822]/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[1.75rem] border border-[#B07D3F]/15 shadow-[var(--shadow-lg)] z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-[#B07D3F]/10 bg-gradient-to-b from-[#F3EADC]/40 to-transparent">
                <h3 className="font-display text-xl font-semibold text-[#2B2118]">
                  {editing ? 'Edit Category' : 'New Category'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full text-[#2B2118]/30 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="px-7 py-6 space-y-5">
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Category Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="cat-image" />
                  <label
                    htmlFor="cat-image"
                    className="flex items-center justify-center w-full h-36 rounded-[1.25rem] border-2 border-dashed border-[#B07D3F]/20 hover:border-[#7B2D43]/30 bg-[#F3EADC]/30 cursor-pointer transition-colors duration-300 overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-[#B07D3F]/40 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="font-accent font-light text-[10px] tracking-[0.2em] uppercase text-[#2B2118]/35">
                          Click to upload
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Balloon Decorations"
                    className="lux-field !pl-5"
                    required
                  />
                </div>

                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Category Type *</label>
                  <div className="flex gap-3">
                    {['decors', 'rentals'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`flex-1 py-3 rounded-full font-accent text-[11px] tracking-[0.2em] uppercase border transition-all duration-300 ${
                          form.type === t
                            ? 'bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] border-[#7B2D43] shadow-[0_6px_18px_-6px_rgba(123,45,67,0.45)]'
                            : 'bg-white text-[#2B2118]/55 border-[#B07D3F]/20 hover:border-[#7B2D43]/30 hover:text-[#7B2D43]'
                        }`}
                      >
                        {t === 'decors' ? 'Decors' : 'Rentals'}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="px-7 py-5 border-t border-[#B07D3F]/10 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3.5 rounded-full border border-[#B07D3F]/20 font-accent text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/60 hover:border-[#B07D3F]/40 transition-all duration-300">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.15em] uppercase shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 transition-all duration-400 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
