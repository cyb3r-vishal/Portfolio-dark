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

-- RLS: allow public read of single profile, owner can write
alter table public.profile enable row level security;

-- Public can read profile (site shows a single public profile)
create policy if not exists "profile_public_read" on public.profile
for select
using (true);

-- Owner can insert/update their row
create policy if not exists "profile_upsert_own" on public.profile
for insert with check (auth.uid() = owner);

create policy if not exists "profile_update_own" on public.profile
for update using (auth.uid() = owner) with check (auth.uid() = owner);

-- Table: blog_posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  featured_image text,
  tags text[],
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS for blog posts
alter table public.blog_posts enable row level security;

-- Admin can manage all posts
create policy "blog_posts_admin_all" on public.blog_posts
for all using (auth.uid() = owner);

-- Public can read published posts
create policy "blog_posts_public_read" on public.blog_posts
for select using (status = 'published');

-- Create index for better performance
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_status_idx on public.blog_posts(status);
create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc);

-- Function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;

$$ language plpgsql;

-- Trigger for profile table
create trigger update_profile_updated_at
  before update on public.profile
  for each row execute function update_updated_at_column();

-- Trigger for blog_posts table
create trigger update_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function update_updated_at_column();