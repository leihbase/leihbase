import { expect, test } from "@playwright/test";
import { login } from "../lib/login";
import { createProduct, navigateToProductPage } from "../lib/product";
import { waitForClientMount } from "../lib/utils";

test.describe("product page", () => {
  test("has screenshot", async ({ page }) => {
    const product = await createProduct();
    await navigateToProductPage(page, product.id);
    await expect(page).toHaveScreenshot("product-page.png");
  });
  test("reservation dialog has screenshot", async ({ page }) => {
    const product = await createProduct();
    await login(page);
    await navigateToProductPage(page, product.id);
    // Click reserve
    await waitForClientMount(page.getByTestId("reserve-button"));
    await page.getByTestId("reserve-button").click();
    // Reserve
    await expect(page.getByTestId("opening-hours")).toBeVisible();
    await expect(page).toHaveScreenshot("product-page-reservation-dialog.png");
  });
});
