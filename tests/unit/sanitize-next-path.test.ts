import { describe, expect, it } from "vitest";

import { sanitizeNextPath } from "@/lib/auth/sanitize-next-path";

describe("sanitizeNextPath", () => {
  it("returns / for null, empty, or non-path values", () => {
    expect(sanitizeNextPath(null)).toBe("/");
    expect(sanitizeNextPath("")).toBe("/");
    expect(sanitizeNextPath("https://evil.example")).toBe("/");
    expect(sanitizeNextPath("javascript:alert(1)")).toBe("/");
  });

  it("returns / for protocol-relative paths", () => {
    expect(sanitizeNextPath("//evil.example/path")).toBe("/");
  });

  it("allows safe in-app paths", () => {
    expect(sanitizeNextPath("/")).toBe("/");
    expect(sanitizeNextPath("/todo")).toBe("/todo");
    expect(sanitizeNextPath("/todo?filter=active")).toBe("/todo?filter=active");
  });
});
