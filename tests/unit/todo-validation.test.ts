import { describe, expect, it } from "vitest";

import { validateCreateTodoText, validateUpdateTodoText } from "@/lib/todos/validation";

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
