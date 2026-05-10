-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- App Users table
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Children Profiles table
create table if not exists children_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  name text not null,
  age integer not null,
  reading_level text not null check (reading_level in ('prelector', 'inicial', 'en_desarrollo', 'avanzado')),
  interests text[],
  objective text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stories table
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  child_id uuid references children_profiles(id) on delete cascade,
  title text not null,
  theme text,
  age integer,
  reading_level text,
  objective text,
  estimated_minutes integer,
  raw_ai_response jsonb,
  created_at timestamptz default now()
);

-- Story Blocks table
create table if not exists story_blocks (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  order_index integer not null,
  text text not null,
  reader text not null check (reader in ('adult', 'child', 'shared')),
  child_words text[],
  syllable_support jsonb,
  hint text,
  created_at timestamptz default now()
);

-- Reading Sessions table
create table if not exists reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  child_id uuid references children_profiles(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  duration_seconds integer,
  words_attempted integer default 0,
  words_read_ok integer default 0,
  words_with_help integer default 0,
  words_skipped integer default 0,
  summary jsonb
);

-- Word Attempts table
create table if not exists word_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references reading_sessions(id) on delete cascade,
  word text not null,
  status text not null check (status in ('ok', 'help', 'skipped')),
  hint_used boolean default false,
  created_at timestamptz default now()
);

-- App Settings table
create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Row Level Security
alter table app_users enable row level security;
alter table children_profiles enable row level security;
alter table stories enable row level security;
alter table story_blocks enable row level security;
alter table reading_sessions enable row level security;
alter table word_attempts enable row level security;

-- Policies (using service role from serverless, no auth policies needed for client-side)
-- The app uses custom auth (bcryptjs), not Supabase auth
-- Access is controlled via serverless API endpoints

-- Create indexes for performance
create index if not exists idx_children_profiles_user_id on children_profiles(user_id);
create index if not exists idx_stories_user_id on stories(user_id);
create index if not exists idx_stories_child_id on stories(child_id);
create index if not exists idx_story_blocks_story_id on story_blocks(story_id);
create index if not exists idx_reading_sessions_user_id on reading_sessions(user_id);
create index if not exists idx_reading_sessions_child_id on reading_sessions(child_id);
create index if not exists idx_word_attempts_session_id on word_attempts(session_id);
