import { describe, expect, it } from "vitest";

import {
  buildDueReminderHtml,
  buildDueReminderSubject,
  buildDueReminderText
} from "@/lib/todos/reminders";

const sampleTodo = {
  id: "todo-1",
  text: "배포 확인",
  note: "프로덕션 도메인 점검",
  start_at: "2026-02-19T09:00:00.000Z",
  due_at: "2026-02-19T10:00:00.000Z"
};

describe("todo reminder templates", () => {
  it("builds subject with todo title", () => {
    expect(buildDueReminderSubject(sampleTodo)).toContain("배포 확인");
  });

  it("builds plain text including period and note", () => {
    const text = buildDueReminderText(sampleTodo);
    expect(text).toContain("TODO 마감 알림");
    expect(text).toContain("기간:");
    expect(text).toContain("메모: 프로덕션 도메인 점검");
  });

  it("escapes html fields", () => {
    const html = buildDueReminderHtml({
      ...sampleTodo,
      text: "<b>제목</b>",
      note: "<script>alert(1)</script>"
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;b&gt;제목&lt;/b&gt;");
  });
});
