"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateCreateTodoInput, validateUpdateTodoInput } from "@/lib/todos/validation";
import type { ActionResult } from "@/lib/types";
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

function parseId(rawId: FormDataEntryValue | null): string | null {
  if (typeof rawId !== "string") {
    return null;
  }
  const id = rawId.trim();
  return id.length > 0 ? id : null;
}

function parseText(rawText: FormDataEntryValue | null): string {
  return typeof rawText === "string" ? rawText : "";
}

async function getAuthContext() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function createTodo(formData: FormData): Promise<ActionResult> {
  const validation = validateCreateTodoInput({
    text: parseText(formData.get("text")),
    note: parseText(formData.get("note")),
    startAt: parseText(formData.get("startAt")),
    dueAt: parseText(formData.get("dueAt"))
  });
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const { supabase, user } = await getAuthContext();
  const { text, note, startAt, dueAt } = validation.data;
  let { error } = await supabase.from("todos").insert({
    user_id: user.id,
    text,
    note,
    start_at: startAt,
    due_at: dueAt,
    completed: false
  });

  if (error && isTodoDetailsSchemaError(error)) {
    const fallback = await supabase.from("todos").insert({
      user_id: user.id,
      text,
      completed: false
    });
    error = fallback.error;
  }

  if (error) {
    return { ok: false, message: "할 일을 저장하지 못했습니다. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/");
  return { ok: true, message: "" };
}

export async function updateTodo(formData: FormData): Promise<ActionResult> {
  const id = parseId(formData.get("id"));
  const validation = validateUpdateTodoInput({
    text: parseText(formData.get("text")),
    note: parseText(formData.get("note")),
    startAt: parseText(formData.get("startAt")),
    dueAt: parseText(formData.get("dueAt"))
  });

  if (!id) {
    return { ok: false, message: "수정할 항목을 찾을 수 없습니다." };
  }
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const { supabase, user } = await getAuthContext();
  const { text, note, startAt, dueAt } = validation.data;
  let { data, error } = await supabase
    .from("todos")
    .update({
      text,
      note,
      start_at: startAt,
      due_at: dueAt
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error && isTodoDetailsSchemaError(error)) {
    const fallback = await supabase
      .from("todos")
      .update({ text })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) {
    return { ok: false, message: "수정할 항목을 찾을 수 없습니다." };
  }

  revalidatePath("/");
  return { ok: true, message: "" };
}

export async function toggleTodo(formData: FormData): Promise<ActionResult> {
  const id = parseId(formData.get("id"));
  const completed = formData.get("completed") === "true";

  if (!id) {
    return { ok: false, message: "상태를 변경할 항목을 찾을 수 없습니다." };
  }

  const { supabase, user } = await getAuthContext();
  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "상태를 변경할 항목을 찾을 수 없습니다." };
  }

  revalidatePath("/");
  return { ok: true, message: "" };
}

export async function deleteTodo(formData: FormData): Promise<ActionResult> {
  const id = parseId(formData.get("id"));
  if (!id) {
    return { ok: false, message: "삭제할 항목을 찾을 수 없습니다." };
  }

  const { supabase, user } = await getAuthContext();
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "삭제할 항목을 찾을 수 없습니다." };
  }

  revalidatePath("/");
  return { ok: true, message: "" };
}
