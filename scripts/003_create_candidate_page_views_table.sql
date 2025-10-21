-- Create candidate_page_views table to track when candidates view their pages
create table if not exists public.candidate_page_views (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  viewed_at timestamptz default now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
alter table public.candidate_page_views enable row level security;

-- Create policies for admin access
create policy "candidate_page_views_select_authenticated"
  on public.candidate_page_views for select
  using (auth.role() = 'authenticated');

create policy "candidate_page_views_insert_authenticated"
  on public.candidate_page_views for insert
  with check (auth.role() = 'authenticated');

-- Create index on candidate_id for fast lookups
create index if not exists candidate_page_views_candidate_id_idx on public.candidate_page_views(candidate_id);

-- Create index on viewed_at for sorting
create index if not exists candidate_page_views_viewed_at_idx on public.candidate_page_views(viewed_at desc);
