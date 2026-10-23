import { expect, test } from "@playwright/test";
import Client, { ClientResponseError, type RecordModel } from "pocketbase";
import { createBorrowAgreement } from "../lib/borrowAgreement";
import { createLocation } from "../lib/location";
import { createProduct } from "../lib/product";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { getFutureDate } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

/**
 * Creates a location with a borrow agreement, two products and a user
 */
async function setup() {
  const location = await createLocation("multiple");
  const borrowAgreement = await createBorrowAgreement(location);
  const product = await createProduct(location);
  const secondProduct = await createProduct(location);
  const user = await createUser();
  const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
  return { location, borrowAgreement, product, secondProduct, user, userPb };
}

/**
 * Creates a reservation for the user, from `start` to `end` days from today,
 * optionally accepting the given borrow agreement
 */
function reserve(
  pb: Client,
  user: RecordModel,
  product: RecordModel,
  [start, end]: [number, number],
  borrowAgreement?: RecordModel
) {
  return pb.collection("reservations").create({
    user: user.id,
    product: product.id,
    start: getFutureDate(start),
    end: getFutureDate(end),
    borrow_agreement: borrowAgreement?.id,
  });
}

test.describe("borrow agreement", () => {
  test("reservation is rejected if the borrow agreement isn't accepted", async () => {
    const { product, user, userPb } = await setup();

    await expect(reserve(userPb, user, product, [1, 2])).rejects.toThrow(
      "Borrow_agreement_not_accepted."
    );
  });

  test("accepting the borrow agreement stores it on the user and reservation", async () => {
    const pb = await pocketbase();
    const { borrowAgreement, product, secondProduct, user, userPb } =
      await setup();

    const reservation = await reserve(
      userPb,
      user,
      product,
      [1, 2],
      borrowAgreement
    );
    expect(reservation.borrow_agreement).toBe(borrowAgreement.id);
    const updatedUser = await pb.collection("users").getOne(user.id);
    expect(updatedUser.accepted_borrow_agreements).toEqual([
      borrowAgreement.id,
    ]);

    // A next reservation doesn't require accepting the agreement again
    const secondReservation = await reserve(
      userPb,
      user,
      secondProduct,
      [3, 4]
    );
    expect(secondReservation.borrow_agreement).toBe(borrowAgreement.id);
  });

  test("a new borrow agreement version has to be accepted again", async () => {
    const { location, borrowAgreement, product, secondProduct, user, userPb } =
      await setup();
    await reserve(userPb, user, product, [1, 2], borrowAgreement);

    const newBorrowAgreement = await createBorrowAgreement(
      location,
      "<p>New conditions.</p>"
    );

    // Accepting the outdated borrow agreement is rejected
    await expect(
      reserve(userPb, user, secondProduct, [3, 4], borrowAgreement)
    ).rejects.toThrow("Borrow_agreement_not_accepted.");

    // Accepting the current borrow agreement succeeds
    const reservation = await reserve(
      userPb,
      user,
      secondProduct,
      [3, 4],
      newBorrowAgreement
    );
    expect(reservation.borrow_agreement).toBe(newBorrowAgreement.id);
  });

  test("a minor edit of the borrow agreement keeps it accepted", async () => {
    const { borrowAgreement, product, secondProduct, user, userPb } =
      await setup();
    const admin = await createUser(undefined, undefined, "admin");
    const adminPb = await pocketbase(admin.email, DEFAULT_PASSWORD, false);
    await reserve(userPb, user, product, [1, 2], borrowAgreement);

    await adminPb.collection("borrow_agreements").update(borrowAgreement.id, {
      content: "<p>Handle borrowed items with great care.</p>",
    });

    await expect(
      reserve(userPb, user, secondProduct, [3, 4])
    ).resolves.toBeDefined();
  });

  test("a failed reservation doesn't accept the borrow agreement", async () => {
    const pb = await pocketbase();
    const { borrowAgreement, product, user, userPb } = await setup();

    // Reservation longer than max_reservation_days
    await expect(
      reserve(userPb, user, product, [1, 30], borrowAgreement)
    ).rejects.toThrow(ClientResponseError);

    const updatedUser = await pb.collection("users").getOne(user.id);
    expect(updatedUser.accepted_borrow_agreements).toEqual([]);
  });

  test("managers can create reservations without the borrow agreement being accepted", async () => {
    const { location, product, user } = await setup();
    const manager = await createUser(undefined, undefined, "manager", [
      location.id,
    ]);
    const managerPb = await pocketbase(manager.email, DEFAULT_PASSWORD, false);

    const reservation = await reserve(managerPb, user, product, [1, 2]);
    expect(reservation.borrow_agreement).toBe("");
  });

  test("only admins can create and edit borrow agreements", async () => {
    const { location, borrowAgreement } = await setup();
    const manager = await createUser(undefined, undefined, "manager", [
      location.id,
    ]);
    const managerPb = await pocketbase(manager.email, DEFAULT_PASSWORD, false);
    const admin = await createUser(undefined, undefined, "admin");
    const adminPb = await pocketbase(admin.email, DEFAULT_PASSWORD, false);

    await expect(
      managerPb.collection("borrow_agreements").create({
        location: location.id,
        content: "<p>Manager conditions.</p>",
      })
    ).rejects.toThrow(ClientResponseError);
    await expect(
      managerPb.collection("borrow_agreements").update(borrowAgreement.id, {
        content: "<p>Manager conditions.</p>",
      })
    ).rejects.toThrow(ClientResponseError);
    await expect(
      managerPb
        .collection("location")
        .update(location.id, { borrow_agreement: "" })
    ).rejects.toThrow(ClientResponseError);

    const newBorrowAgreement = await adminPb
      .collection("borrow_agreements")
      .create({
        location: location.id,
        content: "<p>Admin conditions.</p>",
      });
    await expect(
      adminPb
        .collection("location")
        .update(location.id, { borrow_agreement: newBorrowAgreement.id })
    ).resolves.toBeDefined();
  });

  test("users can't accept borrow agreements by updating their own record", async () => {
    const { borrowAgreement, user, userPb } = await setup();

    await expect(
      userPb.collection("users").update(user.id, {
        accepted_borrow_agreements: [borrowAgreement.id],
      })
    ).rejects.toThrow(ClientResponseError);
    // Other fields can still be updated
    await expect(
      userPb.collection("users").update(user.id, { name: "New Name" })
    ).resolves.toBeDefined();
  });
});
