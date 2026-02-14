import { NextResponse, type NextRequest } from "next/server";

import { OAUTH_PROVIDERS, type OAuthProviderName } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

function isProvider(value: string): value is OAuthProviderName {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

function sanitizeNextPath(rawPath: string | null): string {
  if (!rawPath || !rawPath.startsWith("/")) {
    return "/";
  }

  if (rawPath.startsWith("//")) {
    return "/";
  }

  return rawPath;
}

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider") ?? "";
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));

  if (!isProvider(provider)) {
    return NextResponse.redirect(new URL("/login?error=invalid_provider", request.url));
  }

  const supabase = createClient();
  const redirectTo = `${request.nextUrl.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      ...(provider === "kakao" ? { scopes: "account_email profile_nickname profile_image" } : {})
    }
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=oauth_start_failed", request.url));
  }

  return NextResponse.redirect(data.url);
}
