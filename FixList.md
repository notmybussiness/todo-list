# Fix List (Reference Only)

Primary priority board moved to:
- `/Users/gyu/Documents/todo_app/Task.md`

This file is kept only as historical context. New priority and release-gate updates must be recorded in `Task.md`.

## Carry-Over Notes

### Kakao Scope Duplication (Low Priority)
- Symptom: Kakao authorize URL query may include duplicated scope values.
- Risk: low immediate impact for MVP, but causes noisy auth URL construction.
- Follow-up: tracked as `P1-1` in `Task.md`.

### OAuth Completion Automation Gap
- Symptom: full Google/Kakao consent completion is difficult to automate in a stable way.
- Risk: callback-stage errors can be discovered late without manual gate checks.
- Follow-up: tracked as `P2-1` in `Task.md`.
