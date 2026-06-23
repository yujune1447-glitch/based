-- Users / profiles (synced from next-auth)
create table if not exists users (
  id          text primary key,
  email       text unique not null,
  name        text,
  avatar_url  text,
  bio         text,
  prayer_request  text,
  praise_report   text,
  created_at  timestamptz default now()
);

-- Timer sessions
create table if not exists timer_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          text references users(id) on delete cascade,
  planned_minutes  int not null,
  actual_minutes   int not null default 0,
  completed        boolean not null default false,
  created_at       timestamptz default now()
);

create index if not exists timer_sessions_user_id_idx on timer_sessions(user_id);
create index if not exists timer_sessions_created_at_idx on timer_sessions(created_at);

-- Journal entries (one row = one AI prompt + user response pair)
create table if not exists journal_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           text references users(id) on delete cascade,
  timer_session_id  uuid references timer_sessions(id) on delete set null,
  prompt_used       text,
  response_text     text,
  created_at        timestamptz default now()
);

create index if not exists journal_entries_user_id_idx on journal_entries(user_id);
create index if not exists journal_entries_created_at_idx on journal_entries(created_at);

-- Friendships
create table if not exists friendships (
  id          uuid primary key default gen_random_uuid(),
  user_id     text references users(id) on delete cascade,
  friend_id   text references users(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at  timestamptz default now(),
  unique(user_id, friend_id)
);

create index if not exists friendships_user_id_idx on friendships(user_id);
create index if not exists friendships_friend_id_idx on friendships(friend_id);

-- Prayed for events
create table if not exists prayed_for (
  id              uuid primary key default gen_random_uuid(),
  from_user_id    text references users(id) on delete cascade,
  to_user_id      text references users(id) on delete cascade,
  created_at      timestamptz default now()
);

create index if not exists prayed_for_to_user_idx on prayed_for(to_user_id);

-- Row Level Security (enable after setting up Supabase Auth or service key usage)
alter table users            enable row level security;
alter table timer_sessions   enable row level security;
alter table journal_entries  enable row level security;
alter table friendships      enable row level security;
alter table prayed_for       enable row level security;

-- Policies: service role bypasses all RLS automatically.
-- Add user-facing policies here when using Supabase Auth client-side.
