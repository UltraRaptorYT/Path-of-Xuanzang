create table public.path_of_xuanzang_station1_votes (
  id uuid primary key default gen_random_uuid(),
  session_id text not null check (char_length(session_id) between 1 and 80),
  round_id text not null check (round_id in (
    'journey-to-west',
    'real-person',
    'facing-distress',
    'fearless-monk',
    'purpose-of-india-journey'
  )),
  round_number smallint not null check (round_number between 1 and 5),
  question_zh text not null,
  question_en text not null,
  left_count smallint not null check (left_count between 0 and 6),
  right_count smallint not null check (right_count between 0 and 6),
  selected_side text not null check (selected_side in ('left', 'right')),
  selected_choice_zh text not null,
  selected_choice_en text not null,
  correct boolean,
  recorded_at timestamptz not null default now(),
  unique (session_id, round_id)
);

create index path_of_xuanzang_station1_votes_recorded_at_idx
  on public.path_of_xuanzang_station1_votes (recorded_at desc);

alter table public.path_of_xuanzang_station1_votes enable row level security;

revoke all on public.path_of_xuanzang_station1_votes from public, anon, authenticated;
grant usage on schema public to anon;
grant select, insert on public.path_of_xuanzang_station1_votes to anon;

create policy "Station 1 votes are globally readable"
  on public.path_of_xuanzang_station1_votes
  for select
  to anon
  using (true);

create policy "Anyone can submit an anonymous Station 1 vote"
  on public.path_of_xuanzang_station1_votes
  for insert
  to anon
  with check (true);
