import { expect, test } from "@playwright/test";
import { ALL_DAYS_OPENING_HOURS, createLocation } from "../lib/location";
import { login } from "../lib/login";
import { createProduct } from "../lib/product";
import { createReservation } from "../lib/reservation";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { getFutureDate, waitForHydration } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

test.describe("opening hours", () => {
  test("manager can edit opening hours", async ({ page }) => {
    const pb = await pocketbase();
    const location = await createLocation("multiple");
    const manager = await createUser(undefined, undefined, "manager", [
      location.id,
    ]);

    await login(page, manager.email, DEFAULT_PASSWORD);
    await page.goto(`/admin/${location.slug}/opening-hours`);
    await waitForHydration(page);

    // Monday is closed by default, add a time range
    await page.getByTestId("opening-hours-monday-add").click();
    await page.getByTestId("opening-hours-save").click();
    await expect(
      page.getByText("Opening hours saved.")
    ).toBeVisible();

    const updated = await pb.collection("location").getOne(location.id);
    expect(updated.opening_hours.days.monday).toEqual([
      { from: "10:00", to: "18:00" },
    ]);
    // Existing opening hours are kept
    expect(updated.opening_hours.days.tuesday).toEqual([
      { from: "18:00", to: "19:00" },
    ]);
  });

  test("shows a warning for reservations on days being closed", async ({
    page,
  }) => {
    const location = await createLocation("multiple", ALL_DAYS_OPENING_HOURS);
    const product = await createProduct(location);
    const manager = await createUser(undefined, undefined, "manager", [
      location.id,
    ]);
    const managerPb = await pocketbase(manager.email, DEFAULT_PASSWORD, false);
    const start = getFutureDate(3);
    await createReservation(managerPb, {
      user: manager.id,
      product: product.id,
      location: location.id,
      start,
      end: getFutureDate(5),
    });

    await login(page, manager.email, DEFAULT_PASSWORD);
    await page.goto(`/admin/${location.slug}/opening-hours`);
    await waitForHydration(page);
    await expect(page.getByTestId("opening-hours-warning")).not.toBeVisible();

    // Close the day of the pickup
    const pickupDay = DAYS[start.getUTCDay()];
    await page.getByTestId(`opening-hours-${pickupDay}-0-remove`).click();

    const warning = page.getByTestId("opening-hours-warning");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(`Pickup of ${product.name}`);
  });
});
