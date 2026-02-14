"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const FALLBACK_DEV_EMAIL = "dev.e2e@example.com";
const FALLBACK_DEV_PASSWORD = "DevLogin123456!";

function toFriendlyMessage(raw: string): string {
  const message = raw.toLowerCase();

  if (message.includes("email not confirmed")) {
    return "개발 계정이 생성됐지만 이메일 인증이 필요합니다. Supabase Auth 설정에서 Confirm email을 꺼주세요.";
  }
  if (message.includes("invalid login credentials")) {
    return "개발 계정 로그인에 실패했습니다. 이메일/비밀번호를 다시 확인해주세요.";
  }

  return raw;
}

export function DevEmailAuth() {
  const router = useRouter();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL ?? FALLBACK_DEV_EMAIL);
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD ?? FALLBACK_DEV_PASSWORD
  );
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const signInOrSignUp = async (nextEmail: string, nextPassword: string) => {
    const supabase = createClient();
    const signInResult = await supabase.auth.signInWithPassword({
      email: nextEmail,
      password: nextPassword
    });

    if (!signInResult.error) {
      return;
    }

    const signUpResult = await supabase.auth.signUp({
      email: nextEmail,
      password: nextPassword
    });

    if (signUpResult.error) {
      throw new Error(signUpResult.error.message);
    }

    if (!signUpResult.data.session) {
      const retrySignInResult = await supabase.auth.signInWithPassword({
        email: nextEmail,
        password: nextPassword
      });
      if (retrySignInResult.error) {
        throw new Error(retrySignInResult.error.message);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const nextEmail = email.trim();
    const nextPassword = password.trim();

    if (!nextEmail || !nextPassword) {
      setMessage("개발 계정 이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setPending(true);

    try {
      await signInOrSignUp(nextEmail, nextPassword);
      router.replace("/");
      router.refresh();
    } catch (error) {
      const fallbackMessage = "개발 로그인 처리 중 오류가 발생했습니다.";
      const rawMessage = error instanceof Error ? error.message : fallbackMessage;
      setMessage(toFriendlyMessage(rawMessage));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="dev-auth" aria-label="개발용 로그인">
      <h2>개발용 로그인</h2>
      <p className="dev-auth-subtitle">
        OAuth 설정이 완료되기 전 테스트를 위해 이메일 계정을 자동 생성/로그인합니다.
      </p>
      <form className="dev-auth-form" onSubmit={handleSubmit}>
        <label htmlFor="dev-email">개발 계정 이메일</label>
        <input
          id="dev-email"
          className="dev-auth-input"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="dev.e2e@example.com"
          required
          disabled={pending}
        />

        <label htmlFor="dev-password">개발 계정 비밀번호</label>
        <input
          id="dev-password"
          className="dev-auth-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="8자 이상 비밀번호"
          required
          disabled={pending}
        />

        <button type="submit" className="dev-auth-btn" disabled={pending}>
          {pending ? "처리 중..." : "개발 계정으로 시작"}
        </button>
      </form>

      <p className="form-message" role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
