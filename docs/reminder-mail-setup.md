# 마감 알림 메일 설정

## 1) Supabase
- SQL Editor에서 아래 migration을 실행합니다.
  - `supabase/migrations/20260219152000_add_todo_details_and_attachments.sql`
  - `supabase/migrations/20260219163000_add_todo_reminder_sent_at.sql`

## 2) Vercel Environment Variables
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE` (`true` or `false`)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_FROM_NAME` (optional)

## 3) Cron 호출 경로
- `vercel.json`에 `/api/cron/reminders`가 **하루 1회(매일 09:00 UTC)** 로 등록되어 있습니다.
- 배포 후 Vercel Cron이 자동 호출합니다.

## 4) 수동 점검
- 요청:
  - `GET /api/cron/reminders`
  - Header: `Authorization: Bearer <CRON_SECRET>`
- 응답 예시:
  - `scanned`: 점검된 todo 개수
  - `sent`: 발송 성공 개수
  - `failed`: 발송 실패 개수
  - `errors`: 실패 상세
