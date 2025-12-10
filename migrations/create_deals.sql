
create table if not exists public.deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  value numeric default 0,
  stage text not null check (stage in ('lead', 'contact', 'visit', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  client_id uuid references public.clients(id),
  agent_id uuid references public.agents(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.deals enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.deals for select using (true);
create policy "Enable insert for authenticated users" on public.deals for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users" on public.deals for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users" on public.deals for delete using (auth.role() = 'authenticated');
