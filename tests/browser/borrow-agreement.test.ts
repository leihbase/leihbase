import { expect, test, type Page } from "@playwright/test";
import {
  createBorrowAgreement,
  getBorrowAgreementAcceptances,
} from "../lib/borrowAgreement";
import { createLocation } from "../lib/location";
import { login } from "../lib/login";
import { createProduct } from "../lib/product";
import { createReservation, reserve } from "../lib/reservation";
import { createUser } from "../lib/user";
import { getFutureDate, uniqueId } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

/**
 * Creates a location with a borrow agreement and a product, and logs in a new
 * user
 */
async function setup(page: Page, { optional = false } = {}) {
  const location = await createLocation("multiple");
  const borrowAgreement = await createBorrowAgreement(
    location,
    "<p>Return items clean.</p>"
  );
  if (optional) {
    const pb = await pocketbase();
    await pb
      .collection("location")
      .update(location.id, { borrow_agreement_optional: true });
  }
  const product = await createProduct(location);
  const email = `borrow-agreement-${uniqueId()}@example.com`;
  const password = "123456789";
  const user = await createUser(email, password);
  await login(page, email, password);
  return { location, borrowAgreement, product, user };
}

/**
 * Returns the reservations of the user
 */
async function getReservations(userId: string) {
  const pb = await pocketbase();
  return pb.collection("reservations").getFullList({
    filter: pb.filter("user = {:user}", { user: userId }),
  });
}

test.describe("borrow agreement", () => {
  test("user accepts the borrow agreement before their first reservation", async ({
    page,
  }) => {
    const location = await createLocation("multiple");
    const borrowAgreement = await createBorrowAgreement(
      location,
      "<p>Return items clean.</p>"
    );
    const firstProduct = await createProduct(location);
    const secondProduct = await createProduct(location);
    const email = `borrow-agreement-${uniqueId()}@example.com`;
    const password = "123456789";
    const user = await createUser(email, password);
    await login(page, email, password);

    // First reservation shows the borrow agreement
    await page.goto(`/l/${location.slug}/p/${firstProduct.id}`);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("borrow-agreement-content")).toContainText(
      "Return items clean."
    );
    await expect(page.getByTestId("opening-hours")).toBeHidden();
    await page.getByTestId("borrow-agreement-checkbox").check();
    await page.getByTestId("reserve-submit").click();
    await expect(page.getByTestId("opening-hours")).toBeHidden();

    const acceptances = await getBorrowAgreementAcceptances(user.id);
    expect(acceptances.map((a) => a.borrow_agreement)).toEqual([
      borrowAgreement.id,
    ]);

    // Second reservation doesn't show the borrow agreement again
    await page.goto(`/l/${location.slug}/p/${secondProduct.id}`);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
    await expect(page.getByTestId("borrow-agreement-content")).toBeHidden();
    const pb = await pocketbase();
    const reservations = await pb.collection("reservations").getFullList({
      filter: pb.filter("user = {:user}", { user: user.id }),
    });
    expect(reservations.length).toBe(2);
  });

  test("an unavailable product shows an error before the borrow agreement", async ({
    page,
  }) => {
    const { location, product, user } = await setup(page);
    const pb = await pocketbase();
    await createReservation(pb, {
      user: user.id,
      product: product.id,
      location: location.id,
      start: getFutureDate(1),
      end: getFutureDate(2),
    });

    await page.goto(`/l/${location.slug}/p/${product.id}`);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("reservation-form-error")).toBeVisible();
    await expect(page.getByTestId("borrow-agreement-content")).toBeHidden();
  });

  test("an optional borrow agreement can be accepted after reserving", async ({
    page,
  }) => {
    const { location, borrowAgreement, product, user } = await setup(page, {
      optional: true,
    });

    await page.goto(`/l/${location.slug}/p/${product.id}`);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("borrow-agreement-content")).toContainText(
      "Return items clean."
    );
    await expect(page.getByTestId("borrow-agreement-checkbox")).toBeHidden();
    // The reservation has already been created
    expect(await getReservations(user.id)).toHaveLength(1);

    await page.getByTestId("reserve-submit").click();
    await expect(page.getByTestId("borrow-agreement-content")).toBeHidden();
    const acceptances = await getBorrowAgreementAcceptances(user.id);
    expect(acceptances.map((a) => a.borrow_agreement)).toEqual([
      borrowAgreement.id,
    ]);
  });

  test("accepting an optional borrow agreement can be skipped", async ({
    page,
  }) => {
    const { location, product, user } = await setup(page, { optional: true });

    await page.goto(`/l/${location.slug}/p/${product.id}`);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("borrow-agreement-content")).toBeVisible();

    await page.getByTestId("borrow-agreement-later").click();
    await expect(page.getByTestId("borrow-agreement-content")).toBeHidden();
    expect(await getReservations(user.id)).toHaveLength(1);
    expect(await getBorrowAgreementAcceptances(user.id)).toHaveLength(0);
  });
});
