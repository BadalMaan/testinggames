-- Create student rows automatically after Supabase Auth signup.
create unique index if not exists idx_leaderboard_global_student on public.leaderboards(student_id) where scope='global';
create unique index if not exists idx_leaderboard_game_student on public.leaderboards(student_id,game_id) where scope='game';

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.students(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name','New Student'))
 on conflict(id) do nothing;
 insert into public.student_profiles(student_id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name','New Student'))
 on conflict(student_id) do nothing;
 return new;
end $$;
drop trigger if exists on_auth_user_created_gpc on auth.users;
create trigger on_auth_user_created_gpc after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Security-definer admin check; only existing admin_users membership qualifies.
create or replace function public.is_gpc_admin()
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.admin_users where user_id=auth.uid() and role in ('owner','admin','teacher'))
$$;

-- A single transaction awards validated points and writes score history.
-- Edge Function must call this RPC only after validating answer submissions against DB.
create or replace function public.finalize_game_session(
 p_session_id uuid,
 p_student_id uuid,
 p_game_id text,
 p_correct int,
 p_incorrect int,
 p_time_seconds int,
 p_xp int
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare total int; acc numeric(5,2); score_id uuid; lifetime_xp bigint; begin
 if auth.uid() is null or auth.uid()<>p_student_id then raise exception 'Not authorized'; end if;
 if p_correct<0 or p_incorrect<0 or p_time_seconds<0 or p_xp<0 then raise exception 'Invalid score'; end if;
 if p_xp > (p_correct*15+25) then raise exception 'XP exceeds allowed scoring'; end if;
 select count(*) into total from public.questions where game_id=p_game_id and content_status='approved';
 if total=0 then raise exception 'Game has no approved questions'; end if;
 if p_correct+p_incorrect>total then raise exception 'Answer count exceeds game question count'; end if;
 acc:=case when p_correct+p_incorrect=0 then 0 else round(p_correct::numeric/(p_correct+p_incorrect)*100,2) end;
 update public.game_sessions set status='completed',completed_at=now()
 where id=p_session_id and student_id=p_student_id and game_id=p_game_id and status='started';
 if not found then
   if exists(select 1 from public.student_scores where session_id=p_session_id) then
     return jsonb_build_object('already_completed',true);
   end if;
   raise exception 'Session not found or already closed';
 end if;
 insert into public.student_scores(session_id,student_id,game_id,score,correct_answers,incorrect_answers,accuracy,time_taken_seconds,xp_earned)
 values(p_session_id,p_student_id,p_game_id,p_correct*10,p_correct,p_incorrect,acc,p_time_seconds,p_xp)
 returning id into score_id;
 insert into public.game_history(student_id,game_id,session_id,score,correct_answers,incorrect_answers,time_taken_seconds,accuracy,xp_earned)
 values(p_student_id,p_game_id,p_session_id,p_correct*10,p_correct,p_incorrect,p_time_seconds,acc,p_xp);
 insert into public.learning_progress(student_id,game_id,attempts,best_accuracy,last_played_at)
 values(p_student_id,p_game_id,1,acc,now())
 on conflict(student_id,game_id) do update set attempts=public.learning_progress.attempts+1,best_accuracy=greatest(public.learning_progress.best_accuracy,excluded.best_accuracy),last_played_at=now();
 insert into public.point_transactions(student_id,session_id,points,reason) values(p_student_id,p_session_id,p_xp,'game_completion');
 update public.student_profiles set total_xp=total_xp+p_xp,total_games=total_games+1,games_completed=games_completed+1,
 correct_answers=correct_answers+p_correct,total_answers=total_answers+p_correct+p_incorrect,accuracy=case when total_answers+p_correct+p_incorrect=0 then 0 else round(((accuracy*total_answers)+(acc*(p_correct+p_incorrect)))/greatest(total_answers+p_correct+p_incorrect,1),2) end,
 current_level=case when total_xp+p_xp>=6000 then 7 when total_xp+p_xp>=4000 then 6 when total_xp+p_xp>=2500 then 5 when total_xp+p_xp>=1500 then 4 when total_xp+p_xp>=800 then 3 when total_xp+p_xp>=300 then 2 else 1 end,
 updated_at=now() where student_id=p_student_id;
 perform public.award_game_achievements(p_student_id,p_session_id,acc);
 select total_xp into lifetime_xp from public.student_profiles where student_id=p_student_id;
 insert into public.leaderboards(scope,student_id,points,updated_at) values('global',p_student_id,lifetime_xp,now())
 on conflict(student_id) where scope='global' do update set points=excluded.points,updated_at=now();
 insert into public.leaderboards(scope,game_id,student_id,points,updated_at) values('game',p_game_id,p_student_id,p_xp,now())
 on conflict(student_id,game_id) where scope='game' do update set points=public.leaderboards.points+excluded.points,updated_at=now();
 return jsonb_build_object('score_id',score_id,'xp_earned',p_xp,'accuracy',acc);
end $$;
revoke all on function public.finalize_game_session(uuid,uuid,text,int,int,int,int) from public,anon;
grant execute on function public.finalize_game_session(uuid,uuid,text,int,int,int,int) to authenticated;

-- Starter categories. Questions are seeded as drafts until teacher review.
insert into public.game_categories(id,title,description,sort_order) values
 ('varnmala','Punjabi Varnmala','Learn Gurmukhi letters and first sounds.',1),
 ('matra','Laga Matra Master','Explore vowel signs and matra patterns.',2),
 ('reading','Punjabi Reading','Build confidence reading words and sentences.',3),
 ('word-builder','Punjabi Word Builder','Arrange letters and matras into words.',4),
 ('english-punjabi','English to Punjabi','Translate everyday English into Roman Punjabi.',5),
 ('punjabi-english','Punjabi to English','Understand Gurmukhi words and sentences.',6),
 ('tenses','Tenses Challenge','Practise present, past and future forms.',7),
 ('vocabulary','Punjabi Vocabulary','Grow everyday topic-based vocabulary.',8),
 ('picture-matching','Picture Matching','Connect pictures with Punjabi words.',9),
 ('sentence-master','Sentence Master','Build grammatically correct sentences.',10),
 ('conversation','Daily Conversation','Practise useful everyday dialogues.',11),
 ('listening','Listening Challenge','Listen to Punjabi and identify meaning.',12),
 ('speaking','Punjabi Speaking','Speak Punjabi with teacher-reviewed feedback.',13),
 ('grammar','Grammar Challenge','Practise core Punjabi grammar.',14),
 ('multiplayer','Multiplayer Games','Compete in friendly Punjabi challenges.',15)
on conflict(id) do nothing;


create policy "admin read all students" on public.students for select to authenticated using(public.is_gpc_admin());
create policy "admin read all profiles" on public.student_profiles for select to authenticated using(public.is_gpc_admin());
create policy "admin manage categories" on public.game_categories for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());
create policy "admin manage games" on public.games for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());
create policy "admin manage questions" on public.questions for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());
create policy "admin manage answer options" on public.answer_options for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());
create policy "admin manage vocabulary" on public.vocabulary for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());
create policy "admin manage matra words" on public.matra_words for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());
create policy "admin manage reports" on public.question_reports for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());
create policy "admin manage seasons" on public.seasons for all to authenticated using(public.is_gpc_admin()) with check(public.is_gpc_admin());

