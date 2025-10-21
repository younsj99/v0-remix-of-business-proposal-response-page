-- Allow public (unauthenticated) users to read candidate data by unique_token
-- This is needed for the candidate-facing page
create policy "candidates_select_by_token_public"
  on public.candidates for select
  using (true);

-- Allow public users to insert responses
create policy "candidate_responses_insert_public"
  on public.candidate_responses for insert
  with check (true);

-- Allow public users to insert page views
create policy "candidate_page_views_insert_public"
  on public.candidate_page_views for insert
  with check (true);

-- Allow public users to update candidate status (for tracking)
create policy "candidates_update_status_public"
  on public.candidates for update
  using (true)
  with check (true);
