import { expect, test } from "@playwright/test";
import { createLocation } from "../lib/location";
import { login } from "../lib/login";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { waitForHydration } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

test.describe("location settings", () => {
  test("admin can edit notification addresses", async ({ page }) => {
    const pb = await pocketbase();
    const location = await createLocation("multiple");
    await pb
      .collection("location")
      .update(location.id, { notifications: ["anna@example.com"] });
    // Admins only see the locations they are assigned to
    const admin = await createUser(undefined, undefined, "admin", [
      location.id,
    ]);

    await login(page, admin.email, DEFAULT_PASSWORD);
    await page.goto(`/admin/${location.slug}/settings`);
    await waitForHydration(page);

    // Existing addresses are shown
    await expect(page.getByText("anna@example.com")).toBeVisible();

    // Invalid addresses are rejected
    await page.getByTestId("notification-input").fill("not-an-email");
    await page.getByTestId("notification-add").click();
    await expect(
      page.getByText("Please enter a valid email address.")
    ).toBeVisible();

    // Add an address with the button, and one by pressing enter
    await page.getByTestId("notification-input").fill("ben@example.com");
    await page.getByTestId("notification-add").click();
    await page.getByTestId("notification-input").fill("cleo@example.com");
    await page.getByTestId("notification-input").press("Enter");

    // Remove the existing address
    await page.getByRole("button", { name: "Remove anna@example.com" }).click();

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Settings saved.")).toBeVisible();

    const updated = await pb.collection("location").getOne(location.id);
    expect(updated.notifications).toEqual([
      "ben@example.com",
      "cleo@example.com",
    ]);
  });

  test("saves an address that was typed but not added", async ({ page }) => {
    const pb = await pocketbase();
    const location = await createLocation("multiple");
    const admin = await createUser(undefined, undefined, "admin", [
      location.id,
    ]);

    await login(page, admin.email, DEFAULT_PASSWORD);
    await page.goto(`/admin/${location.slug}/settings`);
    await waitForHydration(page);

    await expect(page.getByTestId("notifications-empty")).toBeVisible();
    await page.getByTestId("notification-input").fill("anna@example.com");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Settings saved.")).toBeVisible();

    const updated = await pb.collection("location").getOne(location.id);
    expect(updated.notifications).toEqual(["anna@example.com"]);
  });
});
