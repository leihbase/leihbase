import { expect, test } from "@playwright/test";
import { login } from "../lib/login";
import { waitForHydration } from "../lib/utils";

test.describe("login", () => {
  test("can reach login", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByTestId("menu-button").click();
    await page.getByTestId("login-link").click();
    await expect(page.getByTestId("login-h1")).toBeVisible();
  });
  test("can log in", async ({ page }) => {
    await login(page);
  });
  test("can not log in with wrong email address", async ({ page }) => {
    await page.goto("/login");
    await waitForHydration(page);
    await page.getByTestId("email-input").fill("wrong@example.com");
    await page.getByTestId("password-input").fill("testtest");
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("login-error")).toHaveCount(1);
    await expect(page.getByTestId("login-error")).toContainText(
      "Log in not successful"
    );
  });
});
