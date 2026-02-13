
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
-- Create policies
create policy "Users can view deals from their organization" on public.deals 
  for select using (auth.uid() in (select id from public.users where organization_id = deals.organization_id));

create policy "Users can insert deals in their organization" on public.deals 
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update deals from their organization" on public.deals 
  for update using (auth.uid() in (select id from public.users where organization_id = deals.organization_id));

create policy "Users can delete deals from their organization" on public.deals 
  for delete using (auth.uid() in (select id from public.users where organization_id = deals.organization_id));
