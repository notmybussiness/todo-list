# MVP Task Board (Single Source of Truth)

Last Updated: 2026-02-14 (KST)
Owner Branch: `codex/nextjs-supabase-vercel-migration`

## Release Gate (MVP)
- Rule: at least one login method must complete end-to-end, and user-scoped Todo features must work in production.
- Scope: feature-focused MVP (operations hardening is out of current scope).

## Current Verification Snapshot
- [x] `npm run lint` passes (2026-02-14)
- [x] `npm run build` passes (2026-02-14)
- [x] `npm run test:unit` passes (2026-02-15)
- [x] `npm run test:e2e` passes (2026-02-15, local dev-login smoke)
- [x] Vercel production deployment status is `Ready` (2026-02-14)
- [x] Production `/` redirects unauthenticated users to `/login` (2026-02-14)
- [x] Google/Kakao OAuth start redirects are reachable (2026-02-14)
- [x] Local smoke E2E with dev login passed: create/update/toggle/filter/delete (2026-02-14)
- [x] Production redirect smoke E2E passed (2026-02-14, `E2E_USE_DEV_LOGIN=false`)
- [ ] Production login completion (at least one method) is manually verified
- [ ] Production authenticated CRUD is manually verified
- [ ] RLS user isolation scenario (A/B users) is manually verified

## P0 (MVP Blockers)
- [ ] **P0-1: Validate one production login completion**
  - Goal: complete at least one method (Google or Kakao or Email) from `/login` to `/` callback return.
  - Done when:
    - one successful manual run is recorded on production URL.
    - if failed, capture root cause and screenshot evidence.

- [ ] **P0-2: Production authenticated Todo smoke**
  - Goal: after successful login, verify add/edit/toggle/filter/delete and refresh persistence.
  - Done when:
    - one integrated scenario passes on production.

- [ ] **P0-3: OAuth allowlist lock**
  - Goal: Supabase URL Configuration and Google/Kakao callback/redirect allowlist are consistent.
  - Done when:
    - preview and production callback entries are both confirmed.
    - OAuth start/callback path mismatch does not occur.
  - Evidence:
    - 2026-02-14 production `/auth/login?provider=google|kakao` returns 307 to Supabase authorize endpoint.
    - Supabase authorize endpoint returns 302 to provider (`accounts.google.com`, `kauth.kakao.com`).

- [ ] **P0-4: RLS cross-user data isolation**
  - Goal: validate `auth.uid() = user_id` policy behavior with two different users.
  - Done when:
    - user A's todos are not visible to user B, and vice versa.

## P1 (Post-MVP Early)
- [x] **P1-1: Kakao scope duplication cleanup**
  - File: `/Users/gyu/Documents/todo_app/app/auth/login/route.ts`
  - Goal: remove duplicated Kakao scopes in authorize URL.
  - Status:
    - custom Kakao scopes override removed from route options.
    - provider scopes are now managed in Supabase provider settings only.

- [x] **P1-2: Add Playwright smoke test entry**
  - Files:
    - `/Users/gyu/Documents/todo_app/playwright.config.ts`
    - `/Users/gyu/Documents/todo_app/e2e/mvp-smoke.spec.ts`
  - Goal: keep MVP gate checks reproducible.

- [x] **P1-3: Remove hard guard and switch to process checklist**
  - Files:
    - `/Users/gyu/Documents/todo_app/.github/pull_request_template.md`
    - `/Users/gyu/Documents/todo_app/README.md`
  - Goal: manage `Task.md` sync via PR/review checklist, not commit blocking.

- [ ] **P1-4: Standardize login failure UX copy**
  - File: `/Users/gyu/Documents/todo_app/app/login/page.tsx`
  - Goal: unify provider-specific failure guidance.

- [x] **P1-5: Add unit test layer (Vitest)**
  - Files:
    - `/Users/gyu/Documents/todo_app/vitest.config.ts`
    - `/Users/gyu/Documents/todo_app/tests/unit/sanitize-next-path.test.ts`
    - `/Users/gyu/Documents/todo_app/tests/unit/todo-validation.test.ts`
  - Goal: validate auth redirect path sanitation and todo text validation.

- [x] **P1-6: Add CI pipeline for unit/build and E2E smoke**
  - File:
    - `/Users/gyu/Documents/todo_app/.github/workflows/ci.yml`
  - Goal: require `ci-unit-build` and `ci-e2e-smoke` checks before merge.

- [x] **P1-7: Improve Todo UX latency with optimistic UI updates**
  - File:
    - `/Users/gyu/Documents/todo_app/app/components/todo-app.tsx`
  - Goal: apply create/toggle/update/delete immediately on client and rollback on failure.

## P2 (Backlog)
- [ ] **P2-1: Extend automated E2E for production callback completion**
  - Goal: add safe test harness strategy for external IdP callback verification.

- [ ] **P2-2: Add release checklist template for each deployment**
  - Goal: enforce pre-release and post-release checks as a repeated routine.

## Manual Run Log
- 2026-02-14: baseline checks completed (lint/build/deploy ready/redirect/OAuth start/local dev-login CRUD).
- 2026-02-14: task hard-guard removed, PR/review checklist process adopted.
- 2026-02-14: production redeployed (`dpl_D3XuDU2DQ5fLUFgRc1JevcvntFJH`, alias `todoapp-seven-taupe-34.vercel.app`).
- 2026-02-14: production E2E smoke on deployed URL passed (`1 passed / 2 skipped` with `E2E_USE_DEV_LOGIN=false`).
- 2026-02-15: unit test layer(vitest) + CI workflow(`ci-unit-build`, `ci-e2e-smoke`) added and local verification passed.
- 2026-02-15: removed Kakao scope override in route and added optimistic todo UI updates (create/toggle/update/delete).
