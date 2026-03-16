create table if not exists public.question_session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.question_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  option_id uuid not null references public.question_options(id) on delete cascade,
  is_correct boolean not null,
  answered_at timestamptz default now(),
  unique (session_id, question_id)
);

alter table public.question_session_answers enable row level security;

create policy "question_session_answers_select_own"
  on public.question_session_answers
  for select
  using (auth.uid() = user_id);

create policy "question_session_answers_insert_own"
  on public.question_session_answers
  for insert
  with check (auth.uid() = user_id);

create policy "question_session_answers_update_own"
  on public.question_session_answers
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
