import Link from "next/link";

export function AuthProviders() {
  return (
    <div className="oauth-buttons" role="group" aria-label="소셜 로그인">
      <Link href="/auth/login?provider=google" className="oauth-btn google-btn">
        Google로 로그인
      </Link>
      <Link href="/auth/login?provider=kakao" className="oauth-btn kakao-btn">
        Kakao로 로그인
      </Link>
    </div>
  );
}
