alter table public.todos
  add column if not exists reminder_sent_at timestamptz;

create index if not exists todos_due_reminder_idx
  on public.todos (due_at)
  where completed = false
    and reminder_sent_at is null
    and due_at is not null;
