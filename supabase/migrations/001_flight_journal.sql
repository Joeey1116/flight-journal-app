-- Flight Journal — Supabase schema (001)
--
-- Tables: profiles, logbook_entries, aircraft, qualifications.
-- RLS: every row belongs to a user (auth.uid()); users only see their own.
-- Apply in the Supabase dashboard SQL editor after the project is created.
-- The app runs local-first until then (see lib/store.tsx).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.logbook_entries (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  aircraft_type text not null,
  aircraft_model text not null default '',
  registration text not null,
  departure text not null,
  arrival text not null,
  route text,
  out_time text,
  off_time text,
  on_time text,
  in_time text,
  total_time numeric not null default 0,
  pic numeric not null default 0,
  sic numeric not null default 0,
  dual_received numeric not null default 0,
  dual_given numeric not null default 0,
  solo numeric not null default 0,
  cross_country numeric not null default 0,
  night numeric not null default 0,
  instrument_actual numeric not null default 0,
  instrument_simulated numeric not null default 0,
  day_landings integer not null default 0,
  night_landings integer not null default 0,
  approaches integer not null default 0,
  holds integer not null default 0,
  is_sim boolean not null default false,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aircraft (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  model text not null default '',
  registration text not null,
  category text not null default 'ASEL',
  engine text not null default 'piston',
  multi_engine boolean not null default false,
  turbine boolean not null default false,
  complex boolean not null default false,
  tailwheel boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.qualifications (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null, -- medical | flightReview | rating | endorsement | other
  name text not null,
  issued_date date not null,
  expiry_date date,
  created_at timestamptz not null default now()
);

create index if not exists logbook_entries_user_date_idx
  on public.logbook_entries (user_id, date desc);
create index if not exists aircraft_user_idx on public.aircraft (user_id);
create index if not exists qualifications_user_idx on public.qualifications (user_id);

alter table public.profiles enable row level security;
alter table public.logbook_entries enable row level security;
alter table public.aircraft enable row level security;
alter table public.qualifications enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id);

drop policy if exists "own entries" on public.logbook_entries;
create policy "own entries" on public.logbook_entries
  for all using (auth.uid() = user_id);

drop policy if exists "own aircraft" on public.aircraft;
create policy "own aircraft" on public.aircraft
  for all using (auth.uid() = user_id);

drop policy if exists "own qualifications" on public.qualifications;
create policy "own qualifications" on public.qualifications
  for all using (auth.uid() = user_id);
