import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: users, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 200 });
const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*');
const { data: farms, error: farmsErr } = await supabase.from('farms').select('*');
const { data: admins, error: adminsErr } = await supabase.from('platform_admins').select('*');

console.log('=== auth.users ===');
console.log(usersErr ? usersErr.message : users.users.map((u) => ({ id: u.id, email: u.email, created: u.created_at })));

console.log('\n=== profiles ===');
console.log(profilesErr ? profilesErr.message : profiles);

console.log('\n=== farms ===');
console.log(farmsErr ? farmsErr.message : farms);

console.log('\n=== platform_admins ===');
console.log(adminsErr ? adminsErr.message : admins);
