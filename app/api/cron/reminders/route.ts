import { NextResponse, type NextRequest } from "next/server";

import { sendSmtpMail } from "@/lib/email/smtp";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildDueReminderHtml,
  buildDueReminderSubject,
  buildDueReminderText,
  type DueReminderTodo
} from "@/lib/todos/reminders";

type PendingReminderRow = DueReminderTodo & {
  user_id: string;
  completed: boolean;
};

type AuthUserRow = {
  id: string;
  email: string | null;
};

const REMINDER_BATCH_SIZE = 50;

function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized cron request" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: todos, error: todosError } = await supabase
      .from("todos")
      .select("id, user_id, text, note, start_at, due_at, completed")
      .eq("completed", false)
      .not("due_at", "is", null)
      .is("reminder_sent_at", null)
      .lte("due_at", now)
      .order("due_at", { ascending: true })
      .limit(REMINDER_BATCH_SIZE);

    if (todosError) {
      return NextResponse.json(
        { ok: false, message: "대상 Todo 조회에 실패했습니다.", detail: todosError.message },
        { status: 500 }
      );
    }

    const pendingTodos = (todos ?? []) as PendingReminderRow[];
    if (pendingTodos.length === 0) {
      return NextResponse.json({
        ok: true,
        scanned: 0,
        sent: 0,
        skipped: 0,
        failed: 0
      });
    }

    const uniqueUserIds = [...new Set(pendingTodos.map((todo) => todo.user_id))];
    const { data: users, error: usersError } = await supabase
      .schema("auth")
      .from("users")
      .select("id, email")
      .in("id", uniqueUserIds);

    if (usersError) {
      return NextResponse.json(
        { ok: false, message: "인증 사용자 조회에 실패했습니다.", detail: usersError.message },
        { status: 500 }
      );
    }

    const emailByUserId = new Map<string, string>();
    for (const user of (users ?? []) as AuthUserRow[]) {
      if (user.email) {
        emailByUserId.set(user.id, user.email);
      }
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const todo of pendingTodos) {
      const email = emailByUserId.get(todo.user_id);
      if (!email) {
        skipped += 1;
        continue;
      }

      try {
        await sendSmtpMail({
          to: email,
          subject: buildDueReminderSubject(todo),
          text: buildDueReminderText(todo),
          html: buildDueReminderHtml(todo)
        });

        const { error: updateError } = await supabase
          .from("todos")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", todo.id)
          .is("reminder_sent_at", null);

        if (updateError) {
          failed += 1;
          errors.push(`todo:${todo.id} update failed - ${updateError.message}`);
          continue;
        }

        sent += 1;
      } catch (error) {
        failed += 1;
        errors.push(`todo:${todo.id} mail failed - ${error instanceof Error ? error.message : "unknown"}`);
      }
    }

    return NextResponse.json({
      ok: failed === 0,
      scanned: pendingTodos.length,
      sent,
      skipped,
      failed,
      errors
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "리마인더 배치를 실행하지 못했습니다.",
        detail: error instanceof Error ? error.message : "unknown"
      },
      { status: 500 }
    );
  }
}
