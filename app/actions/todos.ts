"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MAX_TODO_LENGTH } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

function parseId(rawId: FormDataEntryValue | null): string | null {
  if (typeof rawId !== "string") {
    return null;
  }
  const id = rawId.trim();
  return id.length > 0 ? id : null;
}

function parseText(rawText: FormDataEntryValue | null): string {
  return typeof rawText === "string" ? rawText.trim() : "";
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
  const text = parseText(formData.get("text"));
  if (!text) {
    return { ok: false, message: "할 일을 입력해주세요." };
  }
  if (text.length > MAX_TODO_LENGTH) {
    return { ok: false, message: `할 일은 ${MAX_TODO_LENGTH}자를 초과할 수 없습니다.` };
  }

  const { supabase, user } = await getAuthContext();
  const { error } = await supabase.from("todos").insert({
    user_id: user.id,
    text,
    completed: false
  });

  if (error) {
    return { ok: false, message: "할 일을 저장하지 못했습니다. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/");
  return { ok: true, message: "" };
}

export async function updateTodo(formData: FormData): Promise<ActionResult> {
  const id = parseId(formData.get("id"));
  const text = parseText(formData.get("text"));

  if (!id) {
    return { ok: false, message: "수정할 항목을 찾을 수 없습니다." };
  }
  if (!text || text.length > MAX_TODO_LENGTH) {
    return { ok: false, message: "수정 내용은 공백일 수 없고 200자 이하여야 합니다." };
  }

  const { supabase, user } = await getAuthContext();
  const { data, error } = await supabase
    .from("todos")
    .update({ text })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

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
