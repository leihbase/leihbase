import { expect, test } from "@playwright/test";
import { uniqueId, waitForClientMount, waitForHydration } from "../lib/utils";

test.describe("signup", () => {
  test("can reach signup from homepage", async ({ page, isMobile }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.locator("header").getByTestId("menu-button").click();
    await page.locator("header").getByTestId("signup-link").click();
    await page.waitForURL(/\/signup/);
    await expect(page.getByTestId("signup-h1")).toBeVisible();
  });
  test("can sign up", async ({ page }) => {
    // page.on("console", (msg) => {
    //   console.log(msg);
    // });
    await page.goto("/signup");
    await waitForHydration(page);
    await waitForClientMount(page.getByTestId("submit-button"));
    await page.getByTestId("name-input").fill("John");
    await page
      .getByTestId("email-input")
      .fill(`john-${uniqueId()}@example.com`);
    await page.getByTestId("password-input").fill("123456789");
    await page.getByTestId("tac-checkbox").check();
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("signup-error")).toHaveCount(0);
    // await page.screenshot({ path: "test.png", fullPage: true });
    await page.waitForURL(/\/profile/);
    await expect(page).toHaveURL("/profile");
  });
  test("requires accepting terms and conditions", async ({ page }) => {
    await page.goto("/signup");
    await waitForHydration(page);
    await waitForClientMount(page.getByTestId("submit-button"));
    await page.getByTestId("name-input").fill("John");
    await page
      .getByTestId("email-input")
      .fill(`john-${uniqueId()}@example.com`);
    await page.getByTestId("password-input").fill("123456789");
    await page.getByTestId("submit-button").click();
    await expect(
      page.locator("[data-testid=tac-checkbox][required]:invalid")
    ).toHaveCount(1);
  });
});
