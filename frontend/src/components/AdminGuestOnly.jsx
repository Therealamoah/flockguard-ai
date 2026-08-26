import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/adminAuthStore';

export default function AdminGuestOnly() {
  const { isAdminAuthenticated } = useAdminAuth();

  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
