export type DueReminderTodo = {
  id: string;
  text: string;
  note: string | null;
  start_at: string | null;
  due_at: string | null;
};

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(parsed);
}

function formatPeriodLabel(todo: DueReminderTodo): string {
  const start = todo.start_at ? formatDateTime(todo.start_at) : null;
  const due = todo.due_at ? formatDateTime(todo.due_at) : null;

  if (start && due) {
    return `${start} ~ ${due}`;
  }
  if (due) {
    return due;
  }
  return "미설정";
}

export function buildDueReminderSubject(todo: DueReminderTodo): string {
  return `[TODO 알림] "${todo.text}" 마감 확인`;
}

export function buildDueReminderText(todo: DueReminderTodo): string {
  const lines = [
    "TODO 마감 알림입니다.",
    "",
    `제목: ${todo.text}`,
    `기간: ${formatPeriodLabel(todo)}`,
    `메모: ${todo.note?.trim() ? todo.note.trim() : "없음"}`
  ];
  return lines.join("\n");
}

export function buildDueReminderHtml(todo: DueReminderTodo): string {
  const safeTitle = todo.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeNote = (todo.note?.trim() ? todo.note.trim() : "없음")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return [
    "<h2>TODO 마감 알림</h2>",
    `<p><strong>제목:</strong> ${safeTitle}</p>`,
    `<p><strong>기간:</strong> ${formatPeriodLabel(todo)}</p>`,
    `<p><strong>메모:</strong><br/>${safeNote}</p>`
  ].join("");
}
