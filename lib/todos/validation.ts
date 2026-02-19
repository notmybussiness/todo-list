import { MAX_TODO_LENGTH, MAX_TODO_NOTE_LENGTH } from "@/lib/constants";

type TodoValidationSuccess = {
  ok: true;
  text: string;
};

type TodoValidationFailure = {
  ok: false;
  message: string;
};

export type TodoValidationResult = TodoValidationSuccess | TodoValidationFailure;

type TodoInputRaw = {
  text: string;
  note: string;
  startAt: string;
  dueAt: string;
};

export type TodoInput = {
  text: string;
  note: string | null;
  startAt: string | null;
  dueAt: string | null;
};

type TodoInputValidationSuccess = {
  ok: true;
  data: TodoInput;
};

export type TodoInputValidationResult = TodoInputValidationSuccess | TodoValidationFailure;

function normalizeText(rawText: string): string {
  return rawText.trim();
}

function normalizeNote(rawNote: string): string | null {
  const note = rawNote.trim();
  return note.length > 0 ? note : null;
}

function toIsoDateTime(rawDateTime: string): string | null | undefined {
  const value = rawDateTime.trim();
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function validatePeriod(startAtRaw: string, dueAtRaw: string): TodoInputValidationResult {
  const startAt = toIsoDateTime(startAtRaw);
  const dueAt = toIsoDateTime(dueAtRaw);

  if (startAt === undefined || dueAt === undefined) {
    return { ok: false, message: "기간 날짜 형식이 올바르지 않습니다." };
  }

  if ((startAt && !dueAt) || (!startAt && dueAt)) {
    return { ok: false, message: "시작일과 마감일을 함께 입력해주세요." };
  }

  if (startAt && dueAt && new Date(startAt).getTime() > new Date(dueAt).getTime()) {
    return { ok: false, message: "시작일은 마감일보다 늦을 수 없습니다." };
  }

  return {
    ok: true,
    data: {
      text: "",
      note: null,
      startAt: startAt ?? null,
      dueAt: dueAt ?? null
    }
  };
}

function validateTodoInput(
  rawInput: TodoInputRaw,
  options: {
    emptyTextMessage: string;
    tooLongTextMessage: string;
  }
): TodoInputValidationResult {
  const text = normalizeText(rawInput.text);
  if (!text) {
    return { ok: false, message: options.emptyTextMessage };
  }

  if (text.length > MAX_TODO_LENGTH) {
    return { ok: false, message: options.tooLongTextMessage };
  }

  const note = normalizeNote(rawInput.note);
  if (note && note.length > MAX_TODO_NOTE_LENGTH) {
    return { ok: false, message: `메모는 ${MAX_TODO_NOTE_LENGTH}자를 초과할 수 없습니다.` };
  }

  const periodValidation = validatePeriod(rawInput.startAt, rawInput.dueAt);
  if (!periodValidation.ok) {
    return periodValidation;
  }

  return {
    ok: true,
    data: {
      text,
      note,
      startAt: periodValidation.data.startAt,
      dueAt: periodValidation.data.dueAt
    }
  };
}

export function validateCreateTodoInput(rawInput: TodoInputRaw): TodoInputValidationResult {
  return validateTodoInput(rawInput, {
    emptyTextMessage: "할 일을 입력해주세요.",
    tooLongTextMessage: `할 일은 ${MAX_TODO_LENGTH}자를 초과할 수 없습니다.`
  });
}

export function validateUpdateTodoInput(rawInput: TodoInputRaw): TodoInputValidationResult {
  return validateTodoInput(rawInput, {
    emptyTextMessage: "수정 내용은 공백일 수 없고 200자 이하여야 합니다.",
    tooLongTextMessage: "수정 내용은 공백일 수 없고 200자 이하여야 합니다."
  });
}

export function validateCreateTodoText(rawText: string): TodoValidationResult {
  const result = validateCreateTodoInput({ text: rawText, note: "", startAt: "", dueAt: "" });
  if (!result.ok) {
    return result;
  }

  return { ok: true, text: result.data.text };
}

export function validateUpdateTodoText(rawText: string): TodoValidationResult {
  const result = validateUpdateTodoInput({ text: rawText, note: "", startAt: "", dueAt: "" });
  if (!result.ok) {
    return result;
  }

  return { ok: true, text: result.data.text };
}
