import { useState } from 'react';
import { currentUser as seedUser } from '../data/mockData';
import { AuthContext } from './authStore';

// No backend yet — this simulates a session in memory. The backend team
// replaces login/register/logout with real API calls and swaps the
// hardcoded `isAuthenticated` default for a real session check; nothing
// downstream (RequireAuth, the pages) needs to change shape.

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(seedUser);

  function login({ email }) {
    setUser((prev) => ({ ...prev, email: email || prev.email }));
    setIsAuthenticated(true);
  }

  function register({ farmName, managerName, email }) {
    setUser((prev) => ({
      ...prev,
      farm: farmName || prev.farm,
      name: managerName || prev.name,
      email: email || prev.email,
      plan: 'Free',
      initials: (managerName || prev.name)
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    }));
    setIsAuthenticated(true);
  }

  function logout() {
    setIsAuthenticated(false);
  }

  function upgradePlan(planId) {
    setUser((prev) => ({ ...prev, plan: planId }));
  }

  const value = { isAuthenticated, user, login, register, logout, upgradePlan };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
