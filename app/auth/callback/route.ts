import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

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
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
