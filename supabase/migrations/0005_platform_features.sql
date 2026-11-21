alter table public.game_categories add column if not exists created_at timestamptz not null default now();
alter table public.matra_words add column if not exists created_at timestamptz not null default now();
alter table public.games add column if not exists points_per_correct int not null default 10;
alter table public.games add column if not exists time_limit_seconds int not null default 60;
alter table public.games add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.student_profiles add column if not exists public_display_name text;
alter table public.student_profiles add column if not exists total_answers bigint not null default 0;
alter table public.student_profiles alter column public_leaderboard_opt_in set default false;
alter table public.questions add column if not exists question_type text not null default 'mcq';
alter table public.questions add column if not exists roman_punjabi text;
alter table public.questions add column if not exists gurmukhi text;
alter table public.questions add column if not exists image_url text;
alter table public.questions add column if not exists audio_url text;
alter table public.questions add column if not exists matra_code text;
alter table public.questions add column if not exists points int not null default 10;
alter table public.questions add column if not exists time_limit_seconds int not null default 30;
alter table public.questions add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.daily_challenges (
 id uuid primary key default gen_random_uuid(),
 challenge_date date not null unique,
 game_id text not null references public.games(id),
 title text not null,
 description text not null default '',
 question_ids uuid[] not null default '{}',
 bonus_xp int not null default 20,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.daily_challenge_completions (
 id uuid primary key default gen_random_uuid(),
 challenge_id uuid not null references public.daily_challenges(id),
 student_id uuid not null references public.students(id),
 session_id uuid references public.game_sessions(id),
 xp_awarded int not null default 0,
 completed_at timestamptz not null default now(),
 unique(challenge_id,student_id)
);
create table if not exists public.tournaments (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 description text not null default '',
 game_id text references public.games(id),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status text not null default 'scheduled' check(status in ('scheduled','active','completed','cancelled')),
 rules jsonb not null default '{}'::jsonb,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 check(ends_at>starts_at)
);
create table if not exists public.tournament_participants (
 tournament_id uuid not null references public.tournaments(id) on delete cascade,
 student_id uuid not null references public.students(id) on delete cascade,
 points bigint not null default 0,
 joined_at timestamptz not null default now(),
 primary key(tournament_id,student_id)
);
create table if not exists public.parent_consents (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.students(id) on delete cascade,
 consent_version text not null,
 consented_at timestamptz not null default now(),
 revoked_at timestamptz,
 guardian_contact_hash text
);

alter table public.daily_challenges enable row level security;
alter table public.daily_challenge_completions enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.parent_consents enable row level security;

create policy "read active daily challenge" on public.daily_challenges for select to authenticated using(is_active=true);
create policy "read own daily completion" on public.daily_challenge_completions for select to authenticated using(student_id=auth.uid());
create policy "read active tournaments" on public.tournaments for select to authenticated using(status in ('scheduled','active','completed'));
create policy "read tournament participants" on public.tournament_participants for select to authenticated using(
 student_id=auth.uid() or exists(select 1 from public.student_profiles p where p.student_id=tournament_participants.student_id and p.public_leaderboard_opt_in=true)
);
create policy "read own consent" on public.parent_consents for select to authenticated using(student_id=auth.uid());
revoke insert,update,delete on public.daily_challenges from anon,authenticated;
revoke insert,update,delete on public.daily_challenge_completions from anon,authenticated;
revoke insert,update,delete on public.tournaments from anon,authenticated;
revoke insert,update,delete on public.tournament_participants from anon,authenticated;
revoke all on public.parent_consents from anon,authenticated;

create policy "admin manage daily challenges" on public.daily_challenges for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());
create policy "admin manage tournaments" on public.tournaments for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());

insert into public.achievements(id,title,description,xp_reward) values
 ('first-steps','First steps','Complete your first game.',10),
 ('quick-learner','Quick learner','Answer five questions correctly.',20),
 ('perfect-round','Perfect round','Finish a game with 100% accuracy.',25),
 ('word-explorer','Word explorer','Play five different games.',30),
 ('punjabi-star','Punjabi star','Earn 1,500 XP.',50),
 ('game-champion','Game champion','Play 25 games.',100)
on conflict(id) do nothing;

-- Storage buckets for public educational assets and private student uploads.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('game-assets','game-assets',true,10485760,array['image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/ogg'])
on conflict(id) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('student-avatars','student-avatars',false,2097152,array['image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;
create policy "read public game assets" on storage.objects for select to authenticated using(bucket_id='game-assets');
create policy "admins upload game assets" on storage.objects for insert to authenticated with check(bucket_id='game-assets' and public.is_gpc_admin());
create policy "admins update game assets" on storage.objects for update to authenticated using(bucket_id='game-assets' and public.is_gpc_admin()) with check(bucket_id='game-assets' and public.is_gpc_admin());
create policy "students manage own avatar" on storage.objects for all to authenticated using(bucket_id='student-avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='student-avatars' and (storage.foldername(name))[1]=auth.uid()::text);


create or replace function public.get_public_leaderboard(p_limit int default 10)
returns table(student_id uuid, display_name text, total_xp bigint, current_level int, player_rank bigint)
language sql stable security definer set search_path=public as $$
 with ranked as (
  select p.student_id,coalesce(nullif(p.public_display_name,''),'Punjabi Player') as display_name,p.total_xp,p.current_level,
   row_number() over(order by p.total_xp desc,p.updated_at asc) as rn,
   p.public_leaderboard_opt_in
  from public.student_profiles p
  where p.public_leaderboard_opt_in=true or p.student_id=auth.uid()
 )
 select r.student_id,r.display_name,r.total_xp,r.current_level,r.rn
 from ranked r
 where (r.public_leaderboard_opt_in=true or r.student_id=auth.uid())
 and (r.rn<=greatest(1,least(p_limit,100)) or r.student_id=auth.uid())
 order by r.rn
$$;
grant execute on function public.get_public_leaderboard(int) to authenticated;

create or replace function public.get_game_leaderboard(p_game_id text,p_limit int default 10)
returns table(student_id uuid,display_name text,points bigint,player_rank bigint)
language sql stable security definer set search_path=public as $$
 with ranked as (
  select l.student_id,coalesce(nullif(p.public_display_name,''),'Punjabi Player') as display_name,l.points,
   row_number() over(order by l.points desc,l.updated_at asc) as rn,p.public_leaderboard_opt_in
  from public.leaderboards l join public.student_profiles p on p.student_id=l.student_id
  where l.scope='game' and l.game_id=p_game_id and (p.public_leaderboard_opt_in=true or p.student_id=auth.uid())
 )
 select r.student_id,r.display_name,r.points,r.rn from ranked r
 where (r.public_leaderboard_opt_in=true or r.student_id=auth.uid())
 and (r.rn<=greatest(1,least(p_limit,100)) or r.student_id=auth.uid())
 order by r.rn
$$;
grant execute on function public.get_game_leaderboard(text,int) to authenticated;
