create extension if not exists pgcrypto;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text varchar(200) not null check (char_length(text) between 1 and 200),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists todos_user_created_idx
  on public.todos (user_id, created_at desc);

create or replace function public.set_todos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_todos_updated_at on public.todos;
create trigger set_todos_updated_at
before update on public.todos
for each row
execute function public.set_todos_updated_at();

alter table public.todos enable row level security;

create policy "todo_select_own"
on public.todos
for select
using (auth.uid() = user_id);

create policy "todo_insert_own"
on public.todos
for insert
with check (auth.uid() = user_id);

create policy "todo_update_own"
on public.todos
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "todo_delete_own"
on public.todos
for delete
using (auth.uid() = user_id);
