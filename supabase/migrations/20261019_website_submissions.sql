-- Website form intake: contact messages and demo requests.
-- Only the `submit` Edge Function (service role, bypasses RLS) can insert.
-- Only signed-in addresses listed in website_admins can read or update.

create table public.website_admins (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);

create table public.submissions (
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

create index submissions_created_at_idx on public.submissions (created_at desc);
create index submissions_status_idx on public.submissions (status);
create index submissions_ip_recent_idx on public.submissions (ip_hash, created_at);

create function public.is_website_admin()
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

-- On every edit: keep what the sender wrote unchangeable, stamp who changed it.
create function public.submissions_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    new.id := old.id; new.created_at := old.created_at; new.kind := old.kind;
    new.name := old.name; new.email := old.email; new.organisation := old.organisation;
    new.topic := old.topic; new.sites := old.sites; new.message := old.message;
    new.page := old.page; new.user_agent := old.user_agent; new.ip_hash := old.ip_hash;
    new.notified := old.notified;
  end if;
  new.updated_at := now();
  new.updated_by := coalesce((select auth.jwt() ->> 'email'), 'system');
  return new;
end;
$$;
create trigger submissions_guard before update on public.submissions
  for each row execute function public.submissions_guard();

alter table public.website_admins enable row level security;
alter table public.submissions enable row level security;

create policy "admins read admins" on public.website_admins
  for select to authenticated using ((select public.is_website_admin()));

create policy "admins read submissions" on public.submissions
  for select to authenticated using ((select public.is_website_admin()));

create policy "admins update submissions" on public.submissions
  for update to authenticated
  using ((select public.is_website_admin()))
  with check ((select public.is_website_admin()));

insert into public.website_admins (email) values
  ('nicholsvick@gmail.com'),
  ('kevin.lengwadibe@regnumpesonia.com');
