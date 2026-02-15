import { NextResponse, type NextRequest } from "next/server";

import { sanitizeNextPath } from "@/lib/auth/sanitize-next-path";
import { OAUTH_PROVIDERS, type OAuthProviderName } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

function isProvider(value: string): value is OAuthProviderName {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
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
      redirectTo
    }
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=oauth_start_failed", request.url));
  }

  return NextResponse.redirect(data.url);
}
