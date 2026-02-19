# Todo 확장 단계 체크리스트

## Stage 1: 제목 + 메모 단일 레이아웃
- 구현 범위
  - Todo 생성/수정에 메모(`note`) 추가
  - 목록 카드에서 제목(`text`)과 메모를 함께 표시
- 통과 기준
  - 제목+메모 저장 후 새로고침 시 데이터 유지
  - 제목 200자, 메모 200자 제한 검증 동작

## Stage 2: 시작~마감 기간
- 구현 범위
  - Todo 생성/수정에 `start_at`, `due_at` 추가
  - 기간은 둘 다 입력하거나 둘 다 비움
  - `start_at <= due_at` 검증
- 통과 기준
  - 기간 저장 후 목록에서 기간 라벨 표시
  - 한쪽만 입력/역전 입력 시 에러 메시지 노출

## Stage 3: 파일첨부 준비 단계
- 구현 범위
  - 첨부 메타데이터 테이블(`todo_attachments`) + RLS 스키마 추가
  - 프론트에서 파일 선택 UI/선택 파일명 표시
  - 실제 Storage 업로드는 다음 단계에서 연결
- 통과 기준
  - 스키마 migration 반영 가능
  - UI에서 파일 선택 시 선택 결과 표시

## Stage 4: 마감 알림 메일(Cron + SMTP)
- 구현 범위
  - `/api/cron/reminders` 배치 엔드포인트 추가
  - `due_at <= now` 및 `reminder_sent_at is null` 조건으로 대상 조회
  - SMTP 발송 성공 시 `reminder_sent_at` 업데이트
  - Vercel Cron 스케줄(`vercel.json`, free tier 대응 하루 1회) 추가
- 통과 기준
  - 로컬/배포에서 크론 엔드포인트 인증(`CRON_SECRET`) 동작
  - 환경변수 누락 시 명확한 실패 메시지 반환
  - lint/unit/build/e2e 전체 통과

## Verify 커맨드
- `npm run lint`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e`
