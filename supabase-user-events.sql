-- Tabela de eventos do utilizador (calendário)
-- Executa no SQL Editor do Supabase

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  created_at timestamptz default now()
);

alter table public.user_events enable row level security;

create policy "Utilizador vê os seus eventos"
  on public.user_events for select
  using (auth.uid() = user_id);

create policy "Utilizador cria os seus eventos"
  on public.user_events for insert
  with check (auth.uid() = user_id);

create policy "Utilizador atualiza os seus eventos"
  on public.user_events for update
  using (auth.uid() = user_id);

create policy "Utilizador elimina os seus eventos"
  on public.user_events for delete
  using (auth.uid() = user_id);

-- Índice para listar eventos por utilizador e data
create index if not exists user_events_user_start
  on public.user_events (user_id, start_at);
