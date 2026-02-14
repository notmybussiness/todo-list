export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되어 있지 않습니다.");
  }
  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경변수가 설정되어 있지 않습니다.");
  }

  return {
    url,
    publishableKey,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? ""
  };
}
