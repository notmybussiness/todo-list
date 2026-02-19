"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createTodo, deleteTodo, toggleTodo, updateTodo } from "@/app/actions/todos";
import { FILTERS, MAX_TODO_NOTE_LENGTH } from "@/lib/constants";
import { validateCreateTodoInput, validateUpdateTodoInput } from "@/lib/todos/validation";
import type { ActionResult, Filter, Todo } from "@/lib/types";

type TodoAppProps = {
  initialTodos: Todo[];
  initialMessage?: string;
};

function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const offsetInMs = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - offsetInMs).toISOString().slice(0, 16);
}

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

function formatPeriodLabel(todo: Todo): string | null {
  const start = formatDateTime(todo.start_at);
  const due = formatDateTime(todo.due_at);

  if (!start || !due) {
    return null;
  }

  return `기간 ${start} ~ ${due}`;
}

export function TodoApp({ initialTodos, initialMessage = "" }: TodoAppProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoNote, setTodoNote] = useState("");
  const [todoStartAt, setTodoStartAt] = useState("");
  const [todoDueAt, setTodoDueAt] = useState("");
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [formMessage, setFormMessage] = useState(initialMessage);
  const [currentFilter, setCurrentFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingNote, setEditingNote] = useState("");
  const [editingStartAt, setEditingStartAt] = useState("");
  const [editingDueAt, setEditingDueAt] = useState("");

  const todoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const counts = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    return { total, completed, active: total - completed };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (currentFilter === "active") {
      return todos.filter((todo) => !todo.completed);
    }
    if (currentFilter === "completed") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  }, [currentFilter, todos]);

  const runAction = (
    action: (formData: FormData) => Promise<ActionResult>,
    formData: FormData,
    options?: {
      optimisticUpdate?: () => void;
      rollback?: () => void;
      onSuccess?: () => void;
    }
  ) => {
    options?.optimisticUpdate?.();

    startTransition(async () => {
      try {
        const result = await action(formData);
        setFormMessage(result.message);

        if (result.ok) {
          options?.onSuccess?.();
          router.refresh();
        } else {
          options?.rollback?.();
        }
      } catch {
        options?.rollback?.();
        setFormMessage("요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    });
  };

  const handleCreateTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateCreateTodoInput({
      text: todoTitle,
      note: todoNote,
      startAt: todoStartAt,
      dueAt: todoDueAt
    });
    if (!validation.ok) {
      setFormMessage(validation.message);
      return;
    }

    const formData = new FormData();
    formData.set("text", validation.data.text);
    formData.set("note", validation.data.note ?? "");
    formData.set("startAt", todoStartAt);
    formData.set("dueAt", todoDueAt);
    const previousTodos = [...todos];
    const previousFileNames = [...selectedFileNames];

    const optimisticTodo: Todo = {
      id: `temp-${Date.now()}`,
      text: validation.data.text,
      note: validation.data.note,
      start_at: validation.data.startAt,
      due_at: validation.data.dueAt,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    runAction(createTodo, formData, {
      optimisticUpdate: () => {
        setTodos((prev) => [optimisticTodo, ...prev]);
        setTodoTitle("");
        setTodoNote("");
        setTodoStartAt("");
        setTodoDueAt("");
        setSelectedFileNames([]);
        setFormMessage("");
        todoInputRef.current?.focus();
      },
      rollback: () => {
        setTodos(previousTodos);
        setTodoTitle(validation.data.text);
        setTodoNote(validation.data.note ?? "");
        setTodoStartAt(toDateTimeLocalValue(validation.data.startAt));
        setTodoDueAt(toDateTimeLocalValue(validation.data.dueAt));
        setSelectedFileNames(previousFileNames);
      }
    });
  };

  const handleToggleTodo = (todo: Todo) => {
    const formData = new FormData();
    formData.set("id", todo.id);
    formData.set("completed", String(!todo.completed));
    const previousTodos = [...todos];

    runAction(toggleTodo, formData, {
      optimisticUpdate: () => {
        setTodos((prev) =>
          prev.map((item) =>
            item.id === todo.id
              ? { ...item, completed: !item.completed, updated_at: new Date().toISOString() }
              : item
          )
        );
      },
      rollback: () => {
        setTodos(previousTodos);
      }
    });
  };

  const handleDeleteTodo = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);
    const previousTodos = [...todos];

    runAction(deleteTodo, formData, {
      optimisticUpdate: () => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
        if (editingId === id) {
          setEditingId(null);
          setEditingTitle("");
          setEditingNote("");
          setEditingStartAt("");
          setEditingDueAt("");
        }
      },
      rollback: () => {
        setTodos(previousTodos);
      }
    });
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.text);
    setEditingNote(todo.note ?? "");
    setEditingStartAt(toDateTimeLocalValue(todo.start_at));
    setEditingDueAt(toDateTimeLocalValue(todo.due_at));
    setFormMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingNote("");
    setEditingStartAt("");
    setEditingDueAt("");
    setFormMessage("");
    todoInputRef.current?.focus();
  };

  const saveEditing = (id: string) => {
    const validation = validateUpdateTodoInput({
      text: editingTitle,
      note: editingNote,
      startAt: editingStartAt,
      dueAt: editingDueAt
    });
    if (!validation.ok) {
      setFormMessage(validation.message);
      return;
    }

    const formData = new FormData();
    formData.set("id", id);
    formData.set("text", validation.data.text);
    formData.set("note", validation.data.note ?? "");
    formData.set("startAt", editingStartAt);
    formData.set("dueAt", editingDueAt);
    const previousTodos = [...todos];

    runAction(updateTodo, formData, {
      optimisticUpdate: () => {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  text: validation.data.text,
                  note: validation.data.note,
                  start_at: validation.data.startAt,
                  due_at: validation.data.dueAt,
                  updated_at: new Date().toISOString()
                }
              : todo
          )
        );
        setEditingId(null);
        setEditingTitle("");
        setEditingNote("");
        setEditingStartAt("");
        setEditingDueAt("");
        setFormMessage("");
        todoInputRef.current?.focus();
      },
      rollback: () => {
        setTodos(previousTodos);
        setEditingId(id);
        setEditingTitle(validation.data.text);
        setEditingNote(validation.data.note ?? "");
        setEditingStartAt(toDateTimeLocalValue(validation.data.startAt));
        setEditingDueAt(toDateTimeLocalValue(validation.data.dueAt));
      }
    });
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(event.target.files ?? []).map((file) => file.name);
    setSelectedFileNames(names);
  };

  return (
    <>
      <form id="todo-form" className="todo-form todo-form-enhanced" autoComplete="off" onSubmit={handleCreateTodo}>
        <div className="todo-form-main-row">
          <label className="sr-only" htmlFor="todo-input">
            할 일 제목 입력
          </label>
          <input
            id="todo-input"
            ref={todoInputRef}
            name="todo"
            type="text"
            placeholder="할 일 제목을 입력하세요 (최대 200자)"
            required
            value={todoTitle}
            onChange={(event) => {
              setTodoTitle(event.target.value);
              setFormMessage("");
            }}
          />

          <div className="period-input-group">
            <label className="sr-only" htmlFor="todo-start-at">
              시작일
            </label>
            <input
              id="todo-start-at"
              className="due-input"
              type="datetime-local"
              value={todoStartAt}
              onChange={(event) => {
                setTodoStartAt(event.target.value);
                setFormMessage("");
              }}
            />
            <span className="period-separator">~</span>
            <label className="sr-only" htmlFor="todo-due-at">
              마감일
            </label>
            <input
              id="todo-due-at"
              className="due-input"
              type="datetime-local"
              value={todoDueAt}
              onChange={(event) => {
                setTodoDueAt(event.target.value);
                setFormMessage("");
              }}
            />
          </div>

          <button type="submit" disabled={isPending}>
            추가
          </button>
        </div>

        <div className="todo-form-detail">
          <label className="todo-detail-label" htmlFor="todo-note">
            메모
          </label>
          <textarea
            id="todo-note"
            className="todo-note-input"
            rows={3}
            placeholder={`할 일 상세 메모를 입력하세요 (최대 ${MAX_TODO_NOTE_LENGTH}자)`}
            value={todoNote}
            onChange={(event) => {
              setTodoNote(event.target.value);
              setFormMessage("");
            }}
          />
        </div>

        <div className="todo-upload-panel">
          <div className="todo-upload-head">
            <p className="todo-upload-title">파일 첨부</p>
            <p className="todo-upload-caption">현재는 UI 단계이며, 다음 단계에서 Storage 업로드를 연결합니다.</p>
          </div>
          <input id="todo-files" className="todo-file-input" type="file" multiple onChange={handleFilesSelected} />
          <p className="todo-upload-selected" aria-live="polite">
            {selectedFileNames.length > 0
              ? `선택됨: ${selectedFileNames.join(", ")}`
              : "선택된 파일이 없습니다."}
          </p>
        </div>
      </form>

      <p id="form-message" className="form-message" role="status" aria-live="polite">
        {formMessage}
      </p>

      <div className="toolbar">
        <div className="filters" role="group" aria-label="할 일 필터">
          {FILTERS.map((filter) => {
            const isActive = filter === currentFilter;
            const label = filter === "all" ? "전체" : filter === "active" ? "진행중" : "완료";

            return (
              <button
                key={filter}
                type="button"
                className={`filter-btn${isActive ? " active" : ""}`}
                aria-pressed={isActive}
                onClick={() => setCurrentFilter(filter)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p id="todo-stats" className="todo-count" aria-live="polite">
          전체 {counts.total} · 진행중 {counts.active} · 완료 {counts.completed}
        </p>
      </div>

      {filteredTodos.length === 0 ? (
        <p id="empty-state" className="empty-state" role="status" aria-live="polite">
          {todos.length === 0
            ? "아직 등록된 할 일이 없습니다."
            : "선택한 필터에 해당하는 할 일이 없습니다."}
        </p>
      ) : (
        <ul id="todo-list" className="todo-list" aria-live="polite">
          {filteredTodos.map((todo, index) => {
            const isEditing = editingId === todo.id;
            const periodLabel = formatPeriodLabel(todo);

            return (
              <li
                key={todo.id}
                className={`todo-item${todo.completed ? " is-completed" : ""}`}
                style={{ animationDelay: `${index * 24}ms` }}
              >
                <input
                  className="todo-toggle"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo)}
                  aria-label={`${todo.text} 완료 상태 변경`}
                  disabled={isPending}
                />

                <div className="todo-main">
                  {isEditing ? (
                    <div className="todo-edit-fields">
                      <input
                        className="edit-input"
                        type="text"
                        value={editingTitle}
                        onChange={(event) => {
                          setEditingTitle(event.target.value);
                          setFormMessage("");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            event.preventDefault();
                            cancelEditing();
                            return;
                          }

                          if (event.key === "Enter") {
                            event.preventDefault();
                            saveEditing(todo.id);
                          }
                        }}
                        aria-label="할 일 제목 수정 입력"
                        disabled={isPending}
                      />

                      <textarea
                        className="edit-note-input"
                        rows={3}
                        value={editingNote}
                        onChange={(event) => {
                          setEditingNote(event.target.value);
                          setFormMessage("");
                        }}
                        aria-label="할 일 메모 수정 입력"
                        disabled={isPending}
                      />

                      <div className="edit-period-row">
                        <input
                          className="edit-period-input"
                          type="datetime-local"
                          value={editingStartAt}
                          onChange={(event) => {
                            setEditingStartAt(event.target.value);
                            setFormMessage("");
                          }}
                          aria-label="시작일 수정 입력"
                          disabled={isPending}
                        />
                        <span className="period-separator">~</span>
                        <input
                          className="edit-period-input"
                          type="datetime-local"
                          value={editingDueAt}
                          onChange={(event) => {
                            setEditingDueAt(event.target.value);
                            setFormMessage("");
                          }}
                          aria-label="마감일 수정 입력"
                          disabled={isPending}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="todo-text">{todo.text}</p>
                      {todo.note ? <p className="todo-note">{todo.note}</p> : null}
                      <p className="todo-meta">
                        {periodLabel ? <span className="todo-due-chip">{periodLabel}</span> : null}
                      </p>
                    </>
                  )}
                </div>

                <div className="todo-actions">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => saveEditing(todo.id)}
                        disabled={isPending}
                      >
                        저장
                      </button>
                      <button type="button" className="action-btn" onClick={cancelEditing} disabled={isPending}>
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => startEditing(todo)}
                        disabled={isPending}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        data-action="delete"
                        onClick={() => handleDeleteTodo(todo.id)}
                        disabled={isPending}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
