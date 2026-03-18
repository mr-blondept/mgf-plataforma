create table if not exists public.question_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  categories jsonb,
  question_ids jsonb,
  mode text not null check (mode in ('treino', 'simulado')),
  status text not null check (status in ('active', 'paused', 'completed')),
  duration_sec int,
  time_left_sec int,
  current_index int default 0,
  total_questions int,
  answers jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.question_sessions enable row level security;

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

create policy "question_sessions_delete_own"
  on public.question_sessions
  for delete
  using (auth.uid() = user_id);
