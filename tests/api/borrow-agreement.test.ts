import { expect, test } from "@playwright/test";
import { ClientResponseError } from "pocketbase";
import { createBorrowAgreement } from "../lib/borrowAgreement";
import { createLocation } from "../lib/location";
import { createProduct } from "../lib/product";
import { createReservation } from "../lib/reservation";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { getFutureDate } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

test.describe("borrow agreement", () => {
  test("reservation is rejected if the borrow agreement isn't accepted", async () => {
    const location = await createLocation("multiple");
    await createBorrowAgreement(location);
    const product = await createProduct(location);
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

    await expect(
      createReservation(userPb, {
        user: user.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(1),
        end: getFutureDate(2),
      })
    ).rejects.toThrow("Borrow_agreement_not_accepted.");
  });

  test("accepting the borrow agreement stores it on the user and reservation", async () => {
    const pb = await pocketbase();
    const location = await createLocation("multiple");
    const borrowAgreement = await createBorrowAgreement(location);
    const product = await createProduct(location);
    const secondProduct = await createProduct(location);
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

    const reservation = await userPb.collection("reservations").create({
      user: user.id,
      product: product.id,
      start: getFutureDate(1),
      end: getFutureDate(2),
      borrow_agreement: borrowAgreement.id,
    });
    expect(reservation.borrow_agreement).toBe(borrowAgreement.id);
    const updatedUser = await pb.collection("users").getOne(user.id);
    expect(updatedUser.accepted_borrow_agreements).toEqual([
      borrowAgreement.id,
    ]);

    // A next reservation doesn't require accepting the agreement again
    const secondReservation = await createReservation(userPb, {
      user: user.id,
      product: secondProduct.id,
      location: location.id,
      start: getFutureDate(3),
      end: getFutureDate(4),
    });
    expect(secondReservation.borrow_agreement).toBe(borrowAgreement.id);
  });

  test("a new borrow agreement version has to be accepted again", async () => {
    const location = await createLocation("multiple");
    const firstBorrowAgreement = await createBorrowAgreement(location);
    const product = await createProduct(location);
    const secondProduct = await createProduct(location);
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

    await userPb.collection("reservations").create({
      user: user.id,
      product: product.id,
      start: getFutureDate(1),
      end: getFutureDate(2),
      borrow_agreement: firstBorrowAgreement.id,
    });

    const secondBorrowAgreement = await createBorrowAgreement(
      location,
      "<p>New conditions.</p>"
    );

    // Accepting the outdated borrow agreement is rejected
    await expect(
      userPb.collection("reservations").create({
        user: user.id,
        product: secondProduct.id,
        start: getFutureDate(3),
        end: getFutureDate(4),
        borrow_agreement: firstBorrowAgreement.id,
      })
    ).rejects.toThrow("Borrow_agreement_not_accepted.");

    // Accepting the current borrow agreement succeeds
    const reservation = await userPb.collection("reservations").create({
      user: user.id,
      product: secondProduct.id,
      start: getFutureDate(3),
      end: getFutureDate(4),
      borrow_agreement: secondBorrowAgreement.id,
    });
    expect(reservation.borrow_agreement).toBe(secondBorrowAgreement.id);
  });

  test("a minor edit of the borrow agreement keeps it accepted", async () => {
    const location = await createLocation("multiple");
    const borrowAgreement = await createBorrowAgreement(location);
    const product = await createProduct(location);
    const secondProduct = await createProduct(location);
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
    const admin = await createUser(undefined, undefined, "admin");
    const adminPb = await pocketbase(admin.email, DEFAULT_PASSWORD, false);

    await userPb.collection("reservations").create({
      user: user.id,
      product: product.id,
      start: getFutureDate(1),
      end: getFutureDate(2),
      borrow_agreement: borrowAgreement.id,
    });

    await adminPb.collection("borrow_agreements").update(borrowAgreement.id, {
      content: "<p>Handle borrowed items with great care.</p>",
    });

    await expect(
      createReservation(userPb, {
        user: user.id,
        product: secondProduct.id,
        location: location.id,
        start: getFutureDate(3),
        end: getFutureDate(4),
      })
    ).resolves.toBeDefined();
  });

  test("a failed reservation doesn't accept the borrow agreement", async () => {
    const pb = await pocketbase();
    const location = await createLocation("multiple");
    const borrowAgreement = await createBorrowAgreement(location);
    const product = await createProduct(location);
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

    // Reservation longer than max_reservation_days
    await expect(
      userPb.collection("reservations").create({
        user: user.id,
        product: product.id,
        start: getFutureDate(1),
        end: getFutureDate(30),
        borrow_agreement: borrowAgreement.id,
      })
    ).rejects.toThrow(ClientResponseError);

    const updatedUser = await pb.collection("users").getOne(user.id);
    expect(updatedUser.accepted_borrow_agreements).toEqual([]);
  });

  test("managers can create reservations without the borrow agreement being accepted", async () => {
    const location = await createLocation("multiple");
    await createBorrowAgreement(location);
    const product = await createProduct(location);
    const user = await createUser();
    const manager = await createUser(undefined, undefined, "manager", [
      location.id,
    ]);
    const managerPb = await pocketbase(manager.email, DEFAULT_PASSWORD, false);

    const reservation = await createReservation(managerPb, {
      user: user.id,
      product: product.id,
      location: location.id,
      start: getFutureDate(1),
      end: getFutureDate(2),
    });
    expect(reservation.borrow_agreement).toBe("");
  });

  test("only admins can create and edit borrow agreements", async () => {
    const location = await createLocation("multiple");
    const borrowAgreement = await createBorrowAgreement(location);
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
    const location = await createLocation("multiple");
    const borrowAgreement = await createBorrowAgreement(location);
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

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
