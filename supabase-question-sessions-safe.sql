-- Safe re-create for question_sessions table policies and columns
alter table public.question_sessions
  add column if not exists categories jsonb,
  add column if not exists question_ids jsonb;

alter table public.question_sessions enable row level security;

drop policy if exists question_sessions_select_own on public.question_sessions;
drop policy if exists question_sessions_insert_own on public.question_sessions;
drop policy if exists question_sessions_update_own on public.question_sessions;

create policy "question_sessions_select_own"
  on public.question_sessions
  for select
  using (auth.uid() = user_id);

create policy "question_sessions_insert_own"
  on public.question_sessions
  for insert
  with check (auth.uid() = user_id);

create policy "question_sessions_update_own"
  on public.question_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
