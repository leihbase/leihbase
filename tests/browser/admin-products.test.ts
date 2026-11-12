import { expect, test } from "@playwright/test";
import type { Location } from "../../web/models/location";
import { createLocation } from "../lib/location";
import { login } from "../lib/login";
import { createProduct } from "../lib/product";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { waitForHydration } from "../lib/utils";

// Filters are selected with the keyboard: the browser
// then fires input and change as separate events

test.describe("admin product filters", () => {
  let location: Location;

  test.beforeEach(async ({ page }) => {
    location = await createLocation("multiple");
    const manager = await createUser(undefined, undefined, "manager", [
      location.id,
    ]);
    await login(page, manager.email, DEFAULT_PASSWORD);
  });

  test("status applies the option that was selected", async ({ page }) => {
    const active = await createProduct(location);
    const inactive = await createProduct(location, { active: false });
    const activeCard = page.getByTestId(`product-card-${active.id}`);
    const inactiveCard = page.getByTestId(`product-card-${inactive.id}`);

    await page.goto(`/admin/${location.slug}/products`);
    await waitForHydration(page);
    await expect(inactiveCard).toBeVisible();

    await page.getByLabel("Status").focus();
    await page.keyboard.press("ArrowDown"); // Active
    await expect(inactiveCard).toBeHidden();
    await expect(activeCard).toBeVisible();
    await page.keyboard.press("ArrowDown"); // Inactive
    await expect(activeCard).toBeHidden();
    await expect(inactiveCard).toBeVisible();
  });

  test("missing info applies the option that was selected", async ({
    page,
  }) => {
    const described = await createProduct(location);
    const undescribed = await createProduct(location, { description: "" });
    const describedCard = page.getByTestId(`product-card-${described.id}`);
    const undescribedCard = page.getByTestId(`product-card-${undescribed.id}`);

    await page.goto(`/admin/${location.slug}/products`);
    await waitForHydration(page);
    await expect(describedCard).toBeVisible();

    await page.getByLabel("Missing info").focus();
    await page.keyboard.press("ArrowDown"); // No photo
    await page.keyboard.press("ArrowDown"); // No description
    await expect(describedCard).toBeHidden();
    await expect(undescribedCard).toBeVisible();
  });
});
