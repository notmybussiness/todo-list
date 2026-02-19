import { redirect } from "next/navigation";

import { LogoutForm } from "@/app/components/logout-form";
import { TodoApp } from "@/app/components/todo-app";
import type { Todo } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

function isTodoDetailsSchemaError(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false;
  }

  const reason = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return (
    reason.includes("pgrst204") ||
    reason.includes("42703") ||
    reason.includes("note") ||
    reason.includes("start_at") ||
    reason.includes("due_at")
  );
}

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data, error } = await supabase
    .from("todos")
    .select("id, text, note, start_at, due_at, completed, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error && isTodoDetailsSchemaError(error)) {
    const fallback = await supabase
      .from("todos")
      .select("id, text, completed, created_at, updated_at")
      .order("created_at", { ascending: false });

    data = (fallback.data ?? []).map((todo) => ({
      ...todo,
      note: null,
      start_at: null,
      due_at: null
    }));
    error = fallback.error;
  }

  return (
    <main className="app-shell">
      <section className="todo-app" aria-label="할 일 관리 앱">
        <header className="app-header">
          <div className="top-bar">
            <p className="eyebrow">Daily Focus</p>
            <LogoutForm />
          </div>
          <h1>TODO 리스트</h1>
          <p className="subtitle">오늘 해야 할 일을 정리하고 완료 상태를 추적하세요.</p>
        </header>

        <TodoApp
          initialTodos={(data ?? []) as Todo[]}
          initialMessage={error ? "할 일 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." : ""}
        />
      </section>
    </main>
  );
}
