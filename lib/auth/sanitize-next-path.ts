export function sanitizeNextPath(rawPath: string | null | undefined): string {
  if (!rawPath || !rawPath.startsWith("/")) {
    return "/";
  }

  if (rawPath.startsWith("//")) {
    return "/";
  }

  return rawPath;
}
