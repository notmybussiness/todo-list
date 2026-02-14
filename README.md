# Next.js Todo App (Supabase OAuth)

Next.js(App Router + TypeScript) 기반 TODO 앱입니다.
Google/Kakao OAuth 로그인 후 사용자별 TODO를 분리 관리합니다.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase Auth + Postgres + RLS
- Vercel

## Environment Variables

`.env.local` 파일에 아래 값을 설정하세요.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR_PRODUCTION_DOMAIN
NEXT_PUBLIC_ENABLE_DEV_LOGIN=false # Production must stay false
NEXT_PUBLIC_DEV_LOGIN_EMAIL=dev.e2e@example.com
NEXT_PUBLIC_DEV_LOGIN_PASSWORD=DevLogin#123456
```

## Supabase Setup

1. Supabase 프로젝트 생성
2. SQL Editor에서 `/Users/gyu/Documents/todo_app/supabase/migrations/20260214193000_create_todos.sql` 실행
3. Authentication > Providers에서 Google, Kakao 활성화
4. Authentication > URL Configuration 설정

- Site URL: Production 도메인
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://*-<team-or-account-slug>.vercel.app/**`
  - `https://<your-production-domain>/**`

## Run Local

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## Dev Login (Optional)

OAuth 설정 전 E2E를 위해 개발용 이메일 로그인 UI를 사용할 수 있습니다.

```bash
NEXT_PUBLIC_ENABLE_DEV_LOGIN=true
NEXT_PUBLIC_DEV_LOGIN_EMAIL=dev.e2e@example.com
NEXT_PUBLIC_DEV_LOGIN_PASSWORD=DevLogin123456!
```

## Build Check

```bash
npm run lint
npm run build
```

## E2E Smoke (Playwright)

`Task.md` 기준 MVP 게이트를 반복 검증하기 위한 스모크 테스트입니다.

```bash
npx playwright install chromium
npm run test:e2e
```

기본 실행은 로컬 `http://127.0.0.1:3001` 서버를 자동 기동합니다.

- 배포 URL 대상으로 리다이렉트만 점검:
  - `E2E_BASE_URL=https://your-domain.vercel.app E2E_USE_DEV_LOGIN=false npm run test:e2e`
- 로컬 dev-login 포함 전체 CRUD 스모크:
  - `npm run test:e2e`

리포트 위치:
- `playwright-report/`
- `test-results/`

## Deploy (Vercel)

### Preview

```bash
vercel deploy -y
```

### Production

```bash
vercel deploy --prod -y
```

배포 전에 Vercel 프로젝트 환경변수(Development/Preview/Production)에 동일한 Supabase 값을 설정하세요.

## Priority Board

MVP 우선순위와 릴리스 게이트의 단일 원본은 `/Users/gyu/Documents/todo_app/Task.md`입니다.
