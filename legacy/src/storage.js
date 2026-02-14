import { MAX_TODO_LENGTH } from "./types.js";

export const STORAGE_KEY = "todo_app_v1";

function normalizeTodo(rawTodo) {
  if (!rawTodo || typeof rawTodo !== "object") {
    return null;
  }

  const id = typeof rawTodo.id === "string" && rawTodo.id ? rawTodo.id : null;
  const text = typeof rawTodo.text === "string" ? rawTodo.text.trim() : "";
  const completed = Boolean(rawTodo.completed);
  const createdAt =
    typeof rawTodo.createdAt === "string" && !Number.isNaN(Date.parse(rawTodo.createdAt))
      ? rawTodo.createdAt
      : new Date().toISOString();

  if (!id || !text || text.length > MAX_TODO_LENGTH) {
    return null;
  }

  return { id, text, completed, createdAt };
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch (error) {
    return false;
  }
}

export function loadTodos() {
  const recoverToEmpty = () => {
    saveTodos([]);
    return [];
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return recoverToEmpty();
    }

    const normalized = parsed.map(normalizeTodo).filter(Boolean);
    if (normalized.length !== parsed.length) {
      saveTodos(normalized);
    }
    return normalized;
  } catch (error) {
    return recoverToEmpty();
  }
}
