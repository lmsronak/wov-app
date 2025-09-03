import { Navigate, Outlet } from 'react-router'
import { useAtomValue } from 'jotai'
import { userInfoAtom } from '@/atoms/user'

const AdminRoute = () => {
  const userInfo = useAtomValue(userInfoAtom)

  return userInfo && userInfo.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  )
}

export default AdminRoute
