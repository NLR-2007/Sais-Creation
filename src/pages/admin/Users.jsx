import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../config/firebase'
import { collection, getDocs, updateDoc, doc, deleteDoc, orderBy, query } from 'firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import {
  Users as UsersIcon, Shield, ShieldOff, Trash2, Search, MessageCircle, Save,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toggling, setToggling] = useState(null)

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      setUsers([])
    }
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        if (!cancelled) setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        if (!cancelled) setUsers([])
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const toggleRole = async (userId, currentRole) => {
    if (userId === currentUser?.uid) return
    setToggling(userId)
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin'
      await updateDoc(doc(db, 'users', userId), { role: newRole })
      await fetchUsers()
    } catch (err) {
      alert('Error updating role: ' + err.message)
    }
    setToggling(null)
  }

  const handleDelete = async (userId) => {
    if (userId === currentUser?.uid) return
    try {
      await deleteDoc(doc(db, 'users', userId))
      await fetchUsers()
    } catch (err) {
      alert('Error deleting user: ' + err.message)
    }
    setDeleteConfirm(null)
  }

  const handleUpdateChatId = async (userId, chatId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { telegramChatId: chatId })
      await fetchUsers()
    } catch (err) {
      alert('Error updating Telegram Chat ID: ' + err.message)
    }
  }

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.telegramUsername?.toLowerCase().includes(search.toLowerCase())
  )

  const admins = filtered.filter((u) => u.role === 'admin')
  const regularUsers = filtered.filter((u) => u.role !== 'admin')

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D9A5A0] to-[#C28D87] flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(217,165,160,0.4)]">
            <UsersIcon className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2B2118]">Users</h1>
            <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#B07D3F]">
              {users.length} registered · {admins.length} admins
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B07D3F]" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or Telegram..."
            className="w-full bg-white border border-[#B07D3F]/15 rounded-full py-3 pl-11 pr-4 font-body text-sm text-[#2B2118] placeholder:text-[#2B2118]/30 outline-none shadow-[var(--shadow-sm)] focus:border-[#7B2D43]/40 focus:shadow-[0_0_0_4px_rgba(123,45,67,0.06)] transition-all duration-300"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[1.25rem] border border-[#B07D3F]/10 p-5 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F3EADC]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#F3EADC] rounded-full w-1/3" />
                <div className="h-3 bg-[#F3EADC] rounded-full w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F3EADC]/80 border border-[#B07D3F]/15 flex items-center justify-center">
            <UsersIcon className="w-7 h-7 text-[#B07D3F]/30" strokeWidth={1} />
          </div>
          <p className="font-body italic text-[#2B2118]/40">
            {search ? 'No users match your search' : 'No registered users yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Admin section */}
          {admins.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <h3 className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#7B2D43] mb-3 ml-1">
                Administrators ({admins.length})
              </h3>
              <div className="space-y-2 mb-8">
                {admins.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isSelf={u.id === currentUser?.uid}
                    toggling={toggling === u.id}
                    onToggleRole={() => toggleRole(u.id, u.role)}
                    onDelete={() => setDeleteConfirm(u.id)}
                    onUpdateChatId={handleUpdateChatId}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Regular users */}
          {regularUsers.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <h3 className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#B07D3F] mb-3 ml-1">
                Users ({regularUsers.length})
              </h3>
              <div className="space-y-2">
                {regularUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isSelf={u.id === currentUser?.uid}
                    toggling={toggling === u.id}
                    onToggleRole={() => toggleRole(u.id, u.role)}
                    onDelete={() => setDeleteConfirm(u.id)}
                    onUpdateChatId={handleUpdateChatId}
                  />
                ))}
              </div>
            </motion.div>
          )}
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
              <h3 className="font-display text-xl font-semibold text-[#2B2118] mb-2">Delete User?</h3>
              <p className="font-body text-sm text-[#2B2118]/50 mb-7">This will remove the user's profile data.</p>
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
    </div>
  )
}

