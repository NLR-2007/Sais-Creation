import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../config/firebase'
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import {
  ClipboardList, Eye, Trash2, X, Package, User, Mail, Phone, MapPin,
  CheckCircle, Clock, MessageSquare, Archive, MessageCircle,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const STATUS_CONFIG = {
  new:       { label: 'New',       color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: MessageSquare },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200',  icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-[#F3EADC] text-[#B07D3F] border-[#B07D3F]/20', icon: Archive },
}

function parsePriceAmount(value) {
  const match = String(value || '').match(/\d[\d,]*(?:\.\d+)?/)
  const amount = match ? Number(match[0].replace(/,/g, '')) : 0
  return Number.isFinite(amount) ? amount : 0
}

function getAdminTotal(items = []) {
  return items.reduce((sum, item) => sum + parsePriceAmount(item.adminPrice), 0)
}

function formatAdminPrice(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  if (/^\$/.test(text)) return text
  if (/^\d[\d,]*(?:\.\d+)?(?:\b|\/)/.test(text)) return `$${text}`
  return text
}

function getOrderAdminTotal(order) {
  return Number(order?.adminTotal) || getAdminTotal(order?.items || [])
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewOrder, setViewOrder] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      setOrders([])
    }
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (!cancelled) setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        if (!cancelled) setOrders([])
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus })
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
      if (viewOrder?.id === orderId) setViewOrder({ ...viewOrder, status: newStatus })
    } catch (err) {
      alert('Error updating status: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'orders', id))
      setOrders((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      alert('Error deleting order: ' + err.message)
    }
    setDeleteConfirm(null)
  }

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts._seconds * 1000)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders
  const counts = { all: orders.length, new: 0, contacted: 0, confirmed: 0, completed: 0 }
  orders.forEach((o) => { if (counts[o.status] !== undefined) counts[o.status]++ })

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B2D43] to-[#5C1F31] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(123,45,67,0.4)]">
            <ClipboardList className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">Orders</h1>
            <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
              {orders.length} total · {counts.new} new
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ key: '', label: 'All', count: counts.all }, ...Object.entries(STATUS_CONFIG).map(([key, val]) => ({ key, label: val.label, count: counts[key] }))].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-full font-accent font-light text-[10px] tracking-[0.2em] uppercase border transition-all duration-300 ${
              statusFilter === tab.key
                ? 'bg-[#7B2D43] text-[#FBF7F0] border-[#7B2D43] shadow-[0_4px_14px_-4px_rgba(123,45,67,0.4)]'
                : 'bg-white text-[#2B2118]/55 border-[#B07D3F]/15 hover:border-[#7B2D43]/30 hover:text-[#7B2D43]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[1.25rem] border border-[#B07D3F]/10 p-5 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F3EADC] rounded-xl" />
              <div className="flex-1"><div className="h-5 bg-[#F3EADC] rounded-full w-1/3 mb-2" /><div className="h-3 bg-[#F3EADC] rounded-full w-1/4" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 text-[#B07D3F]/30" strokeWidth={1} />
          </div>
          <p className="font-body italic text-[#2B2118]/40">
            {statusFilter ? 'No orders with this status' : 'No orders yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.new
            const StatusIcon = sc.icon
            return (
              <motion.div
                key={order.id}
                variants={fadeUp} initial="hidden" animate="visible"
                className="group bg-white rounded-[1.25rem] border border-[#B07D3F]/10 shadow-[0_2px_10px_rgba(59,31,43,0.04)] hover:border-[#7B2D43]/25 hover:shadow-[0_12px_30px_-10px_rgba(59,31,43,0.15)] transition-all duration-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/50 border border-[#B07D3F]/15 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[#B07D3F]/40" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-semibold text-[#2B2118] truncate">{order.customerName}</h3>
                      <p className="font-accent font-light text-[10px] tracking-[0.15em] text-[#2B2118]/40">
                        {order.sentVia === 'registration' ? 'New registration' : `${order.items?.length || 0} items`} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {order.sentVia && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full font-accent font-light text-[8px] tracking-[0.15em] uppercase border ${
                        order.sentVia === 'registration'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : order.sentVia === 'email'
                          ? 'bg-violet-50 text-violet-600 border-violet-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {order.sentVia === 'registration' ? <User className="w-2.5 h-2.5" strokeWidth={1.5} /> : order.sentVia === 'email' ? <Mail className="w-2.5 h-2.5" strokeWidth={1.5} /> : <MessageCircle className="w-2.5 h-2.5" strokeWidth={1.5} />}
                        {order.sentVia === 'registration' ? 'New User' : order.sentVia}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-accent font-light text-[9px] tracking-[0.2em] uppercase border ${sc.color}`}>
                      <StatusIcon className="w-3 h-3" strokeWidth={1.5} />
                      {sc.label}
                    </span>

                    <button onClick={() => setViewOrder(order)} className="p-2.5 rounded-xl border border-[#B07D3F]/15 bg-white text-[#7B2D43] hover:bg-[#7B2D43]/[0.05] hover:border-[#7B2D43]/30 transition-all duration-300">
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => setDeleteConfirm(order.id)} className="p-2.5 rounded-xl border border-[#B07D3F]/15 bg-white text-red-400 hover:bg-red-50 hover:border-red-200 transition-all duration-300">
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* View Order Modal */}
      <AnimatePresence>
        {viewOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewOrder(null)} className="fixed inset-0 bg-[#2E1822]/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] bg-white rounded-[1.75rem] border border-[#B07D3F]/15 shadow-[var(--shadow-lg)] z-50 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-[#B07D3F]/10 bg-gradient-to-b from-[#F3EADC]/40 to-transparent">
                <h3 className="font-display text-xl font-semibold text-[#2B2118]">Order Details</h3>
                <button onClick={() => setViewOrder(null)} className="p-2 rounded-full text-[#2B2118]/30 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.05] transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
                {/* Customer info */}
                <div className="space-y-3">
                  <h4 className="font-accent font-light text-[10px] tracking-[0.4em] uppercase text-[#B07D3F]">Customer</h4>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 font-body text-sm text-[#2B2118]"><User className="w-4 h-4 text-[#B07D3F]/50" strokeWidth={1.5} />{viewOrder.customerName}</p>
                    <p className="flex items-center gap-2 font-body text-sm text-[#2B2118]"><Phone className="w-4 h-4 text-[#B07D3F]/50" strokeWidth={1.5} />{viewOrder.customerPhone}</p>
                    {viewOrder.customerEmail && <p className="flex items-center gap-2 font-body text-sm text-[#2B2118]"><Mail className="w-4 h-4 text-[#B07D3F]/50" strokeWidth={1.5} />{viewOrder.customerEmail}</p>}
                    {viewOrder.customerAddress && <p className="flex items-start gap-2 font-body text-sm text-[#2B2118]"><MapPin className="w-4 h-4 text-[#B07D3F]/50 shrink-0 mt-0.5" strokeWidth={1.5} />{viewOrder.customerAddress}</p>}
                    {viewOrder.sentVia && (
                      <p className="flex items-center gap-2 font-body text-sm text-[#2B2118]">
                        {viewOrder.sentVia === 'registration' ? <User className="w-4 h-4 text-rose-400" strokeWidth={1.5} /> : viewOrder.sentVia === 'email' ? <Mail className="w-4 h-4 text-violet-400" strokeWidth={1.5} /> : <MessageCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />}
                        {viewOrder.sentVia === 'registration' ? <span className="font-semibold">New User Registration</span> : <>Sent via <span className="font-semibold capitalize">{viewOrder.sentVia}</span></>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <h4 className="font-accent font-light text-[10px] tracking-[0.4em] uppercase text-[#B07D3F]">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(viewOrder.id, key)}
                        className={`px-4 py-2 rounded-full font-accent font-light text-[10px] tracking-[0.15em] uppercase border transition-all duration-300 ${
                          viewOrder.status === key ? val.color + ' shadow-sm' : 'bg-white text-[#2B2118]/40 border-[#B07D3F]/10 hover:border-[#B07D3F]/25'
                        }`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="font-accent font-light text-[10px] tracking-[0.4em] uppercase text-[#B07D3F]">
                    {viewOrder.sentVia === 'registration' ? 'Registration Info' : `Items (${viewOrder.items?.length || 0})`}
                  </h4>
                  {viewOrder.sentVia === 'registration' && (!viewOrder.items || viewOrder.items.length === 0) ? (
                    <p className="font-body text-sm text-[#2B2118]/50 italic">User registered — no items requested yet</p>
                  ) : <div className="space-y-2">
                    {viewOrder.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#FBF7F0] border border-[#B07D3F]/10">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/50 overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-3.5 h-3.5 text-[#B07D3F]/25" strokeWidth={1} /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-sm font-semibold text-[#2B2118] truncate">{item.name}</p>
                          {item.adminPrice && <p className="font-display italic text-xs text-[#B07D3F]">Admin price: {formatAdminPrice(item.adminPrice)}</p>}
                          {!item.adminPrice && item.price && <p className="font-display italic text-xs text-[#B07D3F]">User price: {item.price}</p>}
                        </div>
                      </div>
                    ))}
                    {getOrderAdminTotal(viewOrder) > 0 && (
                      <div className="flex items-center justify-between rounded-xl bg-[#7B2D43]/[0.06] border border-[#7B2D43]/10 px-4 py-3">
                        <span className="font-accent font-light text-[10px] tracking-[0.25em] uppercase text-[#7B2D43]">Admin Total</span>
                        <span className="font-display text-lg font-semibold text-[#7B2D43]">${getOrderAdminTotal(viewOrder).toFixed(2)}</span>
                      </div>
                    )}
                  </div>}
                </div>

                <p className="font-accent font-light text-[10px] tracking-[0.15em] text-[#2B2118]/35">
                  Submitted: {formatDate(viewOrder.createdAt)}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-2">Delete Order?</h3>
              <p className="font-body text-sm text-[#2B2118]/50 mb-7">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-full border border-[#B07D3F]/20 font-accent text-[11px] tracking-[0.15em] uppercase text-[#2B2118]/60 hover:border-[#B07D3F]/40 transition-all duration-300">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-accent text-[11px] tracking-[0.15em] uppercase shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 transition-all duration-300">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
