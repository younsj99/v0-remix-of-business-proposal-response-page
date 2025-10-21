-- Create candidate_responses table to track all candidate interactions
create table if not exists public.candidate_responses (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  response_type text not null check (response_type in ('accepted', 'declined', 'inquiry', 'declined_no_contact')),
  response_data jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.candidate_responses enable row level security;

-- Create policies for admin access
create policy "candidate_responses_select_authenticated"
  on public.candidate_responses for select
  using (auth.role() = 'authenticated');

create policy "candidate_responses_insert_authenticated"
  on public.candidate_responses for insert
  with check (auth.role() = 'authenticated');

-- Create index on candidate_id for fast lookups
create index if not exists candidate_responses_candidate_id_idx on public.candidate_responses(candidate_id);

-- Create index on created_at for sorting
create index if not exists candidate_responses_created_at_idx on public.candidate_responses(created_at desc);
