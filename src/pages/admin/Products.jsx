import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db, storage } from '../../config/firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp, orderBy, query,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import compressImage from '../../utils/compressImage'
import {
  Package, Plus, Pencil, Trash2, X, Save, Upload, Search, Tag, Sparkles, ImagePlus,
  Flower2, Armchair,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const EMPTY_PRODUCT = { name: '', desc: '', price: '', adminPrice: '', tag: '', imageUrl: '', categoryId: '', featured: false, styles: [] }

function migrateToStyles(product) {
  if (product.styles?.length > 0) return product.styles
  const photos = product.photos || []
  if (photos.length === 0) return []
  return photos.map((url, i) => ({
    photos: [url],
    description: (product.photoDescriptions || [])[i] || '',
    price: (product.photoPrices || [])[i] || '',
    adminPrice: (product.photoAdminPrices || [])[i] || '',
    order: (product.photoOrder || [])[i] || 0,
  }))
}

async function fetchProductAdminPrices() {
  try {
    const snap = await getDocs(collection(db, 'productAdminPrices'))
    return new Map(snap.docs.map((d) => [d.id, d.data()]))
  } catch {
    return new Map()
  }
}

function applyAdminPricing(product, pricing) {
  if (!pricing) return product
  const adminStyles = pricing.styles || []
  return {
    ...product,
    adminPrice: pricing.adminPrice || '',
    photoAdminPrices: adminStyles.map((style) => style?.adminPrice || ''),
    styles: (product.styles || []).map((style, index) => ({
      ...style,
      adminPrice: adminStyles[index]?.adminPrice || '',
    })),
  }
}

export default function Products({ sectionType }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [categories, setCategories] = useState([])
  const [allCategories, setAllCategories] = useState([])

  const isDecors = sectionType === 'decors'
  const isRentals = sectionType === 'rentals'
  const sectionLabel = isDecors ? 'Decor' : isRentals ? 'Rentals' : 'All'
  const SectionIcon = isDecors ? Flower2 : isRentals ? Armchair : Package

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const [snap, adminPrices] = await Promise.all([getDocs(q), fetchProductAdminPrices()])
      setProducts(snap.docs.map((d) => applyAdminPricing({ id: d.id, ...d.data() }, adminPrices.get(d.id))))
    } catch {
      setProducts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
        const [snap, adminPrices] = await Promise.all([getDocs(q), fetchProductAdminPrices()])
        if (!cancelled) setProducts(snap.docs.map((d) => applyAdminPricing({ id: d.id, ...d.data() }, adminPrices.get(d.id))))
      } catch {
        if (!cancelled) setProducts([])
      }
      try {
        const cq = query(collection(db, 'categories'), orderBy('order', 'asc'))
        const csnap = await getDocs(cq)
        const all = csnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (!cancelled) {
          setAllCategories(all)
          if (sectionType) {
            setCategories(all.filter((c) => (c.type || 'decors') === sectionType))
          } else {
            setCategories(all)
          }
        }
      } catch { /* no categories yet */ }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [sectionType])

  const sectionCategoryIds = sectionType
    ? new Set(allCategories.filter((c) => (c.type || 'decors') === sectionType).map((c) => c.id))
    : null

  const sectionProducts = sectionCategoryIds
    ? products.filter((p) => p.categoryId && sectionCategoryIds.has(p.categoryId))
    : products

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_PRODUCT, categoryId: categories.length > 0 ? categories[0].id : '' })
    setImageFile(null)
    setImagePreview('')
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    const styles = migrateToStyles(product)
    setForm({ name: product.name, desc: product.desc, price: product.price, adminPrice: product.adminPrice || '', tag: product.tag || '', imageUrl: product.imageUrl || '', categoryId: product.categoryId || '', featured: product.featured || false, styles })
    setImageFile(null)
    setImagePreview(product.imageUrl || '')
    setModalOpen(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addStyle = () => {
    setForm((prev) => ({
      ...prev,
      styles: [...(prev.styles || []), { photos: [], description: '', price: '', adminPrice: '', order: 0 }],
    }))
  }

  const removeStyle = (styleIdx) => {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.filter((_, i) => i !== styleIdx),
    }))
  }

  const updateStyleField = (styleIdx, field, value) => {
    setForm((prev) => {
      const styles = [...prev.styles]
      styles[styleIdx] = { ...styles[styleIdx], [field]: field === 'order' ? (parseInt(value) || 0) : value }
      return { ...prev, styles }
    })
  }

  const handleStylePhotoUpload = async (styleIdx, e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setSaving(true)
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressImage(file)
          const storageRef = ref(storage, `products/gallery/${Date.now()}_${compressed.name}`)
          await uploadBytes(storageRef, compressed)
          return getDownloadURL(storageRef)
        })
      )
      setForm((prev) => {
        const styles = [...prev.styles]
        styles[styleIdx] = { ...styles[styleIdx], photos: [...styles[styleIdx].photos, ...urls] }
        return { ...prev, styles }
      })
    } catch (err) {
      alert('Error uploading photos: ' + err.message)
    }
    setSaving(false)
  }

  const removeStylePhoto = (styleIdx, photoIdx) => {
    setForm((prev) => {
      const styles = [...prev.styles]
      styles[styleIdx] = { ...styles[styleIdx], photos: styles[styleIdx].photos.filter((_, i) => i !== photoIdx) }
      return { ...prev, styles }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    try {
      let imageUrl = form.imageUrl

      if (imageFile) {
        const compressed = await compressImage(imageFile)
        const storageRef = ref(storage, `products/${Date.now()}_${compressed.name}`)
        await uploadBytes(storageRef, compressed)
        imageUrl = await getDownloadURL(storageRef)
      }

      const data = {
        name: form.name.trim(),
        desc: form.desc.trim(),
        price: form.price.trim(),
        tag: form.tag.trim(),
        imageUrl,
        categoryId: form.categoryId || '',
        featured: form.featured || false,
        styles: (form.styles || []).map((s) => ({
          photos: s.photos || [],
          description: s.description || '',
          price: s.price || '',
          order: s.order || 0,
        })),
      }

      const adminPricing = {
        productName: form.name.trim(),
        adminPrice: form.adminPrice.trim(),
        styles: (form.styles || []).map((s) => ({ adminPrice: s.adminPrice || '' })),
        updatedAt: serverTimestamp(),
      }

      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), { ...data, updatedAt: serverTimestamp() })
        await setDoc(doc(db, 'productAdminPrices', editing.id), adminPricing, { merge: true })
      } else {
        const productRef = await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
        await setDoc(doc(db, 'productAdminPrices', productRef.id), {
          ...adminPricing,
          createdAt: serverTimestamp(),
        }, { merge: true })
      }

      await fetchProducts()
      setModalOpen(false)
    } catch (err) {
      alert('Error saving product: ' + err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      const product = products.find((p) => p.id === id)
      if (product?.imageUrl) {
        try {
          const imgRef = ref(storage, product.imageUrl)
          await deleteObject(imgRef)
        } catch { /* image may not exist in storage */ }
      }
      await deleteDoc(doc(db, 'products', id))
      await fetchProducts()
    } catch (err) {
      alert('Error deleting product: ' + err.message)
    }
    setDeleteConfirm(null)
  }

  const filtered = sectionProducts.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.desc?.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryName = (catId) => {
    const cat = allCategories.find((c) => c.id === catId)
    return cat?.name || ''
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isRentals ? 'from-[#B07D3F] to-[#8A5F2B]' : 'from-[#7B2D43] to-[#5C1F31]'} flex items-center justify-center shadow-[0_6px_18px_-6px_${isRentals ? 'rgba(176,125,63,0.4)' : 'rgba(123,45,67,0.4)'}]`}>
            <SectionIcon className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">{sectionLabel} Products</h1>
            <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
              {sectionProducts.length} {sectionLabel.toLowerCase()} product{sectionProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button onClick={openCreate} className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-br ${isRentals ? 'from-[#C4944A] via-[#B07D3F] to-[#8A5F2B] shadow-[0_8px_24px_-8px_rgba(176,125,63,0.5)] hover:shadow-[0_14px_36px_-8px_rgba(176,125,63,0.55)]' : 'from-[#8E3650] via-[#7B2D43] to-[#5C1F31] shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5)] hover:shadow-[0_14px_36px_-8px_rgba(123,45,67,0.55)]'} text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.2em] uppercase px-6 py-3 inset_0_1px_0_rgba(255,255,255,0.18) hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400`}>
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add {sectionLabel} Product
        </button>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${sectionLabel.toLowerCase()} products...`}
            className="w-full bg-white border border-[#B07D3F]/15 rounded-full py-3 pl-11 pr-4 font-body text-sm text-[#2B2118] placeholder:text-[#2B2118]/30 outline-none shadow-[var(--shadow-sm)] focus:border-[#7B2D43]/40 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300"
          />
        </div>
      </motion.div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-5 animate-pulse">
              <div className="w-full h-40 bg-[#F3EADC] rounded-[1rem] mb-4" />
              <div className="h-5 bg-[#F3EADC] rounded-full w-2/3 mb-2" />
              <div className="h-4 bg-[#F3EADC] rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
            <SectionIcon className="w-7 h-7 text-[#B07D3F]/30" strokeWidth={1} />
          </div>
          <p className="font-body italic text-[#2B2118]/40 mb-2">
            {search ? 'No products match your search' : `No ${sectionLabel.toLowerCase()} products yet`}
          </p>
          {!search && (
            <button onClick={openCreate} className="font-accent text-[12px] tracking-[0.15em] text-[#7B2D43] underline underline-offset-4 decoration-[#7B2D43]/30 hover:decoration-[#7B2D43]/70 transition-colors duration-300">
              Add your first {sectionLabel.toLowerCase()} product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <motion.div
              key={product.id}
              variants={fadeUp} initial="hidden" animate="visible"
              className="group relative bg-white rounded-[1.5rem] border border-[#B07D3F]/10 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-44 bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/50 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <SectionIcon className="w-10 h-10 text-[#B07D3F]/20" strokeWidth={1} />
                  </div>
                )}
                {product.tag && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#7B2D43] text-[#FBF7F0] font-accent font-light text-[9px] tracking-[0.2em] uppercase shadow-[0_4px_12px_-4px_rgba(123,45,67,0.5)]">
                    <Tag className="w-2.5 h-2.5" strokeWidth={1.5} />
                    {product.tag}
                  </span>
                )}
                {product.featured && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#B07D3F] text-[#FBF7F0] font-accent font-light text-[9px] tracking-[0.2em] uppercase shadow-[0_4px_12px_-4px_rgba(176,125,63,0.5)]">
                    <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
                    Featured
                  </span>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2E1822]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-end p-3 gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-[#7B2D43] hover:bg-white shadow-[var(--shadow-sm)] transition-all duration-300"
                  >
                    <Pencil className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-red-500 hover:bg-white shadow-[var(--shadow-sm)] transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-[#2B2118] mb-1">{product.name}</h3>
                <p className="font-body text-[13px] text-[#2B2118]/50 leading-relaxed line-clamp-2 mb-2">{product.desc}</p>
                {getCategoryName(product.categoryId) && (
                  <p className="font-accent font-light text-[9px] tracking-[0.2em] uppercase text-[#B07D3F] mb-2">
                    {getCategoryName(product.categoryId)}
                  </p>
                )}
                {product.price && <p className="font-display italic text-lg text-[#B07D3F] font-semibold">{product.price}</p>}
                {product.adminPrice && <p className="font-accent font-light text-[9px] tracking-[0.2em] uppercase text-[#7B2D43]/60 mt-1">Admin quote: {product.adminPrice}</p>}
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
              <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-2">Delete Product?</h3>
              <p className="font-body text-sm text-[#2B2118]/50 mb-7">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-full border border-[#B07D3F]/20 font-accent text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/60 hover:border-[#B07D3F]/40 transition-all duration-300">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-accent text-[11px] tracking-[0.15em] uppercase shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] hover:shadow-[0_12px_28px_-6px_rgba(239,68,68,0.55)] hover:-translate-y-0.5 transition-all duration-300">
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] bg-white rounded-[1.75rem] border border-[#B07D3F]/15 shadow-[var(--shadow-lg)] z-50 flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-[#B07D3F]/10 bg-gradient-to-b from-[#F3EADC]/40 to-transparent">
                <h3 className="font-display text-xl font-semibold text-[#2B2118]">
                  {editing ? `Edit ${sectionLabel} Product` : `New ${sectionLabel} Product`}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full text-[#2B2118]/30 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
                {/* Image upload */}
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Product Image</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id={`product-image-${sectionType}`}
                    />
                    <label
                      htmlFor={`product-image-${sectionType}`}
                      className="flex items-center justify-center w-full h-36 rounded-[1.25rem] border-2 border-dashed border-[#B07D3F]/20 hover:border-[#7B2D43]/30 bg-[#F3EADC]/30 cursor-pointer transition-colors duration-300 overflow-hidden"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
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
                </div>

                {/* Name */}
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={isDecors ? 'e.g. Golden Arch Kit' : isRentals ? 'e.g. Chiavari Chair Set' : 'Product name'}
                    className="lux-field !pl-5"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Description</label>
                  <textarea
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    placeholder="Brief description of the product..."
                    className="lux-field"
                    rows={3}
                  />
                </div>

                {/* Price + Tag row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">User Price (Optional)</label>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="$49.99"
                      className="lux-field !pl-5"
                    />
                  </div>
                  <div>
                    <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Admin Quote Price (Optional)</label>
                    <input
                      type="text"
                      value={form.adminPrice}
                      onChange={(e) => setForm({ ...form, adminPrice: e.target.value })}
                      placeholder="Optional"
                      className="lux-field !pl-5"
                    />
                  </div>
                  <div>
                    <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Tag (Optional)</label>
                    <input
                      type="text"
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      placeholder="e.g. Bestseller"
                      className="lux-field !pl-5"
                    />
                  </div>
                </div>

                {/* Category — only show categories for this section */}
                {categories.length > 0 && (
                  <div>
                    <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-2">Category</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="lux-field"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 rounded-full bg-[#F3EADC] border border-[#B07D3F]/20 peer-checked:bg-[#7B2D43] transition-colors duration-300" />
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm peer-checked:translate-x-4 transition-transform duration-300" />
                    </div>
                    <span className="font-accent font-light text-[11px] tracking-[0.2em] uppercase text-[#2B2118]/60 group-hover:text-[#7B2D43] transition-colors duration-300">
                      Featured on Home Page
                    </span>
                  </label>
                </div>

                {/* Styles */}
                <div>
                  <label className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#2B2118]/60 ml-1 block mb-1">
                    Styles <span className="normal-case tracking-normal text-[#2B2118]/35">(group multiple photos per style — customers pick a style)</span>
                  </label>
                  <p className="font-body text-[11px] text-[#2B2118]/35 ml-1 mb-3 italic">
                    Each style can have multiple photos. Customers will browse photos within a style and add the style to their cart.
                  </p>
                  {(form.styles || []).length > 0 && (
                    <div className="space-y-4 mb-3">
                      {form.styles.map((style, sIdx) => (
                        <div key={sIdx} className="bg-[#F3EADC]/30 rounded-xl p-4 border border-[#B07D3F]/10">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-accent font-medium text-[11px] tracking-[0.15em] uppercase text-[#7B2D43]">Style {sIdx + 1}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-accent font-light text-[9px] tracking-[0.15em] uppercase text-[#B07D3F]/60">User</span>
                                <input
                                  type="text"
                                  value={style.price || ''}
                                  onChange={(e) => updateStyleField(sIdx, 'price', e.target.value)}
                                  placeholder="—"
                                  className="w-20 bg-white border border-[#B07D3F]/15 rounded-lg py-1 px-2 font-body text-[12px] text-center text-[#2B2118] placeholder:text-[#2B2118]/20 outline-none focus:border-[#7B2D43]/40 transition-all duration-300"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-accent font-light text-[9px] tracking-[0.15em] uppercase text-[#B07D3F]/60">Admin</span>
                                <input
                                  type="text"
                                  value={style.adminPrice || ''}
                                  onChange={(e) => updateStyleField(sIdx, 'adminPrice', e.target.value)}
                                  placeholder="Optional"
                                  className="w-20 bg-white border border-[#B07D3F]/15 rounded-lg py-1 px-2 font-body text-[12px] text-center text-[#2B2118] placeholder:text-[#2B2118]/20 outline-none focus:border-[#7B2D43]/40 transition-all duration-300"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-accent font-light text-[9px] tracking-[0.15em] uppercase text-[#B07D3F]/60">Order</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={style.order || 0}
                                  onChange={(e) => updateStyleField(sIdx, 'order', e.target.value)}
                                  className="w-14 bg-white border border-[#B07D3F]/15 rounded-lg py-1 px-2 font-body text-[12px] text-center text-[#2B2118] outline-none focus:border-[#7B2D43]/40 transition-all duration-300"
                                />
                              </div>
                              <button type="button" onClick={() => removeStyle(sIdx)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={style.description || ''}
                            onChange={(e) => updateStyleField(sIdx, 'description', e.target.value)}
                            placeholder="Style description (optional — defaults to common description)"
                            className="w-full bg-white border border-[#B07D3F]/15 rounded-lg py-2 px-3 font-body text-[12px] text-[#2B2118] placeholder:text-[#2B2118]/25 outline-none focus:border-[#7B2D43]/40 transition-all duration-300 mb-3"
                          />
                          {style.photos.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-3">
                              {style.photos.map((url, pIdx) => (
                                <div key={pIdx} className="relative w-16 h-16 rounded-lg overflow-hidden group/sp">
                                  <img src={url} alt="" className="w-full h-full object-contain bg-[#F3EADC]" />
                                  <button
                                    type="button"
                                    onClick={() => removeStylePhoto(sIdx, pIdx)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover/sp:opacity-100 transition-opacity duration-200"
                                  >
                                    <X className="w-2 h-2" strokeWidth={3} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleStylePhotoUpload(sIdx, e)}
                            className="hidden"
                            id={`style-photos-${sectionType}-${sIdx}`}
                          />
                          <label
                            htmlFor={`style-photos-${sectionType}-${sIdx}`}
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border-2 border-dashed border-[#B07D3F]/15 hover:border-[#7B2D43]/25 bg-white/50 cursor-pointer transition-colors duration-300"
                          >
                            <ImagePlus className="w-3.5 h-3.5 text-[#B07D3F]/40" strokeWidth={1.5} />
                            <span className="font-accent font-light text-[9px] tracking-[0.15em] uppercase text-[#2B2118]/35">
                              Add Photos to Style {sIdx + 1}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addStyle}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-[#B07D3F]/20 hover:border-[#7B2D43]/30 bg-[#F3EADC]/20 cursor-pointer transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4 text-[#B07D3F]/50" strokeWidth={1.5} />
                    <span className="font-accent font-light text-[10px] tracking-[0.2em] uppercase text-[#2B2118]/40">
                      Add New Style
                    </span>
                  </button>
                </div>
              </form>

              {/* Modal footer */}
              <div className="px-7 py-5 border-t border-[#B07D3F]/10 bg-gradient-to-t from-[#F3EADC]/30 to-transparent flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3.5 rounded-full border border-[#B07D3F]/20 font-accent text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/60 hover:border-[#B07D3F]/40 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-br ${isRentals ? 'from-[#C4944A] via-[#B07D3F] to-[#8A5F2B] shadow-[0_8px_24px_-8px_rgba(176,125,63,0.5)]' : 'from-[#8E3650] via-[#7B2D43] to-[#5C1F31] shadow-[0_8px_24px_-8px_rgba(123,45,67,0.5)]'} text-[#FBF7F0] font-accent font-medium text-[11px] tracking-[0.15em] uppercase hover:-translate-y-0.5 active:translate-y-0 transition-all duration-400 disabled:opacity-60 disabled:pointer-events-none`}
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
