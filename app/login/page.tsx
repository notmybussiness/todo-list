import { redirect } from "next/navigation";

import { AuthProviders } from "@/app/components/auth-providers";
import { DevEmailAuth } from "@/app/components/dev-email-auth";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

const errorMessages: Record<string, string> = {
  invalid_provider: "지원하지 않는 로그인 제공자입니다.",
  oauth_start_failed: "로그인 화면으로 이동하지 못했습니다. 잠시 후 다시 시도해주세요.",
  oauth_callback_failed: "로그인 확인에 실패했습니다. 다시 시도해주세요."
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const errorCode = searchParams?.error ?? "";
  const errorMessage = errorMessages[errorCode] ?? "";
  const showDevLogin =
    process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true" || process.env.NODE_ENV !== "production";

  return (
    <main className="app-shell">
      <section className="todo-app auth-card" aria-label="로그인">
        <header className="app-header">
          <p className="eyebrow">Daily Focus</p>
          <h1>로그인</h1>
          <p className="subtitle">Google 또는 Kakao 계정으로 로그인하고 개인 TODO를 관리하세요.</p>
        </header>

        <AuthProviders />
        {showDevLogin ? <DevEmailAuth /> : null}
        <p className="form-message" role="status" aria-live="polite">
          {errorMessage}
        </p>
      </section>
    </main>
  );
}
