import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000';

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request(path, options = {}, headers = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...headers, ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export const backendApi = {
  get: async (path) => request(path, {}, await authHeader()),
  post: async (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }, await authHeader()),
  del: async (path) => request(path, { method: 'DELETE' }, await authHeader()),
};

// For routes reached before the caller has a session -- accepting a team
// invite, for instance.
export const publicApi = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
};
