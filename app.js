const STORAGE_KEY = "todo_app_v1";
const MAX_TODO_LENGTH = 200;
const FILTERS = ["all", "active", "completed"];

let todos = loadTodos();
let currentFilter = "all";
let editingId = null;

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const formMessage = document.getElementById("form-message");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const todoStats = document.getElementById("todo-stats");
const filterAllBtn = document.getElementById("filter-all");
const filterActiveBtn = document.getElementById("filter-active");
const filterCompletedBtn = document.getElementById("filter-completed");

if (
  !todoForm ||
  !todoInput ||
  !formMessage ||
  !todoList ||
  !emptyState ||
  !todoStats ||
  !filterAllBtn ||
  !filterActiveBtn ||
  !filterCompletedBtn
) {
  throw new Error("필수 DOM 요소를 찾을 수 없습니다.");
}

function createTodoId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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

function loadTodos() {
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

function saveTodos(nextTodos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTodos));
    return true;
  } catch (error) {
    return false;
  }
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showFormMessage("할 일을 입력해주세요.");
    return false;
  }
  if (trimmed.length > MAX_TODO_LENGTH) {
    showFormMessage(`할 일은 ${MAX_TODO_LENGTH}자를 초과할 수 없습니다.`);
    return false;
  }

  const newTodo = {
    id: createTodoId(),
    text: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos = [newTodo, ...todos];
  saveTodos(todos);
  showFormMessage("");
  render();
  return true;
}

function updateTodo(id, nextText) {
  const trimmed = nextText.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.length > MAX_TODO_LENGTH) {
    return false;
  }

  const index = todos.findIndex((todo) => todo.id === id);
  if (index < 0) {
    return false;
  }

  const current = todos[index];
  todos[index] = { ...current, text: trimmed };
  saveTodos(todos);
  return true;
}

function toggleTodo(id) {
  todos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  saveTodos(todos);
  render();
}

function deleteTodo(id) {
  const nextTodos = todos.filter((todo) => todo.id !== id);
  if (nextTodos.length === todos.length) {
    return;
  }
  todos = nextTodos;
  saveTodos(todos);

  if (editingId === id) {
    editingId = null;
  }

  render();
}

function setFilter(filter) {
  if (!FILTERS.includes(filter)) {
    return;
  }

  currentFilter = filter;
  render();
}

function showFormMessage(message) {
  formMessage.textContent = message;
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
  const active = total - completed;
  return { total, active, completed };
}

function setFilterButtonState() {
  const filterMap = {
    all: filterAllBtn,
    active: filterActiveBtn,
    completed: filterCompletedBtn,
  };

  FILTERS.forEach((filter) => {
    const button = filterMap[filter];
    const active = filter === currentFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function createTodoItem(todo, index) {
  const item = document.createElement("li");
  item.className = `todo-item${todo.completed ? " is-completed" : ""}`;
  item.dataset.id = todo.id;
  item.style.animationDelay = `${index * 24}ms`;

  const toggle = document.createElement("input");
  toggle.className = "todo-toggle";
  toggle.type = "checkbox";
  toggle.checked = todo.completed;
  toggle.setAttribute("aria-label", `${todo.text} 완료 상태 변경`);

  const main = document.createElement("div");
  main.className = "todo-main";

  if (editingId === todo.id) {
    const editInput = document.createElement("input");
    editInput.className = "edit-input";
    editInput.type = "text";
    editInput.maxLength = MAX_TODO_LENGTH;
    editInput.value = todo.text;
    editInput.setAttribute("aria-label", "할 일 수정 입력");
    main.append(editInput);
  } else {
    const text = document.createElement("p");
    text.className = "todo-text";
    text.textContent = todo.text;
    main.append(text);
  }

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  if (editingId === todo.id) {
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "action-btn";
    saveBtn.dataset.action = "save";
    saveBtn.textContent = "저장";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "action-btn";
    cancelBtn.dataset.action = "cancel";
    cancelBtn.textContent = "취소";

    actions.append(saveBtn, cancelBtn);
  } else {
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "action-btn";
    editBtn.dataset.action = "edit";
    editBtn.textContent = "수정";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn";
    deleteBtn.dataset.action = "delete";
    deleteBtn.textContent = "삭제";

    actions.append(editBtn, deleteBtn);
  }

  item.append(toggle, main, actions);
  return item;
}

function renderCount() {
  const counts = getCounts();
  todoStats.textContent = `전체 ${counts.total} · 진행중 ${counts.active} · 완료 ${counts.completed}`;
}

function render() {
  setFilterButtonState();
  renderCount();

  const filteredTodos = getFilteredTodos();
  todoList.textContent = "";

  if (filteredTodos.length === 0) {
    emptyState.textContent =
      todos.length === 0
        ? "아직 등록된 할 일이 없습니다."
        : "선택한 필터에 해당하는 할 일이 없습니다.";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  const fragment = document.createDocumentFragment();
  filteredTodos.forEach((todo, index) => {
    fragment.append(createTodoItem(todo, index));
  });
  todoList.append(fragment);

  if (editingId) {
    const editInput = todoList.querySelector('[data-id="' + editingId + '"] .edit-input');
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }
}

todoInput.addEventListener("input", () => {
  if (formMessage.textContent) {
    showFormMessage("");
  }
});

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (addTodo(todoInput.value)) {
    todoInput.value = "";
    todoInput.focus();
  }
});

todoList.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  if (!target.classList.contains("todo-toggle")) {
    return;
  }

  const item = target.closest(".todo-item");
  if (!item || !item.dataset.id) {
    return;
  }

  toggleTodo(item.dataset.id);
});

todoList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const item = target.closest(".todo-item");
  if (!item || !item.dataset.id) {
    return;
  }

  const id = item.dataset.id;
  const action = target.dataset.action;

  if (action === "delete") {
    deleteTodo(id);
    return;
  }

  if (action === "edit") {
    editingId = id;
    render();
    return;
  }

  if (action === "cancel") {
    editingId = null;
    showFormMessage("");
    render();
    return;
  }

  if (action === "save") {
    const editInput = item.querySelector(".edit-input");
    if (!(editInput instanceof HTMLInputElement)) {
      return;
    }

    const success = updateTodo(id, editInput.value);
    if (!success) {
      showFormMessage("수정 내용은 공백일 수 없고 200자 이하여야 합니다.");
      editInput.focus();
      return;
    }

    editingId = null;
    showFormMessage("");
    render();
    todoInput.focus();
  }
});

todoList.addEventListener("keydown", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("edit-input")) {
    return;
  }

  const item = target.closest(".todo-item");
  if (!item || !item.dataset.id) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    editingId = null;
    showFormMessage("");
    render();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const success = updateTodo(item.dataset.id, target.value);
    if (!success) {
      showFormMessage("수정 내용은 공백일 수 없고 200자 이하여야 합니다.");
      target.focus();
      return;
    }

    editingId = null;
    showFormMessage("");
    render();
    todoInput.focus();
  }
});

filterAllBtn.addEventListener("click", () => setFilter("all"));
filterActiveBtn.addEventListener("click", () => setFilter("active"));
filterCompletedBtn.addEventListener("click", () => setFilter("completed"));

render();
