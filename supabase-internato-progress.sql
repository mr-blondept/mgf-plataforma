create table if not exists public.user_internato_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  checked_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, item_id)
);

create index if not exists user_internato_progress_user_idx
  on public.user_internato_progress (user_id);

alter table public.user_internato_progress enable row level security;

create policy "user_internato_progress_select_own"
  on public.user_internato_progress
  for select
  using (auth.uid() = user_id);

create policy "user_internato_progress_insert_own"
  on public.user_internato_progress
  for insert
  with check (auth.uid() = user_id);

create policy "user_internato_progress_delete_own"
  on public.user_internato_progress
  for delete
  using (auth.uid() = user_id);
