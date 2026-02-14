import { MAX_TODO_LENGTH } from "@/lib/constants";

type TodoValidationSuccess = {
  ok: true;
  text: string;
};

type TodoValidationFailure = {
  ok: false;
  message: string;
};

export type TodoValidationResult = TodoValidationSuccess | TodoValidationFailure;

function normalizeText(rawText: string): string {
  return rawText.trim();
}

export function validateCreateTodoText(rawText: string): TodoValidationResult {
  const text = normalizeText(rawText);

  if (!text) {
    return { ok: false, message: "할 일을 입력해주세요." };
  }

  if (text.length > MAX_TODO_LENGTH) {
    return { ok: false, message: `할 일은 ${MAX_TODO_LENGTH}자를 초과할 수 없습니다.` };
  }

  return { ok: true, text };
}

export function validateUpdateTodoText(rawText: string): TodoValidationResult {
  const text = normalizeText(rawText);

  if (!text || text.length > MAX_TODO_LENGTH) {
    return { ok: false, message: "수정 내용은 공백일 수 없고 200자 이하여야 합니다." };
  }

  return { ok: true, text };
}
