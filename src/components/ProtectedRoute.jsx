import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin, adminVerified } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <span className="absolute inset-0 rounded-full border-2 border-[#B07D3F]/20" />
            <span className="absolute inset-0 rounded-full border-2 border-t-[#7B2D43] animate-spin" />
          </div>
          <p className="font-accent font-light text-[11px] tracking-[0.4em] uppercase text-[#B07D3F]">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requireAdmin) {
    if (!isAdmin) return <Navigate to="/" replace />
    if (!adminVerified) return <Navigate to="/login" replace />
  }

  return children
}
