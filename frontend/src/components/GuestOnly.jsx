import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authStore';

export default function GuestOnly() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
