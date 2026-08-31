# flockguard-ai

Monorepo for the flockguard-ai project.

## Structure

- [`frontend/`](frontend/) — React + Vite frontend
- [`backend/`](backend/) — Node/Express API (admin panel, and later payments/AI/email — anything needing the Supabase `service_role` key)

Each folder is self-contained with its own dependencies. See the README inside each folder for setup instructions.
