create table if not exists public.game_session_answers (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references public.game_sessions(id) on delete cascade,
 student_id uuid not null references public.students(id) on delete cascade,
 question_id uuid not null references public.questions(id),
 option_id uuid references public.answer_options(id),
 is_correct boolean not null,
 response_ms int not null default 0 check(response_ms between 0 and 60000),
 answered_at timestamptz not null default now(),
 unique(session_id,question_id)
);
alter table public.game_session_answers enable row level security;
create policy "read own game answers" on public.game_session_answers for select to authenticated using(student_id=auth.uid());
revoke insert,update,delete on public.game_session_answers from anon,authenticated;
