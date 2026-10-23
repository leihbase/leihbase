import { expect, test } from "@playwright/test";
import { createBorrowAgreement } from "../lib/borrowAgreement";
import { createLocation } from "../lib/location";
import { login } from "../lib/login";
import { createProduct } from "../lib/product";
import { reserve } from "../lib/reservation";
import { createUser } from "../lib/user";
import { uniqueId } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

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

    const pb = await pocketbase();
    const updatedUser = await pb.collection("users").getOne(user.id);
    expect(updatedUser.accepted_borrow_agreements).toEqual([
      borrowAgreement.id,
    ]);

    // Second reservation doesn't show the borrow agreement again
    await page.goto(`/l/${location.slug}/p/${secondProduct.id}`);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
    await expect(page.getByTestId("borrow-agreement-content")).toBeHidden();
    const reservations = await pb.collection("reservations").getFullList({
      filter: pb.filter("user = {:user}", { user: user.id }),
    });
    expect(reservations.length).toBe(2);
  });
});
