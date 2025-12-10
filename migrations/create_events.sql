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
create policy "Enable read access for all users" on public.events for select using (true);
create policy "Enable insert for authenticated users" on public.events for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users" on public.events for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users" on public.events for delete using (auth.role() = 'authenticated');
