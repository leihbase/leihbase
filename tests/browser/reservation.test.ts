import { expect, test } from "@playwright/test";
import { login } from "../lib/login";
import {
  createProduct,
  getLastProductReservation,
  navigateToProductPage,
  updateLastProductReservation,
} from "../lib/product";
import { reserve } from "../lib/reservation";
import { createUser } from "../lib/user";
import { uniqueId, waitForClientMount } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

test.describe("reservation", () => {
  test("visitor can reserve a product", async ({ page }) => {
    const product = await createProduct();

    await navigateToProductPage(page, product.id);

    // Click reserve (logged out)
    await waitForClientMount(page.getByTestId("reserve-button"));
    await page.getByTestId("reserve-button").click();
    await expect(page).toHaveURL("/signup");

    // Signup
    const email = `john-${uniqueId()}@example.com`;
    const password = "123456789";
    await page.getByTestId("name-input").fill("John2");
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill(password);
    await page.getByTestId("tac-checkbox").check();
    await page.getByTestId("submit-button").click();
    await page.waitForURL(/\/l\/test-store\/p\/(.+)/);

    // Set user as verified
    const pb = await pocketbase();
    const user = await pb
      .collection("users")
      .getFirstListItem(`email="${email}"`);
    await pb.collection("users").update(user.id, { verified: true });

    // Reserve
    await expect(page.url()).toContain("/l/test-store/p/");
    await reserve(page, 0, 1);

    await expect(page.getByTestId("opening-hours")).toBeHidden();
  });

  test("user can't access reservations of others", async ({ page }) => {
    // Create product, user, and reservation
    const product = await createProduct();
    const firstUserEmail = `a-${uniqueId()}@example.com`;
    const firstUserPassword = "123456789";
    await createUser(firstUserEmail, firstUserPassword);
    await login(page, firstUserEmail, firstUserPassword);
    await navigateToProductPage(page, product.id);
    await reserve(page, 0, 1);
    const firstUserPb = await pocketbase(
      firstUserEmail,
      firstUserPassword,
      false
    );
    const firstReservations = await firstUserPb
      .collection("reservations")
      .getFullList();
    // Expect the user to have 1 reservation
    expect(firstReservations.length).toBe(1);

    // Create second user
    const secondUserEmail = `b-${uniqueId()}@example.com`;
    const secondUserPassword = "123456789";
    await createUser(secondUserEmail, secondUserPassword);
    const secondUserPb = await pocketbase(
      secondUserEmail,
      secondUserPassword,
      false
    );
    const secondReservations = await secondUserPb
      .collection("reservations")
      .getFullList();
    // Expect the user to have no reservations
    expect(secondReservations.length).toBe(0);
  });

  test("user can't reserve the same product twice", async ({ page }) => {
    const product = await createProduct();
    await login(page);
    await navigateToProductPage(page, product.id);
    await reserve(page, 0, 1);
    await reserve(page, 2, 3);
    await expect(page.getByTestId("reservation-form-error")).toBeVisible();
  });

  test("user can reserve the same product again, when the first reservation is cancelled", async ({
    page,
  }) => {
    const product = await createProduct();
    await login(page);
    await navigateToProductPage(page, product.id);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
    await updateLastProductReservation(product.id, { cancelled: true });
    await reserve(page, 2, 3);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
  });

  test("user can reserve the same product again, when first reservation is in the past", async ({
    page,
  }) => {
    const product = await createProduct();
    await login(page);
    await navigateToProductPage(page, product.id);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
    const reservation = await getLastProductReservation(product.id);
    await updateLastProductReservation(product.id, {
      start: new Date(
        new Date(reservation.start).setDate(
          new Date(reservation.start).getDate() - 67
        )
      ),
      end: new Date(
        new Date(reservation.end).setDate(
          new Date(reservation.end).getDate() - 60
        )
      ),
    });
    await reserve(page, 2, 3);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
  });

  test("reservation period can't be longer than location's max_reservation_days", async ({
    page,
  }) => {
    const product = await createProduct();
    await login(page);
    await navigateToProductPage(page, product.id);
    await reserve(page, 0, 5);
    await expect(page.getByTestId("reservation-form-error")).toBeVisible();
  });
});
