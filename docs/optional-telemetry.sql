-- Optional future extension. NOT required or applied for the landing page.
-- Supabase/PostgreSQL. Server-side service role only; no public client writes.
-- Consent, retention, rate limiting and staff authentication belong in the future ingestion service.
create table if not exists public.shop_events (
 id uuid primary key default gen_random_uuid(),
 occurred_at timestamptz not null default now(),
 anonymous_session_id uuid,
 event_name text not null check (event_name in ('genre_selected','call_clicked','directions_clicked','shop_opened','purchase_confirmed')),
 attributes jsonb not null default '{}'::jsonb,
 consent_version text not null
);
create index if not exists shop_events_name_time_idx on public.shop_events(event_name, occurred_at desc);
create table if not exists public.merchandising_decisions (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 staff_id uuid references auth.users(id) on delete set null,
 parent_decision_id uuid references public.merchandising_decisions(id),
 prompt_chain jsonb not null default '[]'::jsonb,
 proposed_action text not null,
 human_pivot text,
 approved_action text,
 confidence numeric check (confidence between 0 and 1),
 follow_up_at timestamptz,
 status text not null default 'draft' check (status in ('draft','approved','rejected','measured'))
);
create index if not exists merchandising_due_idx on public.merchandising_decisions(follow_up_at) where status='approved';
create table if not exists public.decision_outcomes (
 id uuid primary key default gen_random_uuid(),
 decision_id uuid not null references public.merchandising_decisions(id) on delete cascade,
 recorded_at timestamptz not null default now(),
 evidence_source text not null,
 real_world_result jsonb not null,
 staff_correction text
);
create index if not exists outcomes_decision_idx on public.decision_outcomes(decision_id, recorded_at desc);
alter table public.shop_events enable row level security;
alter table public.merchandising_decisions enable row level security;
alter table public.decision_outcomes enable row level security;
revoke all on public.shop_events, public.merchandising_decisions, public.decision_outcomes from anon, authenticated;
-- No policies are supplied intentionally: browser roles cannot read/write these tables.
-- Do not log email, telephone, IP, or collection photos in analytics attributes.
-- Capture corrections as new linked records, never silently rewrite a staff decision.
-- Future follow-up jobs may sample approved decisions whose follow_up_at is due;
-- ask an authenticated staff member for measured results before adjusting merchandising.
