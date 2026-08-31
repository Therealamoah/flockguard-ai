import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from './authStore';

function toInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

async function loadUser(authUser) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, farm_id, farms(name, plan)')
    .eq('id', authUser.id)
    .single();

  if (!profile) {
    return { name: authUser.email, initials: toInitials(authUser.email), email: authUser.email, farm: '', plan: 'Free', role: '' };
  }

  return {
    name: profile.name,
    initials: toInitials(profile.name),
    email: authUser.email,
    farm: profile.farms?.name ?? '',
    plan: profile.farms?.plan ? profile.farms.plan[0].toUpperCase() + profile.farms.plan.slice(1) : 'Free',
    role: profile.role,
    farmId: profile.farm_id,
  };
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(await loadUser(session.user));
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(await loadUser(session.user));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function register({ farmName, managerName, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          farm_name: farmName,
          full_name: managerName,
        },
      },
    });
    if (error) throw error;
    if (!data.session) return; // email confirmation is on — no session yet, don't claim logged-in

    setUser(await loadUser(data.user));
    setIsAuthenticated(true);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function upgradePlan(planId) {
    if (!user?.farmId) return;
    await supabase.from('farms').update({ plan: planId.toLowerCase() }).eq('id', user.farmId);
    setUser((prev) => ({ ...prev, plan: planId }));
  }

  if (loading) return null;

  const value = { isAuthenticated, user: user ?? {}, login, register, logout, upgradePlan };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
