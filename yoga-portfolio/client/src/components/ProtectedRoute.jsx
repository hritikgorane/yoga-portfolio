import { useAuth } from '../context/AuthContext'
import AdminLogin from '../pages/AdminLogin'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--deep-green)' }}>
      <p style={{ color: 'var(--sage)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontStyle: 'italic' }}>Loading...</p>
    </div>
  )
  if (!user) return <AdminLogin />
  return children
}
