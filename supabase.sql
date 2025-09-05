-- Table: profile (single admin row keyed by owner UUID)
create table if not exists public.profile (
  owner uuid primary key references auth.users(id) on delete cascade,
  name text,
  headline text,
  bio text,
  website text,
  github text,
  twitter text,
  linkedin text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS: only owner can read/write their row
alter table public.profile enable row level security;

create policy "profile_select_own" on public.profile
for select using (auth.uid() = owner);

create policy "profile_upsert_own" on public.profile
for insert with check (auth.uid() = owner);

create policy "profile_update_own" on public.profile
for update using (auth.uid() = owner) with check (auth.uid() = owner);