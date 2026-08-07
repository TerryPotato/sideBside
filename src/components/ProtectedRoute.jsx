import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.rol !== role) return <Navigate to={`/${user.rol}/dashboard`} replace />
  return <Outlet />
}
