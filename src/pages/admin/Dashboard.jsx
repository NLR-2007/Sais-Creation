import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { db } from '../../config/firebase'
import { collection, getDocs } from 'firebase/firestore'
import {
  Package, Image, Users, FileText, TrendingUp, ArrowRight, Sparkles, ClipboardList,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    gallery: 0,
    users: 0,
    testimonials: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [prodSnap, galSnap, userSnap, testSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'gallery')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'testimonials')),
        ])
        setStats({
          products: prodSnap.size,
          gallery: galSnap.size,
          users: userSnap.size,
          testimonials: testSnap.size,
        })
      } catch {
        // Firestore not configured yet — show zeros
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Products', count: stats.products, icon: Package, color: 'from-[#7B2D43] to-[#5C1F31]', link: '/admin/products' },
    { label: 'Gallery Photos', count: stats.gallery, icon: Image, color: 'from-[#B07D3F] to-[#8C5A2B]', link: '/admin/gallery' },
    { label: 'Users', count: stats.users, icon: Users, color: 'from-[#D9A5A0] to-[#C28D87]', link: '/admin/users' },
    { label: 'Testimonials', count: stats.testimonials, icon: FileText, color: 'from-[#3B1F2B] to-[#2E1822]', link: '/admin/content?section=testimonials' },
  ]

  const quickActions = [
    { label: 'Add New Product', to: '/admin/products', icon: Package },
    { label: 'Upload Gallery Photo', to: '/admin/gallery', icon: Image },
    { label: 'Edit Home Content', to: '/admin/content', icon: FileText },
    { label: 'Manage Orders', to: '/admin/orders', icon: ClipboardList },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={0}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <span className="absolute inset-0 rotate-45 rounded-[9px] border border-[#B07D3F]/30 bg-[#B07D3F]/[0.04]" />
            <TrendingUp className="w-4 h-4 text-[#7B2D43]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2B2118]">
              Dashboard
            </h1>
            <p className="font-accent font-light text-[10px] tracking-[0.35em] uppercase text-[#B07D3F]">
              Overview & Quick Actions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map(({ label, count, icon: Icon, color, link }, i) => (
          <motion.div
            key={label}
            variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
          >
            <Link
              to={link}
              className="group block relative bg-white rounded-[1.5rem] border border-[#B07D3F]/10 p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-[0_6px_18px_-6px_rgba(59,31,43,0.3)] group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="w-5 h-5 text-[#FBF7F0]" strokeWidth={1.5} />
              </div>
              <p className="font-display text-3xl font-semibold text-[#2B2118] mb-1">
                {loading ? (
                  <span className="inline-block w-10 h-8 bg-[#F3EADC] rounded-lg animate-pulse" />
                ) : count}
              </p>
              <p className="font-accent font-light text-[10px] tracking-[0.3em] uppercase text-[#2B2118]/45">
                {label}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={5}
      >
        <h2 className="font-display text-xl font-semibold text-[#2B2118] mb-5">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="group flex items-center gap-4 p-5 bg-white rounded-[1.25rem] border border-[#B07D3F]/10 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[#7B2D43]/20 transition-all duration-400"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3EADC] to-[#F2D9D2]/60 border border-[#B07D3F]/15 flex items-center justify-center group-hover:border-[#7B2D43]/25 transition-colors duration-300">
                <Icon className="w-4 h-4 text-[#7B2D43]" strokeWidth={1.5} />
              </div>
              <span className="flex-1 font-accent text-[13px] tracking-[0.05em] text-[#2B2118]/70 group-hover:text-[#2B2118] transition-colors duration-300">
                {label}
              </span>
              <ArrowRight className="w-4 h-4 text-[#B07D3F]/40 group-hover:text-[#7B2D43] group-hover:translate-x-1 transition-all duration-300" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={6}
        className="mt-10 relative bg-gradient-to-br from-[#46242F] via-[#3B1F2B] to-[#2E1822] rounded-[1.5rem] p-8 overflow-hidden shadow-[var(--shadow-lg)]"
      >
        <div className="grain grain-strong" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-[#D9A5A0]/10 blur-[60px]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D9A5A0]/10 border border-[#D9A5A0]/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#D9A5A0]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-[#FBF7F0] mb-1">Welcome to Admin Panel</h3>
            <p className="font-body text-[13px] text-[#FBF7F0]/45 leading-relaxed">
              Manage your products, gallery, users, and site content. Changes will reflect on the live website in real-time.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
