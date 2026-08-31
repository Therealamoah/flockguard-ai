import { supabaseAdmin } from '../supabaseAdmin.js';

// For routes a regular logged-in farmer calls (not a platform admin).
// Verifies the token is real, then resolves it to that user's farm_id --
// callers use req.farmId, never a farm_id sent by the client, so a farmer
// can never act on someone else's farm no matter what the request body says.
export async function requireFarmerAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('farm_id, role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: 'No farm found for this account' });
  }

  req.farmId = profile.farm_id;
  req.userId = userData.user.id;
  req.role = profile.role;
  next();
}
