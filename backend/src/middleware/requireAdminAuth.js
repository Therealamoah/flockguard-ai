import { supabaseAdmin } from '../supabaseAdmin.js';

// Every /api/admin/* route needs a real, currently-valid Supabase session
// AND a matching row in platform_admins -- being logged in isn't enough,
// you also have to be on the admin allow-list.
export async function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: admin, error: adminError } = await supabaseAdmin
    .from('platform_admins')
    .select('id, name')
    .eq('id', userData.user.id)
    .single();

  if (adminError || !admin) {
    return res.status(403).json({ error: 'This account is not a platform admin' });
  }

  req.admin = admin;
  next();
}
