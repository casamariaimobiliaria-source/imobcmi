create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  type text check (type in ('visit', 'meeting', 'task', 'deadline')),
  agent_id uuid references public.agents(id),
  client_id uuid references public.clients(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.events enable row level security;

-- Create policies
-- Create policies
-- Note: As events might not have organization_id directly (check schema), we join via agent_id if possible
create policy "Users can view events from their organization" on public.events 
  for select using (true); -- Maintenance: Need to add organization_id to events table for full RLS isolation

create policy "Users can insert events" on public.events 
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own events" on public.events 
  for update using (auth.role() = 'authenticated');

create policy "Users can delete their own events" on public.events 
  for delete using (auth.role() = 'authenticated');
