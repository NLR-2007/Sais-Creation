import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Package, Image, Users, LogOut,
  Menu, X, Sparkles, ChevronLeft, LayoutList, ClipboardList, FileText,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/categories', icon: LayoutList, label: 'Categories' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/gallery', icon: Image, label: 'Gallery' },
  { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/admin/content', icon: FileText, label: 'Home Content' },
  { to: '/admin/users', icon: Users, label: 'Users' },
]

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 px-4 py-3 rounded-xl font-accent font-light text-[12px] tracking-[0.15em] uppercase transition-all duration-300 ${
    isActive
      ? 'bg-[#D9A5A0]/15 text-[#FBF7F0] shadow-[0_4px_16px_-4px_rgba(217,165,160,0.3)]'
      : 'text-[#FBF7F0]/45 hover:text-[#FBF7F0]/80 hover:bg-[#FBF7F0]/[0.05]'
  }`

function SidebarContent({ userProfile, onLogout, onNavClick }) {
  return (
    <>
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rotate-45 rounded-[9px] border border-[#D9A5A0]/50 bg-[#D9A5A0]/[0.06]" />
            <Sparkles className="w-4 h-4 text-[#D9A5A0]" strokeWidth={1.5} />
          </div>
          <div className="leading-none">
            <span className="font-display text-lg font-semibold text-[#FBF7F0] block">
              Sais Creation
            </span>
            <span className="font-accent font-light text-[8px] tracking-[0.5em] uppercase text-[#D9A5A0]/60">
              Admin Panel
            </span>
          </div>
        </div>
      </div>

      <div className="h-px mx-6 bg-gradient-to-r from-transparent via-[#FBF7F0]/10 to-transparent" />

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={linkClass}
            onClick={onNavClick}
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="h-px mx-6 bg-gradient-to-r from-transparent via-[#FBF7F0]/10 to-transparent" />

      {/* User + Logout */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D9A5A0]/30 to-[#7B2D43]/30 flex items-center justify-center text-[#FBF7F0] font-display text-sm font-semibold shrink-0">
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-accent text-[12px] text-[#FBF7F0]/80 truncate">{userProfile?.name || 'Admin'}</p>
            <p className="font-accent font-light text-[9px] tracking-[0.2em] uppercase text-[#D9A5A0]/60">Administrator</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-accent font-light text-[12px] tracking-[0.15em] uppercase text-[#FBF7F0]/35 hover:text-[#D9A5A0] hover:bg-[#D9A5A0]/[0.08] transition-all duration-300"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
          Sign Out
        </button>

        <NavLink
          to="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-accent font-light text-[12px] tracking-[0.15em] uppercase text-[#FBF7F0]/35 hover:text-[#FBF7F0]/80 hover:bg-[#FBF7F0]/[0.05] transition-all duration-300"
        >
          <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
          View Site
        </NavLink>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-gradient-to-b from-[#3B1F2B] via-[#2E1822] to-[#241318] border-r border-[#FBF7F0]/[0.06] shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="grain" />
        <div className="relative z-10 flex flex-col h-full">
          <SidebarContent userProfile={userProfile} onLogout={handleLogout} onNavClick={() => setSidebarOpen(false)} />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-[#2E1822]/70 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-gradient-to-b from-[#3B1F2B] via-[#2E1822] to-[#241318] z-50 lg:hidden flex flex-col overflow-y-auto shadow-[20px_0_60px_-20px_rgba(46,24,34,0.6)]"
            >
              <div className="grain" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-5 right-4 p-2 rounded-full text-[#FBF7F0]/30 hover:text-[#FBF7F0]/60 hover:bg-[#FBF7F0]/[0.06] transition-all duration-300 z-20"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative z-10 flex flex-col h-full">
                <SidebarContent userProfile={userProfile} onLogout={handleLogout} onNavClick={() => setSidebarOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#FBF7F0]/90 backdrop-blur-xl border-b border-[#B07D3F]/10">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#2B2118]/60 hover:text-[#7B2D43] hover:bg-[#7B2D43]/[0.05] transition-all duration-300"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <span className="font-accent font-light text-[10px] tracking-[0.25em] uppercase text-[#B07D3F]">
                Admin Panel
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D9A5A0]/30 to-[#7B2D43]/20 border border-[#B07D3F]/20 flex items-center justify-center text-[#7B2D43] font-display text-xs font-semibold">
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 md:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
