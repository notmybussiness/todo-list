# Next.js Todo App

## 앱 소개
Google / Kakao OAuth 로그인 기반의 개인 Todo 앱입니다.  
사용자마다 할 일이 분리되어 저장되며, 추가/수정/삭제/필터 기능을 제공합니다.
제목+메모, 시작~마감 기간, 마감 알림 메일(Cron) 기능을 포함합니다.

## 사용 기술
- Next.js 14 (App Router)
- TypeScript
- Supabase Auth + Postgres + RLS
- Vercel
- Playwright (E2E)
- Vitest (Unit)
- SMTP (마감 알림 메일)

## 문제 해결
- 사용자별 데이터 분리:
  - Supabase RLS 정책으로 `auth.uid() = user_id` 데이터만 조회/수정 가능하게 구성
- 로그인/세션 처리:
  - Supabase SSR + OAuth 콜백 라우트로 Google/Kakao 로그인 흐름 구성
- 체감 속도 개선:
  - Todo 생성/수정/토글/삭제에 Optimistic UI 적용 (즉시 반영 후 실패 시 롤백)

## 운영 메모
- 알림 메일 설정 문서:
  - `docs/reminder-mail-setup.md`
