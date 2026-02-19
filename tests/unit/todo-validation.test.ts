import { describe, expect, it } from "vitest";

import {
  validateCreateTodoInput,
  validateCreateTodoText,
  validateUpdateTodoInput,
  validateUpdateTodoText
} from "@/lib/todos/validation";

describe("validateCreateTodoText", () => {
  it("rejects empty text", () => {
    const result = validateCreateTodoText("   ");
    expect(result).toEqual({ ok: false, message: "할 일을 입력해주세요." });
  });

  it("rejects text longer than 200 chars", () => {
    const result = validateCreateTodoText("a".repeat(201));
    expect(result).toEqual({ ok: false, message: "할 일은 200자를 초과할 수 없습니다." });
  });

  it("accepts valid text and trims whitespace", () => {
    const result = validateCreateTodoText("  hello todo  ");
    expect(result).toEqual({ ok: true, text: "hello todo" });
  });
});

describe("validateUpdateTodoText", () => {
  it("rejects empty text", () => {
    const result = validateUpdateTodoText("   ");
    expect(result).toEqual({ ok: false, message: "수정 내용은 공백일 수 없고 200자 이하여야 합니다." });
  });

  it("rejects text longer than 200 chars", () => {
    const result = validateUpdateTodoText("a".repeat(201));
    expect(result).toEqual({ ok: false, message: "수정 내용은 공백일 수 없고 200자 이하여야 합니다." });
  });

  it("accepts valid text and trims whitespace", () => {
    const result = validateUpdateTodoText("  edited todo  ");
    expect(result).toEqual({ ok: true, text: "edited todo" });
  });
});

describe("validateCreateTodoInput", () => {
  it("accepts note and valid start~due period", () => {
    const result = validateCreateTodoInput({
      text: "todo",
      note: "memo",
      startAt: "2026-02-19T09:00",
      dueAt: "2026-02-19T10:00"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.text).toBe("todo");
    expect(result.data.note).toBe("memo");
    expect(typeof result.data.startAt).toBe("string");
    expect(typeof result.data.dueAt).toBe("string");
  });

  it("rejects note longer than 200 chars", () => {
    const result = validateCreateTodoInput({
      text: "todo",
      note: "a".repeat(201),
      startAt: "",
      dueAt: ""
    });
    expect(result).toEqual({ ok: false, message: "메모는 200자를 초과할 수 없습니다." });
  });
});

describe("validateUpdateTodoInput period checks", () => {
  it("rejects when only one side of period is present", () => {
    const result = validateUpdateTodoInput({
      text: "todo",
      note: "",
      startAt: "2026-02-19T09:00",
      dueAt: ""
    });
    expect(result).toEqual({ ok: false, message: "시작일과 마감일을 함께 입력해주세요." });
  });

  it("rejects when start is later than due", () => {
    const result = validateUpdateTodoInput({
      text: "todo",
      note: "",
      startAt: "2026-02-19T10:00",
      dueAt: "2026-02-19T09:00"
    });
    expect(result).toEqual({ ok: false, message: "시작일은 마감일보다 늦을 수 없습니다." });
  });
});
