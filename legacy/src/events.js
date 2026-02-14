export function bindEvents(dom, state, renderer) {
  const { todoForm, todoInput, todoList, filterButtons } = dom;

  todoInput.addEventListener("input", () => {
    renderer.setFormMessage("");
  });

  todoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = state.addTodo(todoInput.value);
    renderer.setFormMessage(result.message);
    if (result.ok) {
      todoInput.value = "";
      todoInput.focus();
    }
    renderer.render();
  });

  todoList.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains("todo-toggle")) {
      return;
    }

    const item = target.closest(".todo-item");
    if (!item || !item.dataset.id) {
      return;
    }

    if (state.toggleTodo(item.dataset.id)) {
      renderer.render();
    }
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
      if (state.deleteTodo(id)) {
        renderer.render();
      }
      return;
    }

    if (action === "edit") {
      state.setEditingId(id);
      renderer.render();
      return;
    }

    if (action === "cancel") {
      state.setEditingId(null);
      renderer.setFormMessage("");
      renderer.render();
      return;
    }

    if (action === "save") {
      const input = item.querySelector(".edit-input");
      if (!(input instanceof HTMLInputElement)) {
        return;
      }
      const result = state.updateTodo(id, input.value);
      renderer.setFormMessage(result.message);
      if (!result.ok) {
        input.focus();
        return;
      }
      state.setEditingId(null);
      renderer.render();
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
      state.setEditingId(null);
      renderer.setFormMessage("");
      renderer.render();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const result = state.updateTodo(item.dataset.id, target.value);
      renderer.setFormMessage(result.message);
      if (!result.ok) {
        target.focus();
        return;
      }
      state.setEditingId(null);
      renderer.render();
      todoInput.focus();
    }
  });

  filterButtons.all.addEventListener("click", () => {
    if (state.setFilter("all")) {
      renderer.render();
    }
  });

  filterButtons.active.addEventListener("click", () => {
    if (state.setFilter("active")) {
      renderer.render();
    }
  });

  filterButtons.completed.addEventListener("click", () => {
    if (state.setFilter("completed")) {
      renderer.render();
    }
  });
}
