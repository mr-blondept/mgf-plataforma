create table if not exists public.user_calculator_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorite_ids text[] not null default '{}',
  favorite_order text[] not null default '{}',
  calculator_order text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_calculator_preferences enable row level security;

create policy "user_calculator_preferences_select_own"
  on public.user_calculator_preferences
  for select
  using (auth.uid() = user_id);

create policy "user_calculator_preferences_insert_own"
  on public.user_calculator_preferences
  for insert
  with check (auth.uid() = user_id);

create policy "user_calculator_preferences_update_own"
  on public.user_calculator_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
