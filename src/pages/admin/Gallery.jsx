import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db, storage } from '../../config/firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import compressImage from '../../utils/compressImage'
import {
  Image, Plus, Pencil, Trash2, X, Save, Upload,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [label, setLabel] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [bulkUploading, setBulkUploading] = useState(false)

  const fetchImages = async () => {
    try {
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      setImages([])
    }
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (!cancelled) setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        if (!cancelled) setImages([])
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const openCreate = () => {
    setEditing(null)
    setLabel('')
    setImageFile(null)
    setImagePreview('')
    setModalOpen(true)
  }

  const openEdit = (img) => {
    setEditing(img)
    setLabel(img.label || '')
    setImageFile(null)
    setImagePreview(img.imageUrl || '')
    setModalOpen(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setBulkUploading(true)
    try {
      for (const file of files) {
        const compressed = await compressImage(file)
        const storageRef = ref(storage, `gallery/${Date.now()}_${compressed.name}`)
        await uploadBytes(storageRef, compressed)
        const imageUrl = await getDownloadURL(storageRef)
        await addDoc(collection(db, 'gallery'), {
          imageUrl,
          label: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          createdAt: serverTimestamp(),
        })
      }
      await fetchImages()
    } catch (err) {
      alert('Error uploading: ' + err.message)
    }
    setBulkUploading(false)
    e.target.value = ''
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = editing?.imageUrl || ''

      if (imageFile) {
        const compressed = await compressImage(imageFile)
        const storageRef = ref(storage, `gallery/${Date.now()}_${compressed.name}`)
        await uploadBytes(storageRef, compressed)
        imageUrl = await getDownloadURL(storageRef)
      }

      if (!imageUrl && !imageFile) {
        alert('Please select an image')
        setSaving(false)
        return
      }

      if (editing) {
        await updateDoc(doc(db, 'gallery', editing.id), {
          label: label.trim(),
          ...(imageFile ? { imageUrl } : {}),
          updatedAt: serverTimestamp(),
        })
      } else {
        await addDoc(collection(db, 'gallery'), {
          imageUrl,
          label: label.trim(),
          createdAt: serverTimestamp(),
        })
      }

      await fetchImages()
      setModalOpen(false)
    } catch (err) {
      alert('Error saving: ' + err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      const img = images.find((i) => i.id === id)
      if (img?.imageUrl) {
        try {
          const imgRef = ref(storage, img.imageUrl)
          await deleteObject(imgRef)
        } catch { /* may not exist */ }
      }
      await deleteDoc(doc(db, 'gallery', id))
      await fetchImages()
    } catch (err) {
      alert('Error deleting: ' + err.message)
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B07D3F] to-[#8C5A2B] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(176,125,63,0.4)]">
            <Image className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">Gallery</h1>
            <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
              {images.length} photos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Bulk upload */}
          <label className="inline-flex items-center gap-2 rounded-full border border-[#B07D3F]/30 bg-white/60 text-[#7B2D43] font-accent font-light text-[11px] tracking-[0.15em] uppercase px-5 py-3 cursor-pointer hover:border-[#7B2D43]/50 hover:bg-[#7B2D43]/[0.04] transition-all duration-300">
            <Upload className="w-4 h-4" strokeWidth={1.5} />
            {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
            <input type="file" accept="image/*" multiple onChange={handleBulkUpload} className="hidden" disabled={bulkUploading} />
          </label>
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.2em] uppercase px-6 py-3 shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_14px_36px_-8px_rgba(123,45,67,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400">
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Photo
          </button>
        </div>
      </motion.div>

      {/* Gallery grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-[#F3EADC] rounded-[1.25rem] animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
            <Image className="w-7 h-7 text-[#B07D3F]/30" strokeWidth={1} />
          </div>
          <p className="font-body italic text-[#2B2118]/40 mb-2">No gallery photos yet</p>
          <button onClick={openCreate} className="font-accent text-[12px] tracking-[0.15em] text-[#7B2D43] underline underline-offset-4 decoration-[#7B2D43]/30 hover:decoration-[#7B2D43]/70 transition-colors duration-300">
            Upload your first photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <motion.div
              key={img.id}
              variants={fadeUp} initial="hidden" animate="visible"
              className="group relative aspect-square bg-[#F3EADC] rounded-[1.25rem] overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-500"
            >
              {img.imageUrl ? (
                <img src={img.imageUrl} alt={img.label} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-[#B07D3F]/20" strokeWidth={1} />
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E1822]/85 via-[#2E1822]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                {img.label && (
                  <p className="font-accent text-[11px] tracking-[0.1em] text-[#FBF7F0]/80 mb-3 truncate">{img.label}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(img)}
                    className="p-2 rounded-lg bg-white/90 text-[#7B2D43] hover:bg-white transition-all duration-300"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(img.id)}
                    className="p-2 rounded-lg bg-white/90 text-red-500 hover:bg-white transition-all duration-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
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
              <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-2">Delete Photo?</h3>
              <p className="font-body text-sm text-[#2B2118]/50 mb-7">This will remove the photo permanently.</p>
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

      {/* Upload/Edit Modal */}
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
                  {editing ? 'Edit Photo' : 'Add Photo'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full text-[#2B2118]/30 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="px-7 py-6 space-y-5">
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Photo *</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="gallery-image" />
                  <label
                    htmlFor="gallery-image"
                    className="flex items-center justify-center w-full h-48 rounded-[1.25rem] border-2 border-dashed border-[#B07D3F]/20 hover:border-[#7B2D43]/30 bg-[#F3EADC]/30 cursor-pointer transition-colors duration-300 overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-[#B07D3F]/30 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="font-accent font-light text-[10px] tracking-[0.2em] uppercase text-[#2B2118]/35">Click to upload</p>
                      </div>
                    )}
                  </label>
                </div>

                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Label</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Wedding Setup"
                    className="lux-field !pl-5"
                  />
                </div>
              </form>

              <div className="px-7 py-5 border-t border-[#B07D3F]/10 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3.5 rounded-full border border-[#B07D3F]/20 font-accent text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/60 hover:border-[#B07D3F]/40 transition-all duration-300">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.15em] uppercase shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_14px_36px_-8px_rgba(123,45,67,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Upload'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
