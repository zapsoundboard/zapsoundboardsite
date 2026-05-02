import { Navigate } from 'react-router-dom'
import { useAdminStore } from '@/store'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminStore()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
