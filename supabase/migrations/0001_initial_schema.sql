-- Punjabi Game Arena: initial relational schema.
-- Run in Supabase SQL Editor. Never expose service_role credentials in the browser.
create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  student_code text unique not null default ('GPC-' || upper(substr(encode(gen_random_bytes(5),'hex'),1,8))),
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_key text not null default 'spark',
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_categories (
  id text primary key,
  title text not null,
  description text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.games (
  id text primary key,
  category_id text references public.game_categories(id),
  title text not null,
  description text not null default '',
  difficulty text not null default 'beginner' check (difficulty in ('easy','medium','hard','expert','beginner','intermediate')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  game_id text not null references public.games(id) on delete cascade,
  prompt text not null,
  prompt_language text not null default 'en',
  answer text not null,
  explanation text,
  difficulty text not null default 'easy',
  content_status text not null default 'draft' check (content_status in ('draft','approved','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  sort_order int not null default 0
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  game_id text not null references public.games(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'started' check (status in ('started','completed','abandoned')),
  unique (id, student_id)
);

create table if not exists public.student_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.game_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  game_id text not null references public.games(id),
  score int not null default 0 check (score >= 0),
  correct_answers int not null default 0 check (correct_answers >= 0),
  incorrect_answers int not null default 0 check (incorrect_answers >= 0),
  accuracy numeric(5,2) not null default 0 check (accuracy between 0 and 100),
  time_taken_seconds int not null default 0 check (time_taken_seconds >= 0),
  xp_earned int not null default 0 check (xp_earned >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid references public.game_sessions(id) on delete set null,
  points int not null,
  reason text not null,
  created_at timestamptz not null default now(),
  unique(session_id, reason)
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  xp_reward int not null default 0
);

create table if not exists public.student_achievements (
  student_id uuid not null references public.students(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key(student_id, achievement_id)
);

create table if not exists public.learning_progress (
  student_id uuid not null references public.students(id) on delete cascade,
  game_id text not null references public.games(id) on delete cascade,
  attempts int not null default 0,
  best_accuracy numeric(5,2) not null default 0,
  last_played_at timestamptz,
  primary key(student_id, game_id)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_student_created on public.game_sessions(student_id, started_at desc);
create index if not exists idx_scores_game_created on public.student_scores(game_id, created_at desc);
create index if not exists idx_scores_student_created on public.student_scores(student_id, created_at desc);
create index if not exists idx_questions_game_status on public.questions(game_id, content_status);

alter table public.students enable row level security;
alter table public.game_categories enable row level security;
alter table public.games enable row level security;
alter table public.questions enable row level security;
alter table public.answer_options enable row level security;
alter table public.game_sessions enable row level security;
alter table public.student_scores enable row level security;
alter table public.point_transactions enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;
alter table public.learning_progress enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

-- A user can read/update only their own student profile.
create policy "student reads own profile" on public.students for select to authenticated using (id = auth.uid());
create policy "student updates own profile" on public.students for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.students from anon, authenticated;
grant update(display_name) on public.students to authenticated;

-- Published learning content is readable to signed-in students.
create policy "read active categories" on public.game_categories for select to authenticated using (is_active = true);
create policy "read active games" on public.games for select to authenticated using (is_active = true);
create policy "read approved questions" on public.questions for select to authenticated using (content_status = 'approved');
create policy "read options for approved questions" on public.answer_options for select to authenticated using (
  exists(select 1 from public.questions q where q.id = question_id and q.content_status = 'approved')
);

-- Students can read their own session history. Session creation/completion and score
-- insertion are intentionally server-only (service role / trusted RPC).
create policy "read own sessions" on public.game_sessions for select to authenticated using (student_id = auth.uid());
create policy "read own scores" on public.student_scores for select to authenticated using (student_id = auth.uid());
create policy "read own point ledger" on public.point_transactions for select to authenticated using (student_id = auth.uid());
create policy "read achievements" on public.achievements for select to authenticated using (true);
create policy "read own unlocked achievements" on public.student_achievements for select to authenticated using (student_id = auth.uid());
create policy "read own learning progress" on public.learning_progress for select to authenticated using (student_id = auth.uid());

-- Admin roster is private. Admin writes must be performed by trusted server functions.
create policy "user reads own admin role" on public.admin_users for select to authenticated using (user_id = auth.uid());
create policy "audit logs admins only" on public.audit_logs for select to authenticated using (
  exists(select 1 from public.admin_users a where a.user_id = auth.uid() and a.role in ('owner','admin'))
);

-- Do not grant direct browser writes to score/points/session tables.
revoke insert, update, delete on public.student_scores from anon, authenticated;
revoke insert, update, delete on public.point_transactions from anon, authenticated;
revoke insert, update, delete on public.game_sessions from anon, authenticated;
revoke insert, update, delete on public.admin_users from anon, authenticated;
revoke insert, update, delete on public.audit_logs from anon, authenticated;

-- Restrict profile updates to safe profile fields only.
revoke update on public.students from authenticated;
grant update(display_name, avatar_key) on public.students to authenticated;

-- Correct answers are never directly selectable by student clients.
revoke select on public.questions from anon,authenticated;
grant select(id,game_id,prompt,prompt_language,difficulty,content_status) on public.questions to authenticated;
