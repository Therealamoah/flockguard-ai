# FlockGuard

AI-powered flock health early-warning system for poultry farms. Farmers log daily
records (feed, water, mortality, production, house conditions); the system detects
unusual patterns, a human confirms or dismisses the flag, confirmed issues become
alerts with a recommended next step.

**Core loop: Monitor → Detect → Verify → Alert → Guide.**

## Structure

- [`frontend/`](frontend/) — React + Vite. Public site, the farmer-facing app
  (`/app/*`), and the platform admin panel (`/admin/*`).
- [`backend/`](backend/) — Node/Express API. Anything that needs a secret key
  (Supabase `service_role`, Paystack, Cloudinary, Gmail SMTP, Gemini) lives here —
  never in frontend code.
- **Supabase** — Postgres database + Auth. The frontend talks to it directly for
  everything scoped to "my own farm" (protected by Row Level Security); the backend
  uses it for anything that needs to see across farms or hold a secret.

Each folder has its own `package.json` and `.env.example`.

## Status: what's working

**Farmer app** (all wired to real Supabase data, not mock):
- Register / login / logout, forgot & reset password
- Dashboard, My flocks (with real plan-based flock limits), Daily records, Health
  monitoring, Alerts (the full Detect → Verify → Alert loop), Analytics,
  Recommendations, Reports (Analytics/Recommendations/Reports are Pro+ only —
  Free plan sees a real upgrade prompt, not the content)
- Settings: profile editing (actually saves), Plan & Billing (real Paystack
  checkout with live USD→GHS conversion), notification preferences (real
  toggles), Team (real invites sent via email, with resend)
- Real photo/video evidence upload on daily records (Cloudinary, signed uploads)
- Real plan enforcement: Free/Pro/Enterprise have **actual** different flock
  limits, team limits, history windows, and feature access — not just marketing
  copy on the pricing page

**Admin panel** (`/admin`) — Overview, Farms, Users, Billing, Activity — all
reading real data through the backend (which uses the `service_role` key; the
browser never gets it).

**Backend APIs** (`backend/src/routes/`):
- `admin.js` — powers the admin panel
- `payments.js` — Paystack checkout + server-side verification + live currency
  conversion (USD plan price → GHS)
- `uploads.js` — signed Cloudinary upload URLs, scoped per farm
- `team.js` — invite / accept-invite / resend, real emails via Nodemailer
- `notifications.js` — critical-alert emails, fired the moment an alert is
  confirmed
- `ai.js` — real AI: record classification (replaces the rule-based detector for
  Pro/Enterprise) and recommendation generation, see **AI integration** below
- `lib/scheduler.js` — `node-cron` job for the daily summary email

**Detection tiers:**
- **Free plan** — cheap, instant, client-side rule-based check
  (`frontend/src/lib/anomalyRules.js`) — mortality spikes only. No AI call, no cost.
- **Pro/Enterprise** — real AI classification (see below), full multi-factor
  detection with natural-language reasons instead of template strings.

## Status: what's left

- **Backend isn't deployed.** It only runs on a local machine right now. The
  frontend can be deployed to Vercel today and the *core* farmer app (auth,
  flocks, records, alerts) will work fine since that talks to Supabase directly —
  but the admin panel, payments, uploads, invites, notifications, and AI
  detection all go through the backend and **will not work** until it's deployed
  somewhere real (Railway is the plan) and `VITE_BACKEND_API_URL` points at it.
- **Daily summary scheduler** — built (`node-cron`, runs once a day, gathers real
  per-farm stats), but needs the `profiles.notify_*` columns confirmed present in
  the database and a real end-to-end send verified. Last state: wiring done,
  final confirmation pending.
- **Weekly reports** — no content-generation logic exists yet. The toggle saves,
  but nothing produces a report to summarize.
- **Database migrations were applied ad-hoc** via the Supabase SQL editor during
  development, not tracked as versioned migration files. Before onboarding
  another environment (staging, a teammate's own Supabase project), this should
  get consolidated into a proper `schema.sql` / migrations folder.
- **Plan limits are enforced at the application layer, not the database layer.**
  A determined user with dev tools could still, in theory, hit Supabase directly
  and bypass a flock/team limit. Not exploitable by a normal user through the UI,
  but worth knowing if this ever needs to be hardened.

## AI integration — current status

**Using Google Gemini (`gemini-3.6-flash`) right now — this is a temporary
choice, not the final one.** Our tutors are providing an xAI Grok API key later;
Gemini has a genuinely free tier and was the fastest way to get a *real,
working* AI loop in place while waiting for that.

- Code lives in `backend/src/lib/ai.js` (two functions: `classifyRecord` and
  `generateRecommendation`) and `backend/src/routes/ai.js`.
- Verified working end-to-end: correctly flags genuinely bad records with
  specific numeric reasons, correctly leaves normal records alone, and
  generates real, usable recommendations.
- **Two real setup issues hit along the way, in case they come up again:**
  1. The first two API keys generated weren't valid Gemini credentials (wrong
     token type — started with `AQ.` instead of the expected `AIzaSy...`).
     Fix: the key **must** come from `aistudio.google.com` → "Get API key" →
     "Create API key" specifically, not Google Cloud Console.
  2. The model name `gemini-2.5-flash` is deprecated for new API keys; Google's
     own error pointed us to `gemini-3.6-flash`, which is what's in use now.
     If Google deprecates that too, the fix is the same: read the actual error
     message, it names the replacement model directly.
- **Swapping to Grok when the school key arrives** will need real code changes,
  not just an env var swap — Grok's API uses a different (OpenAI-compatible)
  request shape than Gemini's SDK. The swap is contained to `backend/src/lib/ai.js`
  though; nothing in the frontend or the rest of the backend needs to change,
  since everything downstream only ever consumes the same `{ flagged, reasons }`
  / `{ title, body, priority }` shapes regardless of which model produced them.

## Local setup

Each of `frontend/` and `backend/` has its own `.env.example` — copy it to `.env`
in that folder and fill in real values (ask a teammate who already has them
rather than regenerating new ones for shared services like Supabase/Paystack).

```bash
# Backend
cd backend
npm install
npm run dev          # http://localhost:4000

# Frontend (separate terminal)
cd frontend
yarn install
yarn dev              # http://localhost:5173
```

Both need to be running for the full app to work locally — the frontend alone
covers everything that talks directly to Supabase; the backend covers admin,
payments, uploads, invites, notifications, and AI.
