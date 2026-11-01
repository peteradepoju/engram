-- Engram database. Every table is private to its owner through row-level security.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  timezone text not null default 'Africa/Lagos',
  start_date date not null default (date_trunc('week', current_date + interval '6 days'))::date, -- the next Monday
  calendar_token uuid not null default gen_random_uuid() unique,
  tutor_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.study_days (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  minutes int not null default 0,
  primary key (user_id, day)
);

create table if not exists public.exercise_results (
  user_id uuid not null references auth.users on delete cascade,
  item_id text not null,
  ok boolean not null default false,
  attempts int not null default 0,
  answer text,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  quiz_id text not null,
  score int not null,
  total int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  user_id uuid not null references auth.users on delete cascade,
  card_id text not null,
  state jsonb not null,
  due timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create table if not exists public.paper_notes (
  user_id uuid not null references auth.users on delete cascade,
  paper_id text not null,
  status text not null default 'unread' check (status in ('unread','skimmed','read','deep')),
  notes text not null default '',
  critique jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, paper_id)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  source text,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  journal_id uuid references public.journal_entries on delete set null,
  text text not null,
  tags text[] not null default '{}',
  status text not null default 'open' check (status in ('open','promoted','parked','answered')),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  question_id uuid references public.questions on delete set null,
  title text not null,
  stage text not null default 'question' check (stage in ('question','hypothesis','plan','running','outline','drafting','submitted','published')),
  hypothesis jsonb not null default '{}'::jsonb,
  plan jsonb not null default '{}'::jsonb,
  outline jsonb not null default '{}'::jsonb,
  results text not null default '',
  venue text,
  deadline date,
  submission_status text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  url text,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  programme text not null,
  institution text,
  country text,
  deadline date,
  status text not null default 'researching' check (status in ('researching','contacted','preparing','submitted','interview','offer','declined','rejected')),
  url text,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

-- Row-level security: each person sees only their own rows.
do $$
declare t text;
begin
  foreach t in array array['lesson_progress','study_days','exercise_results','quiz_attempts','cards','paper_notes',
                           'journal_entries','questions','projects','drafts','applications','tutor_usage'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists own_rows on public.%I', t);
    execute format('create policy own_rows on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

alter table public.profiles enable row level security;
drop policy if exists own_profile on public.profiles;
create policy own_profile on public.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Published projects can be read by anyone (portfolio pages).
drop policy if exists public_projects on public.projects;
create policy public_projects on public.projects for select to anon, authenticated using (is_public);

create index if not exists cards_due on public.cards (user_id, due);
create index if not exists journal_user on public.journal_entries (user_id, created_at desc);
create index if not exists questions_user on public.questions (user_id, created_at desc);
create index if not exists projects_user on public.projects (user_id, updated_at desc);
create index if not exists quiz_user on public.quiz_attempts (user_id, created_at desc);
create index if not exists drafts_project on public.drafts (project_id);
create index if not exists questions_journal on public.questions (journal_id);
create index if not exists projects_question on public.projects (question_id);

-- A profile row for every new account.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- The calendar feed is fetched by Google Calendar without a login, so it looks a profile up by its secret token.
create or replace function public.calendar_profile(token uuid)
returns table (start_date date, timezone text)
language sql stable security definer set search_path = '' as $$
  select p.start_date, p.timezone from public.profiles p where p.calendar_token = token;
$$;
revoke all on function public.calendar_profile(uuid) from public;
grant execute on function public.calendar_profile(uuid) to anon, authenticated;

-- The AI tutor counts uses per day; this bumps the counter and returns the new total.
create or replace function public.bump_tutor_usage() returns int
language plpgsql security invoker set search_path = '' as $$
declare n int;
begin
  insert into public.tutor_usage (user_id, day, count) values ((select auth.uid()), current_date, 1)
  on conflict (user_id, day) do update set count = public.tutor_usage.count + 1
  returning count into n;
  return n;
end $$;
revoke all on function public.bump_tutor_usage() from public, anon;
grant execute on function public.bump_tutor_usage() to authenticated;
