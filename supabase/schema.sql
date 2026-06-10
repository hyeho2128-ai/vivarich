create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "Anyone can read VIVA RICH data"
on public.app_state
for select
to anon, authenticated
using (id = 'main');

create policy "Anyone can create VIVA RICH data"
on public.app_state
for insert
to anon, authenticated
with check (id = 'main');

create policy "Anyone can update VIVA RICH data"
on public.app_state
for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

alter publication supabase_realtime add table public.app_state;
