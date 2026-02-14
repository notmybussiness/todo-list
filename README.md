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

## Build Check

```bash
npm run lint
npm run build
```

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
