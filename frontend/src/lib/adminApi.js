import { supabaseAdminAuth } from './supabaseAdminClient';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000';

async function authHeader() {
  const {
    data: { session },
  } = await supabaseAdminAuth.auth.getSession();
  if (!session) throw new Error('Not signed in as admin');
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeader()), ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}/api/admin${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export const adminApi = {
  get: (path) => request(path),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
};
