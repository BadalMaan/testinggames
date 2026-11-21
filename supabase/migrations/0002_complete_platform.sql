-- Expanded schema for the complete Punjabi Game Arena platform.
create extension if not exists pgcrypto;

create table if not exists public.student_profiles (
 student_id uuid primary key references public.students(id) on delete cascade,
 display_name text not null,
 preferred_avatar text not null default 'spark',
 total_xp bigint not null default 0 check(total_xp>=0),
 current_level int not null default 1,
 total_games int not null default 0,
 games_completed int not null default 0,
 correct_answers bigint not null default 0,
 accuracy numeric(5,2) not null default 0,
 public_leaderboard_opt_in boolean not null default true,
 updated_at timestamptz not null default now()
);
create table if not exists public.otp_verifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete cascade,
 phone_e164 text not null,
 purpose text not null check(purpose in ('signup','recovery','phone_change')),
 provider_reference text,
 verified_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.game_history (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.students(id) on delete cascade,
 game_id text not null references public.games(id),
 session_id uuid references public.game_sessions(id) on delete set null,
 score int not null default 0,
 correct_answers int not null default 0,
 incorrect_answers int not null default 0,
 time_taken_seconds int not null default 0,
 accuracy numeric(5,2) not null default 0,
 xp_earned int not null default 0,
 played_at timestamptz not null default now()
);
create table if not exists public.leaderboards (
 id uuid primary key default gen_random_uuid(),
 scope text not null check(scope in ('global','game','season')),
 game_id text references public.games(id),
 season_id uuid,
 student_id uuid not null references public.students(id) on delete cascade,
 points bigint not null default 0,
 rank int,
 updated_at timestamptz not null default now()
);
create table if not exists public.multiplayer_rooms (
 id uuid primary key default gen_random_uuid(),
 room_code text not null unique,
 host_student_id uuid not null references public.students(id),
 game_id text not null references public.games(id),
 status text not null default 'waiting' check(status in ('waiting','active','completed','cancelled')),
 max_players int not null default 2 check(max_players between 2 and 8),
 settings jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '2 hours'
);
create table if not exists public.multiplayer_players (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.multiplayer_rooms(id) on delete cascade,
 student_id uuid not null references public.students(id) on delete cascade,
 score int not null default 0,
 is_ready boolean not null default false,
 joined_at timestamptz not null default now(),
 unique(room_id,student_id)
);
create table if not exists public.multiplayer_sessions (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.multiplayer_rooms(id) on delete cascade,
 game_id text not null references public.games(id),
 question_order uuid[] not null default '{}',
 current_question int not null default 0,
 started_at timestamptz,
 ended_at timestamptz,
 state jsonb not null default '{}'::jsonb
);
create table if not exists public.multiplayer_answers (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references public.multiplayer_sessions(id) on delete cascade,
 student_id uuid not null references public.students(id) on delete cascade,
 question_id uuid not null references public.questions(id),
 is_correct boolean not null,
 response_ms int not null default 0,
 answered_at timestamptz not null default now(),
 unique(session_id,student_id,question_id)
);
create table if not exists public.vocabulary (
 id uuid primary key default gen_random_uuid(),
 topic text not null,
 english text not null,
 gurmukhi text not null,
 roman_punjabi text not null,
 pronunciation_url text,
 image_url text,
 difficulty text not null default 'easy',
 review_status text not null default 'draft' check(review_status in ('draft','reviewed','approved','archived')),
 created_at timestamptz not null default now(),
 unique(topic,english,gurmukhi)
);
create table if not exists public.matra_words (
 id uuid primary key default gen_random_uuid(),
 matra_code text not null check(matra_code in ('mukta','kanna','sihari','bihari','aunkar','dulankar','lavan','dulavan','hora','kanaura','tippi','bindi','addak')),
 gurmukhi text not null,
 roman_punjabi text not null,
 english_meaning text not null,
 is_primary_example boolean not null default true,
 review_status text not null default 'draft' check(review_status in ('draft','reviewed','approved','archived')),
 unique(matra_code,gurmukhi)
);
create table if not exists public.question_reports (
 id uuid primary key default gen_random_uuid(),
 student_id uuid references public.students(id) on delete set null,
 question_id uuid references public.questions(id) on delete set null,
 issue text not null,
 details text,
 status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
 created_at timestamptz not null default now()
);
create table if not exists public.seasons (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 is_active boolean not null default false,
 created_at timestamptz not null default now(),
 check(ends_at>starts_at)
);
create table if not exists public.score_adjustments (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.students(id),
 admin_id uuid not null references auth.users(id),
 points_delta int not null,
 reason text not null,
 created_at timestamptz not null default now()
);
create index if not exists idx_vocab_topic_status on public.vocabulary(topic,review_status);
create index if not exists idx_matra_code_status on public.matra_words(matra_code,review_status);
create index if not exists idx_rooms_code_status on public.multiplayer_rooms(room_code,status);
create index if not exists idx_multiplayer_answers_session on public.multiplayer_answers(session_id);

do $$ declare t text; begin
 foreach t in array array['student_profiles','otp_verifications','game_history','leaderboards','multiplayer_rooms','multiplayer_players','multiplayer_sessions','multiplayer_answers','vocabulary','matra_words','question_reports','seasons','score_adjustments'] loop
  execute format('alter table public.%I enable row level security',t);
 end loop;
end $$;

-- Private profile and own history policies.
create policy "student profile owner read" on public.student_profiles for select to authenticated using(student_id=auth.uid());
create policy "student profile owner update" on public.student_profiles for update to authenticated using(student_id=auth.uid()) with check(student_id=auth.uid());
create policy "student history owner read" on public.game_history for select to authenticated using(student_id=auth.uid());
create policy "student leaderboard read" on public.leaderboards for select to authenticated using(
 exists(select 1 from public.students s where s.id=student_id and s.id=auth.uid())
 or exists(select 1 from public.student_profiles p where p.student_id=student_id and p.public_leaderboard_opt_in=true)
);
create policy "approved vocab read" on public.vocabulary for select to authenticated using(review_status='approved');
create policy "approved matra read" on public.matra_words for select to authenticated using(review_status='approved');
create policy "read active seasons" on public.seasons for select to authenticated using(is_active=true);
create policy "own multiplayer answers read" on public.multiplayer_answers for select to authenticated using(student_id=auth.uid());
create policy "student submit question report" on public.question_reports for insert to authenticated with check(student_id=auth.uid());
create policy "student read own reports" on public.question_reports for select to authenticated using(student_id=auth.uid());

-- No client-side score, XP, admin or room-state writes. Trusted Edge Functions use service role.
revoke insert,update,delete on public.student_profiles from anon,authenticated;
revoke insert,update,delete on public.game_history from anon,authenticated;
revoke insert,update,delete on public.leaderboards from anon,authenticated;
revoke insert,update,delete on public.multiplayer_rooms from anon,authenticated;
revoke insert,update,delete on public.multiplayer_players from anon,authenticated;
revoke insert,update,delete on public.multiplayer_sessions from anon,authenticated;
revoke insert,update,delete on public.multiplayer_answers from anon,authenticated;
revoke insert,update,delete on public.vocabulary from anon,authenticated;
revoke insert,update,delete on public.matra_words from anon,authenticated;
revoke insert,update,delete on public.seasons from anon,authenticated;
revoke insert,update,delete on public.score_adjustments from anon,authenticated;

alter table public.game_sessions add column if not exists question_order uuid[] not null default '{}';