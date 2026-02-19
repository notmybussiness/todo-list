const mockTodos = [
  {
    id: "1",
    text: "배포 체크리스트 최종 점검",
    due: "2026-02-16 18:00",
    note: "Vercel Production 도메인과 OAuth Redirect URL 일치 여부 확인",
    files: 1,
    completed: false
  },
  {
    id: "2",
    text: "팀 데모 준비",
    due: "2026-02-17 10:00",
    note: "",
    files: 0,
    completed: true
  }
];

export default function DesignPreviewPage() {
  return (
    <main className="app-shell">
      <section className="todo-app" aria-label="다음 버전 디자인 프리뷰">
        <header className="app-header">
          <p className="eyebrow">Design Preview</p>
          <h1>TODO 리스트 vNext</h1>
          <p className="subtitle">기능 연결 전 UI 목업입니다. 입력/버튼은 동작하지 않습니다.</p>
        </header>

        <form className="todo-form todo-form-preview" autoComplete="off">
          <label className="sr-only" htmlFor="preview-todo-input">
            할 일 입력
          </label>
          <input
            id="preview-todo-input"
            type="text"
            value="새 할 일 제목"
            readOnly
            disabled
            aria-disabled="true"
          />

          <label className="sr-only" htmlFor="preview-due-input">
            마감기한
          </label>
          <input
            id="preview-due-input"
            className="due-input"
            type="datetime-local"
            value="2026-02-18T09:00"
            readOnly
            disabled
            aria-disabled="true"
          />

          <button type="button" disabled aria-disabled="true">
            추가
          </button>
        </form>

        <div className="preview-block">
          <h2>메모</h2>
          <textarea
            className="preview-note-input"
            rows={3}
            value="할 일 상세 메모를 간단히 기록할 수 있습니다."
            readOnly
            disabled
            aria-disabled="true"
          />
        </div>

        <div className="preview-block">
          <h2>파일 첨부</h2>
          <div className="preview-upload">
            <p>드래그 앤 드롭 또는 파일 선택</p>
            <button type="button" className="action-btn" disabled aria-disabled="true">
              파일 선택
            </button>
          </div>
        </div>

        <div className="toolbar">
          <div className="filters" role="group" aria-label="할 일 필터">
            <button type="button" className="filter-btn active" aria-pressed="true">
              전체
            </button>
            <button type="button" className="filter-btn" aria-pressed="false">
              진행중
            </button>
            <button type="button" className="filter-btn" aria-pressed="false">
              완료
            </button>
          </div>

          <p className="todo-count" aria-live="polite">
            전체 2 · 진행중 1 · 완료 1
          </p>
        </div>

        <ul className="todo-list" aria-live="polite">
          {mockTodos.map((todo, index) => {
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
                  readOnly
                  disabled
                  aria-label={`${todo.text} 완료 상태`}
                />

                <div className="todo-main">
                  <p className="todo-text">{todo.text}</p>
                  <p className="todo-meta">
                    <span className="todo-due-chip">마감 {todo.due}</span>
                    {todo.note ? <span className="todo-meta-item">메모 있음</span> : null}
                    <span className="todo-meta-item">첨부 {todo.files}개</span>
                  </p>
                </div>

                <div className="todo-actions">
                  <button type="button" className="action-btn" disabled aria-disabled="true">
                    수정
                  </button>
                  <button type="button" className="action-btn" disabled aria-disabled="true">
                    삭제
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
