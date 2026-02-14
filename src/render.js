export function createRenderer(dom, state) {
  const { todoList, emptyState, todoStats, formMessage, filterButtons } = dom;

  function setFormMessage(message) {
    formMessage.textContent = message;
  }

  function setFilterButtonState() {
    Object.entries(filterButtons).forEach(([filter, button]) => {
      const active = filter === state.getCurrentFilter();
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderCounts() {
    const counts = state.getCounts();
    todoStats.textContent = `전체 ${counts.total} · 진행중 ${counts.active} · 완료 ${counts.completed}`;
  }

  function createTodoItem(todo, index) {
    const editingId = state.getEditingId();
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
      editInput.maxLength = 200;
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

  function renderList() {
    const filteredTodos = state.getFilteredTodos();
    const allTodos = state.getTodos();

    todoList.textContent = "";

    if (filteredTodos.length === 0) {
      emptyState.textContent =
        allTodos.length === 0
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

    const editingId = state.getEditingId();
    if (editingId) {
      const input = todoList.querySelector(`[data-id="${editingId}"] .edit-input`);
      if (input) {
        input.focus();
        input.select();
      }
    }
  }

  function render() {
    setFilterButtonState();
    renderCounts();
    renderList();
  }

  return {
    render,
    setFormMessage
  };
}
