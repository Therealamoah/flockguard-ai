import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/adminAuthStore';

export default function AdminRequireAuth() {
  const { isAdminAuthenticated } = useAdminAuth();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
