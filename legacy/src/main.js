import { loadTodos, saveTodos } from "./storage.js";
import { createTodoState } from "./state.js";
import { createRenderer } from "./render.js";
import { bindEvents } from "./events.js";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const formMessage = document.getElementById("form-message");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const todoStats = document.getElementById("todo-stats");
const filterButtons = {
  all: document.getElementById("filter-all"),
  active: document.getElementById("filter-active"),
  completed: document.getElementById("filter-completed")
};

if (
  !todoForm ||
  !todoInput ||
  !formMessage ||
  !todoList ||
  !emptyState ||
  !todoStats ||
  !filterButtons.all ||
  !filterButtons.active ||
  !filterButtons.completed
) {
  throw new Error("필수 DOM 요소를 찾을 수 없습니다.");
}

const dom = {
  todoForm,
  todoInput,
  formMessage,
  todoList,
  emptyState,
  todoStats,
  filterButtons
};

const state = createTodoState(loadTodos(), saveTodos);
const renderer = createRenderer(dom, state);

bindEvents(dom, state, renderer);
renderer.render();
