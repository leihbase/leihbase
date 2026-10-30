import { expect, test } from "@playwright/test";
import Client, { ClientResponseError, type RecordModel } from "pocketbase";
import {
  createBorrowAgreement,
  getBorrowAgreementAcceptances,
} from "../lib/borrowAgreement";
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
 * Creates a user with the given role and returns it with a logged in client
 */
async function createStaff(
  role: "manager" | "admin",
  locations: string[] = []
) {
  const user = await createUser(undefined, undefined, role, locations);
  const pb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
  return { user, pb };
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

/**
 * Accepts the borrow agreement for the user, using the given client
 */
function accept(pb: Client, user: RecordModel, borrowAgreement: RecordModel) {
  return pb
    .collection("borrow_agreement_acceptances")
    .create({ user: user.id, borrow_agreement: borrowAgreement.id });
}

test.describe("borrow agreement", () => {
  test("reservation is rejected if the borrow agreement isn't accepted", async () => {
    const { product, user, userPb } = await setup();

    await expect(reserve(userPb, user, product, [1, 2])).rejects.toThrow(
      "Borrow_agreement_not_accepted."
    );
  });

  test("accepting the borrow agreement along with a reservation stores the acceptance", async () => {
    const { borrowAgreement, product, secondProduct, user, userPb } =
      await setup();

    await reserve(userPb, user, product, [1, 2], borrowAgreement);
    const acceptances = await getBorrowAgreementAcceptances(user.id);
    expect(acceptances).toHaveLength(1);
    expect(acceptances[0]!.borrow_agreement).toBe(borrowAgreement.id);
    expect(acceptances[0]!.recorded_by).toBe("");

    // A next reservation doesn't require accepting the agreement again
    await expect(
      reserve(userPb, user, secondProduct, [3, 4])
    ).resolves.toBeDefined();
    expect(await getBorrowAgreementAcceptances(user.id)).toHaveLength(1);
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
    await reserve(userPb, user, secondProduct, [3, 4], newBorrowAgreement);
    const acceptances = await getBorrowAgreementAcceptances(user.id);
    expect(acceptances.map((a) => a.borrow_agreement).sort()).toEqual(
      [borrowAgreement.id, newBorrowAgreement.id].sort()
    );
  });

  test("a minor edit of the borrow agreement keeps it accepted", async () => {
    const { borrowAgreement, product, secondProduct, user, userPb } =
      await setup();
    const { pb: adminPb } = await createStaff("admin");
    await reserve(userPb, user, product, [1, 2], borrowAgreement);

    await adminPb.collection("borrow_agreements").update(borrowAgreement.id, {
      content: "<p>Handle borrowed items with great care.</p>",
    });

    await expect(
      reserve(userPb, user, secondProduct, [3, 4])
    ).resolves.toBeDefined();
  });

  test("a failed reservation doesn't accept the borrow agreement", async () => {
    const { borrowAgreement, product, user, userPb } = await setup();

    // Reservation longer than max_reservation_days
    await expect(
      reserve(userPb, user, product, [1, 30], borrowAgreement)
    ).rejects.toThrow(ClientResponseError);

    expect(await getBorrowAgreementAcceptances(user.id)).toHaveLength(0);
  });

  test("managers can create reservations without the borrow agreement being accepted", async () => {
    const { location, product, user } = await setup();
    const { pb: managerPb } = await createStaff("manager", [location.id]);

    await expect(
      reserve(managerPb, user, product, [1, 2])
    ).resolves.toBeDefined();
    expect(await getBorrowAgreementAcceptances(user.id)).toHaveLength(0);
  });

  test("only admins can create and edit borrow agreements", async () => {
    const { location, borrowAgreement } = await setup();
    const { pb: managerPb } = await createStaff("manager", [location.id]);
    const { pb: adminPb } = await createStaff("admin");

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
});

test.describe("borrow agreement acceptance", () => {
  test("a user can accept the current borrow agreement directly", async () => {
    const { borrowAgreement, product, user, userPb } = await setup();

    const acceptance = await accept(userPb, user, borrowAgreement);
    expect(acceptance.recorded_by).toBe("");

    await expect(reserve(userPb, user, product, [1, 2])).resolves.toBeDefined();
  });

  test("a user can't accept an outdated borrow agreement", async () => {
    const { location, borrowAgreement, user, userPb } = await setup();
    await createBorrowAgreement(location, "<p>New conditions.</p>");

    await expect(accept(userPb, user, borrowAgreement)).rejects.toThrow(
      "Borrow_agreement_not_current."
    );
  });

  test("a user can't accept a borrow agreement on behalf of another user", async () => {
    const { borrowAgreement, userPb } = await setup();
    const otherUser = await createUser();

    await expect(accept(userPb, otherUser, borrowAgreement)).rejects.toThrow(
      ClientResponseError
    );
    expect(await getBorrowAgreementAcceptances(otherUser.id)).toHaveLength(0);
  });

  test("a borrow agreement can't be accepted twice", async () => {
    const { borrowAgreement, user, userPb } = await setup();

    await accept(userPb, user, borrowAgreement);
    await expect(accept(userPb, user, borrowAgreement)).rejects.toThrow(
      ClientResponseError
    );
  });

  test("managers can record acceptances at their own locations only", async () => {
    const { location, borrowAgreement, user } = await setup();
    const otherLocation = await createLocation("multiple");
    const otherBorrowAgreement = await createBorrowAgreement(otherLocation);
    const { user: manager, pb: managerPb } = await createStaff("manager", [
      location.id,
    ]);

    // recorded_by is set to the manager, whatever is sent
    const acceptance = await managerPb
      .collection("borrow_agreement_acceptances")
      .create({
        user: user.id,
        borrow_agreement: borrowAgreement.id,
        recorded_by: user.id,
      });
    expect(acceptance.recorded_by).toBe(manager.id);

    await expect(accept(managerPb, user, otherBorrowAgreement)).rejects.toThrow(
      ClientResponseError
    );
  });

  test("admins can record acceptances at any location", async () => {
    const { borrowAgreement, user } = await setup();
    const { user: admin, pb: adminPb } = await createStaff("admin");

    const acceptance = await accept(adminPb, user, borrowAgreement);
    expect(acceptance.recorded_by).toBe(admin.id);
  });

  test("acceptances are only visible to the user and staff of the location", async () => {
    const { location, borrowAgreement, user, userPb } = await setup();
    const otherUser = await createUser();
    const otherUserPb = await pocketbase(
      otherUser.email,
      DEFAULT_PASSWORD,
      false
    );
    const { pb: managerPb } = await createStaff("manager", [location.id]);
    const otherLocation = await createLocation("multiple");
    const { pb: otherManagerPb } = await createStaff("manager", [
      otherLocation.id,
    ]);
    const acceptance = await accept(userPb, user, borrowAgreement);

    for (const pb of [userPb, managerPb]) {
      await expect(
        pb.collection("borrow_agreement_acceptances").getOne(acceptance.id)
      ).resolves.toBeDefined();
    }
    for (const pb of [otherUserPb, otherManagerPb]) {
      await expect(
        pb.collection("borrow_agreement_acceptances").getOne(acceptance.id)
      ).rejects.toThrow(ClientResponseError);
    }
  });

  test("acceptances can't be updated, and only be deleted by staff of the location", async () => {
    const { location, borrowAgreement, user, userPb } = await setup();
    const { user: manager, pb: managerPb } = await createStaff("manager", [
      location.id,
    ]);
    const acceptance = await accept(userPb, user, borrowAgreement);

    await expect(
      userPb
        .collection("borrow_agreement_acceptances")
        .update(acceptance.id, { recorded_by: manager.id })
    ).rejects.toThrow(ClientResponseError);
    await expect(
      userPb.collection("borrow_agreement_acceptances").delete(acceptance.id)
    ).rejects.toThrow(ClientResponseError);
    await expect(
      managerPb.collection("borrow_agreement_acceptances").delete(acceptance.id)
    ).resolves.toBe(true);
  });
});
