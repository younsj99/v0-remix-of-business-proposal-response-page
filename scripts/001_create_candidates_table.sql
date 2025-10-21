-- Create candidates table to store candidate information and track their status
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  track text not null,
  experience text not null,
  unique_token text unique not null,
  status text not null default 'created' check (status in ('created', 'sent', 'viewed', 'accepted', 'declined', 'inquiry')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.candidates enable row level security;

-- Create policies for admin access (authenticated users can do everything)
create policy "candidates_select_authenticated"
  on public.candidates for select
  using (auth.role() = 'authenticated');

create policy "candidates_insert_authenticated"
  on public.candidates for insert
  with check (auth.role() = 'authenticated');

create policy "candidates_update_authenticated"
  on public.candidates for update
  using (auth.role() = 'authenticated');

create policy "candidates_delete_authenticated"
  on public.candidates for delete
  using (auth.role() = 'authenticated');

-- Create index on unique_token for fast lookups
create index if not exists candidates_unique_token_idx on public.candidates(unique_token);

-- Create index on status for filtering
create index if not exists candidates_status_idx on public.candidates(status);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger candidates_updated_at
  before update on public.candidates
  for each row
  execute function public.handle_updated_at();
