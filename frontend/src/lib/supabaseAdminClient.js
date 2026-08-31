import { createClient } from '@supabase/supabase-js';

// A separate client instance with its own localStorage key, so a platform
// admin's session never collides with a farmer's session in the same
// browser tab -- these are two different personas, not two roles on one
// account, and they must be able to coexist independently.
export const supabaseAdminAuth = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { storageKey: 'flockguard-admin-auth' } }
);
