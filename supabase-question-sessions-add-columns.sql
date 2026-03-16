alter table public.question_sessions
  add column if not exists categories jsonb,
  add column if not exists question_ids jsonb;
