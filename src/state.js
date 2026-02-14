import { FILTERS, MAX_TODO_LENGTH } from "./types.js";

function createTodoId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createTodoState(initialTodos, persistTodos) {
  let todos = Array.isArray(initialTodos) ? [...initialTodos] : [];
  let currentFilter = "all";
  let editingId = null;

  const persist = () => persistTodos(todos);

  function getTodos() {
    return todos;
  }

  function getEditingId() {
    return editingId;
  }

  function setEditingId(id) {
    editingId = id;
  }

  function getCurrentFilter() {
    return currentFilter;
  }

  function addTodo(text) {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) {
      return { ok: false, message: "할 일을 입력해주세요." };
    }
    if (trimmed.length > MAX_TODO_LENGTH) {
      return { ok: false, message: `할 일은 ${MAX_TODO_LENGTH}자를 초과할 수 없습니다.` };
    }

    todos = [
      {
        id: createTodoId(),
        text: trimmed,
        completed: false,
        createdAt: new Date().toISOString()
      },
      ...todos
    ];

    if (!persist()) {
      return { ok: true, message: "브라우저 저장소에 접근할 수 없습니다." };
    }
    return { ok: true, message: "" };
  }

  function updateTodo(id, nextText) {
    const trimmed = String(nextText ?? "").trim();
    if (!trimmed || trimmed.length > MAX_TODO_LENGTH) {
      return { ok: false, message: "수정 내용은 공백일 수 없고 200자 이하여야 합니다." };
    }

    const index = todos.findIndex((todo) => todo.id === id);
    if (index < 0) {
      return { ok: false, message: "수정할 항목을 찾을 수 없습니다." };
    }

    todos[index] = { ...todos[index], text: trimmed };
    if (!persist()) {
      return { ok: true, message: "브라우저 저장소에 접근할 수 없습니다." };
    }
    return { ok: true, message: "" };
  }

  function toggleTodo(id) {
    let updated = false;
    todos = todos.map((todo) => {
      if (todo.id !== id) {
        return todo;
      }
      updated = true;
      return { ...todo, completed: !todo.completed };
    });

    if (!updated) {
      return false;
    }
    persist();
    return true;
  }

  function deleteTodo(id) {
    const nextTodos = todos.filter((todo) => todo.id !== id);
    if (nextTodos.length === todos.length) {
      return false;
    }
    todos = nextTodos;
    if (editingId === id) {
      editingId = null;
    }
    persist();
    return true;
  }

  function setFilter(filter) {
    if (!FILTERS.includes(filter)) {
      return false;
    }
    currentFilter = filter;
    return true;
  }

  function getFilteredTodos() {
    if (currentFilter === "active") {
      return todos.filter((todo) => !todo.completed);
    }
    if (currentFilter === "completed") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  }

  function getCounts() {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    return { total, completed, active: total - completed };
  }

  return {
    getTodos,
    getEditingId,
    setEditingId,
    getCurrentFilter,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
    getFilteredTodos,
    getCounts
  };
}
