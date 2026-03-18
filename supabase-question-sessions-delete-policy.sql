create policy "question_sessions_delete_own"
  on public.question_sessions
  for delete
  using (auth.uid() = user_id);
