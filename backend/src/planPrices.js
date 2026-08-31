// Shared between the admin routes (reporting), the payments route
// (verifying a charge matches the plan being purchased), and the team
// route (enforcing the same seat limit the frontend already shows).
export const PLAN_PRICE = { free: 0, pro: 49, enterprise: 199 };
export const TEAM_LIMIT = { free: 1, pro: 5, enterprise: Infinity };
export const FLOCK_LIMIT = { free: 2, pro: 20, enterprise: Infinity };
