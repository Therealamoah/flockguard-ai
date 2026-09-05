-- Splits a flock's daily log into a morning check-in (feed/water given) and
-- an evening check-in (feed eaten, water taken, mortality, behavior, etc.),
-- so the AI can compare the two and catch a flock going off feed/water
-- before it becomes an obvious problem.
--
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New
-- query) before using the morning/evening check-in feature. Existing rows
-- predate this split and represent a single end-of-day entry, so they
-- backfill as 'evening'.

alter table daily_records
  add column if not exists period text not null default 'evening'
    check (period in ('morning', 'evening'));

-- One morning entry and one evening entry per flock per day -- not more.
alter table daily_records
  add constraint daily_records_flock_date_period_key unique (flock_id, record_date, period);
