import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from './authStore';

function toInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

async function loadUser(authUser) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, farm_id, notify_critical, notify_daily_summary, notify_weekly_reports, farms(name, plan, phone)')
    .eq('id', authUser.id)
    .single();

  if (!profile) {
    return { id: authUser.id, name: authUser.email, initials: toInitials(authUser.email), email: authUser.email, farm: '', plan: 'Free', role: '' };
  }

  return {
    id: authUser.id,
    name: profile.name,
    initials: toInitials(profile.name),
    email: authUser.email,
    farm: profile.farms?.name ?? '',
    phone: profile.farms?.phone ?? '',
    plan: profile.farms?.plan ? profile.farms.plan[0].toUpperCase() + profile.farms.plan.slice(1) : 'Free',
    role: profile.role,
    farmId: profile.farm_id,
    notifyCritical: profile.notify_critical,
    notifyDailySummary: profile.notify_daily_summary,
    notifyWeeklyReports: profile.notify_weekly_reports,
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

  // Direct plan change with no payment involved -- switching to Free.
  async function upgradePlan(planId) {
    if (!user?.farmId) return;
    await supabase.from('farms').update({ plan: planId.toLowerCase() }).eq('id', user.farmId);
    setUser((prev) => ({ ...prev, plan: planId }));
  }

  // Local-only update after the backend has already verified a Paystack
  // payment and written the new plan itself -- no second write from here.
  function syncPlan(planId) {
    setUser((prev) => ({ ...prev, plan: planId }));
  }

  // Settings -> "Save changes". Farm name/phone only actually write if the
  // caller is the farm owner (matches the "owner can update own farm" RLS
  // policy) -- a non-owner will get a clear error back instead of a silent
  // no-op.
  async function updateProfile({ farmName, managerName, phone }) {
    const writes = [supabase.from('profiles').update({ name: managerName }).eq('id', user.id)];

    if (farmName !== user.farm || phone !== user.phone) {
      writes.push(supabase.from('farms').update({ name: farmName, phone }).eq('id', user.farmId));
    }

    const results = await Promise.all(writes);
    const failed = results.find((r) => r.error);
    if (failed) throw failed.error;

    setUser((prev) => ({ ...prev, name: managerName, initials: toInitials(managerName), farm: farmName, phone }));
  }

  // Saves immediately on toggle -- no separate "Save changes" step for
  // notification preferences.
  async function updateNotificationPrefs(prefs) {
    const columns = {
      notifyCritical: 'notify_critical',
      notifyDailySummary: 'notify_daily_summary',
      notifyWeeklyReports: 'notify_weekly_reports',
    };
    const updates = Object.fromEntries(Object.entries(prefs).map(([key, value]) => [columns[key], value]));

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw error;

    setUser((prev) => ({ ...prev, ...prefs }));
  }

  if (loading) return null;

  const value = {
    isAuthenticated,
    user: user ?? {},
    login,
    register,
    logout,
    upgradePlan,
    syncPlan,
    updateProfile,
    updateNotificationPrefs,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
