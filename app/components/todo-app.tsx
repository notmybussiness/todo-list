"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createTodo, deleteTodo, toggleTodo, updateTodo } from "@/app/actions/todos";
import { FILTERS, MAX_TODO_LENGTH } from "@/lib/constants";
import type { ActionResult, Filter, Todo } from "@/lib/types";

type TodoAppProps = {
  initialTodos: Todo[];
  initialMessage?: string;
};

export function TodoApp({ initialTodos, initialMessage = "" }: TodoAppProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [todoText, setTodoText] = useState("");
  const [formMessage, setFormMessage] = useState(initialMessage);
  const [currentFilter, setCurrentFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const todoInputRef = useRef<HTMLInputElement>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editingInputRef.current) {
      editingInputRef.current.focus();
      editingInputRef.current.select();
    }
  }, [editingId]);

  const counts = useMemo(() => {
    const total = initialTodos.length;
    const completed = initialTodos.filter((todo) => todo.completed).length;
    return { total, completed, active: total - completed };
  }, [initialTodos]);

  const filteredTodos = useMemo(() => {
    if (currentFilter === "active") {
      return initialTodos.filter((todo) => !todo.completed);
    }
    if (currentFilter === "completed") {
      return initialTodos.filter((todo) => todo.completed);
    }
    return initialTodos;
  }, [currentFilter, initialTodos]);

  const runAction = (
    action: (formData: FormData) => Promise<ActionResult>,
    formData: FormData,
    onSuccess?: () => void
  ) => {
    startTransition(async () => {
      try {
        const result = await action(formData);
        setFormMessage(result.message);

        if (result.ok) {
          onSuccess?.();
          router.refresh();
        }
      } catch {
        setFormMessage("요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    });
  };

  const handleCreateTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.set("text", todoText);

    runAction(createTodo, formData, () => {
      setTodoText("");
      todoInputRef.current?.focus();
    });
  };

  const handleToggleTodo = (todo: Todo) => {
    const formData = new FormData();
    formData.set("id", todo.id);
    formData.set("completed", String(!todo.completed));

    runAction(toggleTodo, formData);
  };

  const handleDeleteTodo = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);

    runAction(deleteTodo, formData, () => {
      if (editingId === id) {
        setEditingId(null);
        setEditingText("");
      }
    });
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
    setFormMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
    setFormMessage("");
    todoInputRef.current?.focus();
  };

  const saveEditing = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("text", editingText);

    runAction(updateTodo, formData, () => {
      setEditingId(null);
      setEditingText("");
      todoInputRef.current?.focus();
    });
  };

  return (
    <>
      <form id="todo-form" className="todo-form" autoComplete="off" onSubmit={handleCreateTodo}>
        <label className="sr-only" htmlFor="todo-input">
          할 일 입력
        </label>
        <input
          id="todo-input"
          ref={todoInputRef}
          name="todo"
          type="text"
          maxLength={MAX_TODO_LENGTH}
          placeholder="할 일을 입력하세요 (최대 200자)"
          required
          value={todoText}
          onChange={(event) => {
            setTodoText(event.target.value);
            setFormMessage("");
          }}
        />
        <button type="submit" disabled={isPending}>
          추가
        </button>
      </form>

      <p id="form-message" className="form-message" role="status" aria-live="polite">
        {formMessage}
      </p>

      <div className="toolbar">
        <div className="filters" role="group" aria-label="할 일 필터">
          {FILTERS.map((filter) => {
            const isActive = filter === currentFilter;
            const label =
              filter === "all" ? "전체" : filter === "active" ? "진행중" : "완료";

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
          {initialTodos.length === 0
            ? "아직 등록된 할 일이 없습니다."
            : "선택한 필터에 해당하는 할 일이 없습니다."}
        </p>
      ) : (
        <ul id="todo-list" className="todo-list" aria-live="polite">
          {filteredTodos.map((todo, index) => {
            const isEditing = editingId === todo.id;

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
                    <input
                      ref={editingInputRef}
                      className="edit-input"
                      type="text"
                      maxLength={MAX_TODO_LENGTH}
                      value={editingText}
                      onChange={(event) => {
                        setEditingText(event.target.value);
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
                      aria-label="할 일 수정 입력"
                      disabled={isPending}
                    />
                  ) : (
                    <p className="todo-text">{todo.text}</p>
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
                      <button
                        type="button"
                        className="action-btn"
                        onClick={cancelEditing}
                        disabled={isPending}
                      >
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
