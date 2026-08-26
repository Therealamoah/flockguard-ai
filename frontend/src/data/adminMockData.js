// Mock data for the FlockGuard platform admin panel. This represents data
// that will come from a real multi-tenant backend later — every farm here
// (including "Colnett Poultry Farm") is a separate tenant from the admin's
// point of view, not the same account as the farmer-facing app.

export const adminUser = {
  name: 'Nana Adjei',
  initials: 'NA',
  role: 'Platform Admin',
  email: 'nana@flockguard.io',
};

export const PLAN_PRICE = { Free: 0, Pro: 49, Enterprise: 199 };

export const farms = [
  {
    id: 'farm-1',
    name: 'Colnett Poultry Farm',
    owner: 'Collins Amoah',
    email: 'collinsamoah594@gmail.com',
    plan: 'Pro',
    status: 'active',
    signupDate: '2026-06-02',
    flockCount: 6,
    userCount: 3,
    birdCount: 14200,
    lastActive: '2026-08-25',
  },
  {
    id: 'farm-2',
    name: 'Golden Egg Farms',
    owner: 'Kwabena Mensah',
    email: 'kwabena@goldeneggfarms.com',
    plan: 'Enterprise',
    status: 'active',
    signupDate: '2025-11-14',
    flockCount: 14,
    userCount: 8,
    birdCount: 38500,
    lastActive: '2026-08-26',
  },
  {
    id: 'farm-3',
    name: 'Northgate Broilers',
    owner: 'Linda Owusu',
    email: 'linda@northgatebroilers.com',
    plan: 'Pro',
    status: 'active',
    signupDate: '2026-03-05',
    flockCount: 5,
    userCount: 2,
    birdCount: 11800,
    lastActive: '2026-08-24',
  },
  {
    id: 'farm-4',
    name: 'Kasoa Layers Co-op',
    owner: 'Yaw Boadi',
    email: 'yaw@kasoalayers.com',
    plan: 'Free',
    status: 'trial',
    signupDate: '2026-08-10',
    flockCount: 1,
    userCount: 1,
    birdCount: 1200,
    lastActive: '2026-08-25',
  },
  {
    id: 'farm-5',
    name: 'Volta Valley Farms',
    owner: 'Efua Asante',
    email: 'efua@voltavalleyfarms.com',
    plan: 'Pro',
    status: 'suspended',
    signupDate: '2026-01-22',
    flockCount: 4,
    userCount: 2,
    birdCount: 9600,
    lastActive: '2026-08-12',
  },
  {
    id: 'farm-6',
    name: 'Highland Poultry Estate',
    owner: 'Samuel Tetteh',
    email: 'samuel@highlandpoultry.com',
    plan: 'Enterprise',
    status: 'active',
    signupDate: '2025-08-30',
    flockCount: 20,
    userCount: 10,
    birdCount: 52300,
    lastActive: '2026-08-26',
  },
  {
    id: 'farm-7',
    name: 'Coastal Broilers Ltd',
    owner: 'Grace Mensah',
    email: 'grace@coastalbroilers.com',
    plan: 'Free',
    status: 'trial',
    signupDate: '2026-08-24',
    flockCount: 1,
    userCount: 1,
    birdCount: 900,
    lastActive: '2026-08-24',
  },
  {
    id: 'farm-8',
    name: 'Sunrise Poultry Farm',
    owner: 'Ama Serwaa',
    email: 'ama@sunrisepoultry.com',
    plan: 'Free',
    status: 'trial',
    signupDate: '2026-08-20',
    flockCount: 2,
    userCount: 1,
    birdCount: 3100,
    lastActive: '2026-08-25',
  },
];

