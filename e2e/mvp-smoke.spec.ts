import { expect, test } from "@playwright/test";

function uniqueTodo(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

const runDevLoginScenarios = process.env.E2E_USE_DEV_LOGIN !== "false";

test.describe("MVP Smoke", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");

    if (!/\/login(?:\?.*)?$/.test(page.url())) {
      const logoutButton = page.getByRole("button", { name: "로그아웃" });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      }
      await page.goto("/");
    }

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
    await expect(page.getByRole("heading", { name: "로그인", exact: true })).toBeVisible();
  });

  test("dev-login CRUD flow remains healthy", async ({ page }) => {
    test.skip(!runDevLoginScenarios, "Set E2E_USE_DEV_LOGIN=false to skip dev-login smoke scenarios.");

    const originalText = uniqueTodo("MVP-SMOKE");
    const updatedText = `${originalText}-EDIT`;
    const originalNote = "초기 메모";
    const updatedNote = "수정 메모";

    await page.goto("/login");

    const devLoginButton = page.getByRole("button", { name: "개발 계정으로 시작" });
    await expect(devLoginButton).toBeVisible();
    await devLoginButton.click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "TODO 리스트" })).toBeVisible();

    // Session should survive a refresh.
    await page.reload();
    await expect(page.getByRole("heading", { name: "TODO 리스트" })).toBeVisible();

    await page.locator("#todo-input").fill(originalText);
    await page.locator("#todo-note").fill(originalNote);
    await page.locator("#todo-period-trigger").click();
    await page.locator("#todo-start-at").fill("2026-02-19T09:00");
    await page.locator("#todo-due-at").fill("2026-02-19T10:00");
    await page.locator("#todo-files").setInputFiles("README.md");
    await expect(page.locator(".todo-upload-selected")).toContainText("README.md");
    await page.getByRole("button", { name: "추가" }).click();
    await expect(page.getByRole("button", { name: "추가" })).toBeEnabled();

    const createdItem = page.locator(".todo-item", { hasText: originalText }).first();
    await expect(createdItem).toBeVisible();

    await createdItem.locator("input.todo-toggle").click();
    await expect(createdItem).toHaveClass(/is-completed/);

    await page.getByRole("button", { name: "완료" }).click();
    await expect(page.locator(".todo-item", { hasText: originalText }).first()).toBeVisible();

    await page.getByRole("button", { name: "진행중" }).click();
    await expect(page.locator(".todo-item", { hasText: originalText })).toHaveCount(0);

    await page.getByRole("button", { name: "전체" }).click();

    const itemForEdit = page.locator(".todo-item", { hasText: originalText }).first();
    await itemForEdit.getByRole("button", { name: "수정" }).click();
    const editInput = page.locator(".edit-input").first();
    await expect(editInput).toBeVisible();
    await editInput.fill(updatedText);
    await page.locator(".edit-note-input").first().fill(updatedNote);
    await editInput.press("Enter");

    const updatedItem = page.locator(".todo-item", { hasText: updatedText }).first();
    await expect(updatedItem).toBeVisible();
    await expect(updatedItem).toContainText(updatedNote);

    await updatedItem.getByRole("button", { name: "삭제" }).click();
    await expect(page.locator(".todo-item", { hasText: updatedText })).toHaveCount(0);
  });

  test("todo length validation blocks 200+ chars", async ({ page }) => {
    test.skip(!runDevLoginScenarios, "Set E2E_USE_DEV_LOGIN=false to skip dev-login smoke scenarios.");

    await page.goto("/login");
    await page.getByRole("button", { name: "개발 계정으로 시작" }).click();
    await expect(page).toHaveURL(/\/$/);

    const tooLong = "a".repeat(201);
    await page.locator("#todo-input").fill(tooLong);
    await page.getByRole("button", { name: "추가" }).click();

    await expect(page.locator("#form-message")).toContainText("200자");
  });
});
