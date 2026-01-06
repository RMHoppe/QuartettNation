-- Create deck_access table
create table if not exists public.deck_access (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    deck_id uuid references public.decks(id) on delete cascade not null,
    access_level text check (access_level in ('read', 'write', 'admin')) default 'read',
    last_accessed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, deck_id)
);

-- Enable RLS
alter table public.decks enable row level security;
alter table public.deck_access enable row level security;

-- Decks Policies
drop policy if exists "Public decks are viewable by everyone" on public.decks;
create policy "Public decks are viewable by everyone"
    on public.decks for select
    using (true);

drop policy if exists "Users can insert their own decks" on public.decks;
create policy "Users can insert their own decks"
    on public.decks for insert
    with check (auth.uid() = created_by::uuid);

drop policy if exists "Users can update their own decks" on public.decks;
create policy "Users can update their own decks"
    on public.decks for update
    using (auth.uid() = created_by::uuid);

drop policy if exists "Users can delete their own decks" on public.decks;
create policy "Users can delete their own decks"
    on public.decks for delete
    using (auth.uid() = created_by::uuid);

-- Deck Access Policies
drop policy if exists "Users can view their own deck access" on public.deck_access;
create policy "Users can view their own deck access"
    on public.deck_access for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert deck access (sharing logic to be handled by app/functions or open for now)" on public.deck_access;
create policy "Users can insert deck access (sharing logic to be handled by app/functions or open for now)"
    on public.deck_access for insert
    with check (auth.uid() = user_id);

-- Reload schema
NOTIFY pgrst, 'reload config';
