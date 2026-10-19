-- Website form intake: contact messages and demo requests.
-- Only the `submit` Edge Function (service role) can insert.
-- Only signed-in addresses listed in website_admins can read or update.

create table if not exists public.website_admins (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('contact', 'demo')),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  organisation text check (char_length(organisation) <= 160),
  topic text check (char_length(topic) <= 80),
  sites text check (char_length(sites) <= 40),
  message text check (char_length(message) <= 5000),
  page text check (char_length(page) <= 200),
  user_agent text,
  ip_hash text,
  notified boolean,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'replied', 'closed', 'spam')),
  notes text check (char_length(notes) <= 5000),
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_status_idx on public.submissions (status);
create index if not exists submissions_ip_recent_idx on public.submissions (ip_hash, created_at);

-- Who counts as an admin (security definer so policies can call it without recursion)
create or replace function public.is_website_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.website_admins a
    where a.email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );
$$;
revoke all on function public.is_website_admin() from public, anon;
grant execute on function public.is_website_admin() to authenticated;

-- Keep updated_at / updated_by honest on every edit
create or replace function public.submissions_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce((select auth.jwt() ->> 'email'), 'system');
  return new;
end;
$$;
drop trigger if exists submissions_touch on public.submissions;
create trigger submissions_touch before update on public.submissions
  for each row execute function public.submissions_touch();

alter table public.website_admins enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "admins read admins" on public.website_admins;
create policy "admins read admins" on public.website_admins
  for select to authenticated using ((select public.is_website_admin()));

drop policy if exists "admins read submissions" on public.submissions;
create policy "admins read submissions" on public.submissions
  for select to authenticated using ((select public.is_website_admin()));

drop policy if exists "admins update submissions" on public.submissions;
create policy "admins update submissions" on public.submissions
  for update to authenticated
  using ((select public.is_website_admin()))
  with check ((select public.is_website_admin()));

-- Admins may only change workflow fields, never what the sender wrote
revoke all on public.submissions from anon, authenticated;
grant select on public.submissions to authenticated;
grant update (status, notes) on public.submissions to authenticated;
revoke all on public.website_admins from anon, authenticated;
grant select on public.website_admins to authenticated;

insert into public.website_admins (email) values
  ('nicholsvick@gmail.com'),
  ('kevin.lengwadibe@regnumpesonia.com')
on conflict do nothing;
