# Fix List (Priority Order)

## P1 - Dev Login E2E Blocked by Email Confirmation
- Symptom: 개발용 이메일 로그인에서 계정 생성 후 `Email not confirmed`로 세션 생성 실패.
- Risk: OAuth 없이 Todo CRUD E2E를 자동 검증할 수 없음.
- Action:
  - Supabase `Authentication > Providers > Email`에서 `Confirm email` 설정 해제(개발/테스트 환경 한정) 또는
  - 생성된 테스트 유저를 Auth Users 화면에서 수동 Confirm 처리.

## P2 - Kakao Client ID Mapping Verification
- Symptom: Kakao authorize URL에서 `client_id`가 REST API 키 대신 앱 이름(`todo_list`)으로 표시되는 케이스가 관측됨.
- Risk: 실제 로그인 완료 단계에서 `invalid_client` 오류 발생 가능.
- Action:
  - Supabase `Authentication > Providers > Kakao`의 `Client ID`가 REST API 키(`e5b155...`)인지 재확인.
  - 저장 후 Kakao 로그인 완료(콜백 후 `/` 복귀)까지 수동 재검증.

## P3 - Full OAuth Completion E2E Gap
- Symptom: 외부 IdP(Google/Kakao) 인증 완료(비밀번호/2FA/동의)까지는 자동 E2E로 완전 검증하기 어려움.
- Risk: 승인/동의 단계 이후 콜백 처리 오류가 늦게 발견될 수 있음.
- Action:
  - 배포 환경에서 최소 1회 수동 로그인 완료 테스트 수행.
  - 성공 계정 기준으로 회귀 점검 체크리스트 유지.

## P4 - Kakao Scope Duplication (Low Priority)
- Symptom: Kakao authorize URL query에서 scope 값이 중복되어 표시되는 케이스가 있음.
- Risk: 현재 로그인 차단 이슈는 아니며 기능 영향은 낮음.
- Action:
  - Supabase Kakao provider scope 설정과 앱 라우트 scope 파라미터를 재검토.
  - MVP 이후 리팩토링 단계에서 정리.
