import { useEffect, useState } from 'react';
import { supabaseAdminAuth } from '../lib/supabaseAdminClient';
import { AdminAuthContext } from './adminAuthStore';

function toInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

async function loadAdminRow(userId) {
  const { data } = await supabaseAdminAuth.from('platform_admins').select('id, name').eq('id', userId).single();
  if (!data) return null;
  return { name: data.name, initials: toInitials(data.name) };
}

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseAdminAuth.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const row = await loadAdminRow(session.user.id);
        if (row) {
          setAdmin({ ...row, email: session.user.email });
          setIsAdminAuthenticated(true);
        }
      }
      setLoading(false);
    });

    const { data: listener } = supabaseAdminAuth.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const row = await loadAdminRow(session.user.id);
        if (row) {
          setAdmin({ ...row, email: session.user.email });
          setIsAdminAuthenticated(true);
          return;
        }
      }
      setAdmin(null);
      setIsAdminAuthenticated(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function adminLogin({ email, password }) {
    const { data, error } = await supabaseAdminAuth.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const row = await loadAdminRow(data.user.id);
    if (!row) {
      await supabaseAdminAuth.auth.signOut();
      throw new Error('This account is not a platform admin');
    }

    setAdmin({ ...row, email: data.user.email });
    setIsAdminAuthenticated(true);
  }

  async function adminLogout() {
    await supabaseAdminAuth.auth.signOut();
  }

  if (loading) return null;

  const value = { isAdminAuthenticated, admin: admin ?? {}, adminLogin, adminLogout };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