-- Keep the display name in the private profile synchronized without exposing XP columns.
create or replace function public.sync_student_display_name()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 update public.student_profiles set display_name=new.display_name,updated_at=now() where student_id=new.id;
 return new;
end $$;
drop trigger if exists sync_gpc_student_display_name on public.students;
create trigger sync_gpc_student_display_name after update of display_name on public.students
for each row execute procedure public.sync_student_display_name();

create or replace function public.is_room_member(p_room_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.multiplayer_players p where p.room_id=p_room_id and p.student_id=auth.uid())
$$;
create policy "room participants read room" on public.multiplayer_rooms for select to authenticated using(host_student_id=auth.uid() or public.is_room_member(id));
create policy "room participants read players" on public.multiplayer_players for select to authenticated using(student_id=auth.uid() or public.is_room_member(room_id));
create policy "room participant read session" on public.multiplayer_sessions for select to authenticated using(public.is_room_member(room_id));

-- Supabase Realtime broadcasts state changes to room participants.
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='multiplayer_rooms') then
  alter publication supabase_realtime add table public.multiplayer_rooms;
 end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='multiplayer_players') then
  alter publication supabase_realtime add table public.multiplayer_players;
 end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='multiplayer_sessions') then
  alter publication supabase_realtime add table public.multiplayer_sessions;
 end if;
end $$;


create or replace function public.award_game_achievements(p_student_id uuid,p_session_id uuid,p_accuracy numeric)
returns void language plpgsql security definer set search_path=public as $$
declare bonus int:=0; begin
 with eligible as (
  select a.id from public.achievements a
  join public.student_profiles p on p.student_id=p_student_id
  where
   (a.id='first-steps' and p.total_games>=1)
   or (a.id='quick-learner' and p.correct_answers>=5)
   or (a.id='perfect-round' and p_accuracy=100)
   or (a.id='word-explorer' and (select count(distinct game_id) from public.game_history where student_id=p_student_id)>=5)
   or (a.id='punjabi-star' and p.total_xp>=1500)
   or (a.id='game-champion' and p.total_games>=25)
 ), newly as (
  insert into public.student_achievements(student_id,achievement_id)
  select p_student_id,id from eligible on conflict do nothing returning achievement_id
 )
 select coalesce(sum(a.xp_reward),0) into bonus from newly n join public.achievements a on a.id=n.achievement_id;
 if bonus>0 then
  insert into public.point_transactions(student_id,session_id,points,reason)
  values(p_student_id,p_session_id,bonus,'achievement_unlocks') on conflict do nothing;
  update public.student_profiles set total_xp=total_xp+bonus,
   current_level=case when total_xp+bonus>=6000 then 7 when total_xp+bonus>=4000 then 6 when total_xp+bonus>=2500 then 5 when total_xp+bonus>=1500 then 4 when total_xp+bonus>=800 then 3 when total_xp+bonus>=300 then 2 else 1 end
  where student_id=p_student_id;
 end if;
end $$;




