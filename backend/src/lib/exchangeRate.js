// Live USD->GHS rate, cached in memory so we're not hitting the FX API on
// every checkout. Falls back to a fixed rate if the API is unreachable, so
// a payment never hard-fails just because an FX lookup timed out -- update
// FALLBACK_USD_TO_GHS occasionally if it's been a while.
const FALLBACK_USD_TO_GHS = 15.5;
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

let cachedRate = null;
let cachedAt = 0;

export async function getUsdToGhsRate() {
  const now = Date.now();
  if (cachedRate && now - cachedAt < CACHE_MS) return cachedRate;

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    const rate = data?.rates?.GHS;
    if (!rate) throw new Error('GHS rate missing from exchange rate response');
    cachedRate = rate;
    cachedAt = now;
    return rate;
  } catch (err) {
    console.error('Exchange rate fetch failed, using fallback rate:', err.message);
    return cachedRate ?? FALLBACK_USD_TO_GHS;
  }
}
