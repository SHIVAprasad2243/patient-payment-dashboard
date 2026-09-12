create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  age integer,
  gender text,
  phone text,
  diagnosis text,
  last_visit date,
  operation_type text default 'A',
  reg_no bigint,
  bill_no bigint,
  date_of_admission date,
  created_at timestamptz not null default now()
);

alter table public.patients
  add column if not exists operation_type text default 'A';

alter table public.patients
  add column if not exists reg_no bigint;

alter table public.patients
  add column if not exists bill_no bigint;

alter table public.patients
  add column if not exists date_of_admission date;

alter table public.patients enable row level security;

create policy "Owners can read their patients"
on public.patients
for select
to authenticated
using (auth.uid() = id);

create policy "Owners can add their patients"
on public.patients
for insert
to authenticated
with check (auth.uid() = id);

create policy "Owners can update their patients"
on public.patients
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Owners can delete their patients"
on public.patients
for delete
to authenticated
using (auth.uid() = id);
