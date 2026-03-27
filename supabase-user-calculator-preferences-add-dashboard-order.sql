alter table public.user_calculator_preferences
  add column if not exists dashboard_feature_order text[] not null default '{}';
