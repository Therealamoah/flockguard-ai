import { useState } from 'react';
import { adminUser as seedAdmin } from '../data/adminMockData';
import { AdminAuthContext } from './adminAuthStore';

// Deliberately separate from the farmer-facing AuthContext — a platform
// admin is a different persona with a different session entirely, not a
// role on a farm account. Backend team replaces this with a real admin
// session check.

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [admin] = useState(seedAdmin);

  function adminLogin() {
    setIsAdminAuthenticated(true);
  }

  function adminLogout() {
    setIsAdminAuthenticated(false);
  }

  const value = { isAdminAuthenticated, admin, adminLogin, adminLogout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
