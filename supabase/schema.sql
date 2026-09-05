-- DevPath schema — plain Postgres tables on Supabase, accessed only via
-- the service-role key from Next.js API routes. Auth is custom JWT
-- (not Supabase Auth) to match the existing frontend contract exactly.

create table if not exists users (
  id bigserial primary key,
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  name text,
  bio text,
  leetcode_username text,
  github_username text,
  role text not null default 'USER',
  created_at timestamptz not null default now()
);

create table if not exists roadmaps (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  title text not null,
  description text,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_roadmaps_user on roadmaps(user_id);

create table if not exists roadmap_tasks (
  id bigserial primary key,
  roadmap_id bigint not null references roadmaps(id) on delete cascade,
  title text not null,
  description text,
  completed boolean not null default false,
  due_date date,
  priority text not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH')),
  estimated_hours integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_tasks_roadmap on roadmap_tasks(roadmap_id);

create table if not exists leetcode_stats (
  id bigserial primary key,
  user_id bigint not null unique references users(id) on delete cascade,
  username text not null,
  ranking integer,
  total_solved integer,
  easy_solved integer,
  medium_solved integer,
  hard_solved integer,
  last_updated timestamptz
);

create table if not exists leetcode_recent_submissions (
  id bigserial primary key,
  leetcode_stats_id bigint not null references leetcode_stats(id) on delete cascade,
  title text,
  title_slug text,
  status_display text,
  lang text,
  submission_timestamp text
);
create index if not exists idx_lc_sub_stats on leetcode_recent_submissions(leetcode_stats_id);

create table if not exists ai_insights (
  id bigserial primary key,
  user_id bigint not null unique references users(id) on delete cascade,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  next_actions text[] not null default '{}'
);

-- RLS enabled + no policies: only the service-role key (used server-side
-- only, never exposed to the browser) can bypass RLS and touch these
-- tables. All access control happens in the Next.js API route handlers.
alter table users enable row level security;
alter table roadmaps enable row level security;
alter table roadmap_tasks enable row level security;
alter table leetcode_stats enable row level security;
alter table leetcode_recent_submissions enable row level security;
alter table ai_insights enable row level security;
