-- Defensive constraints for profiles
alter table public.profiles
  add constraint profiles_full_name_chk
  check (length(btrim(full_name)) >= 2);

alter table public.profiles
  add constraint profiles_medical_order_number_chk
  check (
    medical_order_number ~ '^[0-9]+$'
    and (medical_order_number::int between 1000 and 199999)
  );

alter table public.profiles
  add constraint profiles_graduation_year_chk
  check (
    graduation_year between 1950 and extract(year from now())::int
  );
