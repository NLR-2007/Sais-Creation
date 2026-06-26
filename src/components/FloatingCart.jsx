import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function FloatingCart() {
  const { cartCount } = useCart()

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <Link
            to="/cart"
            className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-[#8E3650] via-[#7B2D43] to-[#5C1F31] flex items-center justify-center shadow-[0_8px_28px_-6px_rgba(123,45,67,0.6)] hover:shadow-[0_14px_40px_-6px_rgba(123,45,67,0.7)] hover:scale-110 active:scale-100 transition-all duration-400"
          >
            <ShoppingCart className="w-6 h-6 text-[#FBF7F0] relative z-10" strokeWidth={1.5} />
            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#B07D3F] text-[#FBF7F0] font-accent font-semibold text-[11px] flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(176,125,63,0.6)]">
              {cartCount}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