function UserRow({ user, isSelf, toggling, onToggleRole, onDelete, onUpdateChatId }) {
  const isAdmin = user.role === 'admin'
  const createdDate = user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const [editingChatId, setEditingChatId] = useState(false)
  const [chatIdValue, setChatIdValue] = useState(user.telegramChatId || '')
  const [saving, setSaving] = useState(false)

  const handleSaveChatId = async () => {
    setSaving(true)
    await onUpdateChatId(user.id, chatIdValue.trim())
    setSaving(false)
    setEditingChatId(false)
  }

  return (
    <div className="group bg-white rounded-[1.25rem] border border-[#B07D3F]/10 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[#B07D3F]/20 transition-all duration-400">
      <div className="flex items-center gap-4 p-4 md:p-5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display text-sm font-semibold ${
          isAdmin
            ? 'bg-gradient-to-br from-[#7B2D43] to-[#5C1F31] text-[#FBF7F0]'
            : 'bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2] text-[#7B2D43] border border-[#B07D3F]/15'
        }`}>
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-base font-semibold text-[#2B2118] truncate">{user.name || 'Unnamed'}</span>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7B2D43]/10 text-[#7B2D43] font-accent text-[9px] tracking-[0.15em] uppercase">
                <Shield className="w-2.5 h-2.5" strokeWidth={1.5} />
                Admin
              </span>
            )}
            {isSelf && (
              <span className="px-2 py-0.5 rounded-full bg-[#B07D3F]/10 text-[#B07D3F] font-accent text-[9px] tracking-[0.15em] uppercase">
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {user.email && <span className="font-accent font-light text-[11px] text-[#2B2118]/40">{user.email}</span>}
            {user.phone && <span className="font-accent font-light text-[11px] text-[#2B2118]/40">{user.phone}</span>}
            <span className="font-accent font-light text-[10px] text-[#2B2118]/25">{createdDate}</span>
          </div>
          {isAdmin && user.telegramChatId && !editingChatId && (
            <div className="flex items-center gap-1.5 mt-1">
              <MessageCircle className="w-3 h-3 text-[#B07D3F]/50" strokeWidth={1.5} />
              <span className="font-accent font-light text-[10px] text-[#B07D3F]/60">Telegram: {user.telegramChatId}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isAdmin && (
            <button
              onClick={() => setEditingChatId(!editingChatId)}
              title="Set Telegram Chat ID"
              className="p-2.5 rounded-xl border border-blue-200 text-blue-400 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
          {!isSelf && (
            <>
              <button
                onClick={onToggleRole}
                disabled={toggling}
                title={isAdmin ? 'Remove admin' : 'Make admin'}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  isAdmin
                    ? 'border-[#B07D3F]/20 text-[#B07D3F] hover:border-[#B07D3F]/40 hover:bg-[#B07D3F]/[0.05]'
                    : 'border-[#7B2D43]/20 text-[#7B2D43] hover:border-[#7B2D43]/40 hover:bg-[#7B2D43]/[0.05]'
                }`}
              >
                {toggling ? (
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin block" />
                ) : isAdmin ? (
                  <ShieldOff className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Shield className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
              <button
                onClick={onDelete}
                title="Delete user"
                className="p-2.5 rounded-xl border border-red-200 text-red-400 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>

      {editingChatId && (
        <div className="px-5 pb-4 pt-0 border-t border-[#B07D3F]/8 mt-0">
          <div className="flex items-center gap-3 pt-3">
            <MessageCircle className="w-4 h-4 text-[#B07D3F] shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={chatIdValue}
              onChange={(e) => setChatIdValue(e.target.value)}
              placeholder="Telegram Chat ID (e.g. 8758051969)"
              className="flex-1 bg-[#FBF7F0] border border-[#B07D3F]/15 rounded-full py-2.5 px-4 font-accent text-[12px] text-[#2B2118] placeholder:text-[#2B2118]/25 outline-none focus:border-[#7B2D43]/30 transition-all duration-300"
            />
            <button
              onClick={handleSaveChatId}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] text-[#FBF7F0] font-accent text-[10px] tracking-[0.15em] uppercase shadow-[0_6px_16px_-6px_rgba(123,45,67,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60"
            >
              {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" strokeWidth={1.5} />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
