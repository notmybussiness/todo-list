alter table public.todos
  add column if not exists note text,
  add column if not exists start_at timestamptz,
  add column if not exists due_at timestamptz;

alter table public.todos
  drop constraint if exists todos_period_check;

alter table public.todos
  add constraint todos_period_check check (
    (start_at is null and due_at is null)
    or (
      start_at is not null
      and due_at is not null
      and start_at <= due_at
    )
  );

create table if not exists public.todo_attachments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references public.todos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text,
  file_size bigint not null check (file_size >= 0),
  created_at timestamptz not null default now()
);

create index if not exists todo_attachments_todo_id_idx
  on public.todo_attachments (todo_id);

create index if not exists todo_attachments_user_id_idx
  on public.todo_attachments (user_id, created_at desc);

alter table public.todo_attachments enable row level security;

drop policy if exists "todo_attachment_select_own" on public.todo_attachments;
create policy "todo_attachment_select_own"
on public.todo_attachments
for select
using (auth.uid() = user_id);

drop policy if exists "todo_attachment_insert_own" on public.todo_attachments;
create policy "todo_attachment_insert_own"
on public.todo_attachments
for insert
with check (auth.uid() = user_id);

drop policy if exists "todo_attachment_update_own" on public.todo_attachments;
create policy "todo_attachment_update_own"
on public.todo_attachments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "todo_attachment_delete_own" on public.todo_attachments;
create policy "todo_attachment_delete_own"
on public.todo_attachments
for delete
using (auth.uid() = user_id);