export const platformUsers = [
  { id: 1, name: 'Collins Amoah', email: 'collinsamoah594@gmail.com', farmId: 'farm-1', role: 'Owner', lastLogin: '2026-08-26', status: 'active' },
  { id: 2, name: 'Ama Boateng', email: 'ama.boateng@colnettfarm.com', farmId: 'farm-1', role: 'Manager', lastLogin: '2026-08-25', status: 'active' },
  { id: 3, name: 'Kwesi Owusu', email: 'kwesi.owusu@colnettfarm.com', farmId: 'farm-1', role: 'Staff', lastLogin: '2026-08-24', status: 'active' },
  { id: 4, name: 'Kwabena Mensah', email: 'kwabena@goldeneggfarms.com', farmId: 'farm-2', role: 'Owner', lastLogin: '2026-08-26', status: 'active' },
  { id: 5, name: 'Linda Owusu', email: 'linda@northgatebroilers.com', farmId: 'farm-3', role: 'Owner', lastLogin: '2026-08-24', status: 'active' },
  { id: 6, name: 'Yaw Boadi', email: 'yaw@kasoalayers.com', farmId: 'farm-4', role: 'Owner', lastLogin: '2026-08-25', status: 'active' },
  { id: 7, name: 'Efua Asante', email: 'efua@voltavalleyfarms.com', farmId: 'farm-5', role: 'Owner', lastLogin: '2026-08-12', status: 'suspended' },
  { id: 8, name: 'Samuel Tetteh', email: 'samuel@highlandpoultry.com', farmId: 'farm-6', role: 'Owner', lastLogin: '2026-08-26', status: 'active' },
  { id: 9, name: 'Grace Mensah', email: 'grace@coastalbroilers.com', farmId: 'farm-7', role: 'Owner', lastLogin: '2026-08-24', status: 'active' },
  { id: 10, name: 'Ama Serwaa', email: 'ama@sunrisepoultry.com', farmId: 'farm-8', role: 'Owner', lastLogin: '2026-08-25', status: 'active' },
];

export const activityLog = [
  { id: 1, time: '2026-08-26 09:12', type: 'alert', text: 'Alert escalated — Highland Poultry Estate: mortality spike in House 12', farmId: 'farm-6' },
  { id: 2, time: '2026-08-25 16:40', type: 'billing', text: 'Trial expiring in 3 days — Kasoa Layers Co-op', farmId: 'farm-4' },
  { id: 3, time: '2026-08-24 11:05', type: 'signup', text: 'New farm registered — Coastal Broilers Ltd', farmId: 'farm-7' },
  { id: 4, time: '2026-08-23 08:30', type: 'billing', text: 'Payment failed — Volta Valley Farms (Pro plan)', farmId: 'farm-5' },
  { id: 5, time: '2026-08-22 10:00', type: 'billing', text: 'Account suspended — Volta Valley Farms (overdue 14 days)', farmId: 'farm-5' },
  { id: 6, time: '2026-08-20 14:22', type: 'signup', text: 'New farm registered — Sunrise Poultry Farm', farmId: 'farm-8' },
  { id: 7, time: '2026-08-19 17:15', type: 'support', text: 'Support ticket opened — Colnett Poultry Farm: feed data import question', farmId: 'farm-1' },
  { id: 8, type: 'billing', time: '2026-08-15 09:50', text: 'Upgraded to Enterprise — Golden Egg Farms', farmId: 'farm-2' },
  { id: 9, type: 'team', time: '2026-08-18 13:05', text: 'New team member invited — Northgate Broilers', farmId: 'farm-3' },
  { id: 10, type: 'system', time: '2026-08-24 07:00', text: 'Weekly digest email sent to 8 farms', farmId: null },
];

export const alertsPerWeek = [
  { week: 'Wk 1', alerts: 22 },
  { week: 'Wk 2', alerts: 25 },
  { week: 'Wk 3', alerts: 19 },
  { week: 'Wk 4', alerts: 31 },
  { week: 'Wk 5', alerts: 28 },
  { week: 'Wk 6', alerts: 37 },
];

export const verificationOutcomes = [
  { key: 'confirmed', label: 'Confirmed', value: 61 },
  { key: 'dismissed', label: 'Dismissed', value: 28 },
];

export function platformStats() {
  const totalFarms = farms.length;
  const activeFarms = farms.filter((f) => f.status === 'active').length;
  const trialFarms = farms.filter((f) => f.status === 'trial').length;
  const suspendedFarms = farms.filter((f) => f.status === 'suspended').length;
  const totalBirds = farms.reduce((sum, f) => sum + f.birdCount, 0);
  const totalFlocks = farms.reduce((sum, f) => sum + f.flockCount, 0);
  const totalUsers = farms.reduce((sum, f) => sum + f.userCount, 0);
  const mrr = farms.reduce((sum, f) => sum + (f.status === 'suspended' ? 0 : PLAN_PRICE[f.plan]), 0);

  return { totalFarms, activeFarms, trialFarms, suspendedFarms, totalBirds, totalFlocks, totalUsers, mrr };
}
