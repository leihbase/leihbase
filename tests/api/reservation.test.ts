import { expect, test } from "@playwright/test";
import { ClientResponseError } from "pocketbase";
import { createLocation, DEFAULT_OPENING_HOURS } from "../lib/location";
import { createProduct } from "../lib/product";
import { createReservation } from "../lib/reservation";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { getFutureDate, getPastDate } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

test.describe("reservation", () => {
  test("user can only access their own reservations", async () => {
    // Create product, user, and reservation
    const pb = await pocketbase();
    const product = await createProduct();
    const location = (await pb.collection("location").getFullList()).at(0);

    const firstUser = await createUser();
    const firstUserPb = await pocketbase(
      firstUser.email,
      DEFAULT_PASSWORD,
      false
    );
    await createReservation(firstUserPb, {
      user: firstUser!.id,
      location: location!.id,
      product: product.id,
      start: new Date(),
      end: new Date(Date.now() + 1000 * 60 * 60 * 48),
    });
    const firstReservations = await firstUserPb
      .collection("reservations")
      .getFullList();
    // Expect the user to have 1 reservation
    expect(firstReservations.length).toBe(1);

    // Create second user
    const secondUser = await createUser();
    const secondUserPb = await pocketbase(
      secondUser.email,
      DEFAULT_PASSWORD,
      false
    );
    const secondReservations = await secondUserPb
      .collection("reservations")
      .getFullList();
    // Expect the user to have no reservations
    expect(secondReservations.length).toBe(0);
  });
});

test.describe("reservation system", () => {
  test("location with 'disabled' reservation system prevents regular user reservations", async () => {
    // Create location with disabled reservation system
    const location = await createLocation("disabled");
    // Create product in that location
    const product = await createProduct(location);
    // Create regular user
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

    // Try to create reservation
    await expect(
      createReservation(userPb, {
        user: user.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(1),
        end: getFutureDate(2),
      })
    ).rejects.toThrow(ClientResponseError);
  });

  test("location with 'single' reservation system prevents multiple reservations for same product", async () => {
    // Create location with single reservation system
    const location = await createLocation("single");
    // Create product in that location
    const product = await createProduct(location);
    // Create user
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

    // Create first reservation
    await createReservation(userPb, {
      user: user.id,
      product: product.id,
      location: location.id,
      start: getFutureDate(1),
      end: getFutureDate(2),
    });

    // Try to create second reservation for same product
    await expect(
      createReservation(userPb, {
        user: user.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(3),
        end: getFutureDate(4),
      })
    ).rejects.toThrow(ClientResponseError);
  });

  test("location with 'single' system prevents new reservation when previous is unreturned", async () => {
    const adminPb = await pocketbase();
    // Create location with single reservation system
    const location = await createLocation("single");
    // Create product in that location
    const product = await createProduct(location);
    // Create user
    const user = await createUser();
    const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

    // Create past reservation that was not returned (ended: false)
    await createReservation(adminPb, {
      user: user!.id,
      product: product.id,
      location: location.id,
      start: getPastDate(2),
      end: getPastDate(1),
    });

    // Try to create new reservation
    await expect(
      createReservation(userPb, {
        user: user!.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(1),
        end: getFutureDate(2),
      })
    ).rejects.toThrow(ClientResponseError);
  });

  test("location with 'multiple' reservation system allows multiple reservations for same product", async () => {
    // Create location with multiple reservation system
    const location = await createLocation("multiple");
    // Create product in that location
    const product = await createProduct(location);
    // Create first user
    const firstUser = await createUser();
    const firstUserPb = await pocketbase(
      firstUser.email,
      DEFAULT_PASSWORD,
      false
    );

    // Create first reservation
    const firstReservation = await createReservation(firstUserPb, {
      user: firstUser!.id,
      product: product.id,
      location: location.id,
      start: getFutureDate(1),
      end: getFutureDate(2),
    });
    expect(firstReservation).toBeDefined();

    // Create second user
    const secondUser = await createUser();
    const secondUserPb = await pocketbase(
      secondUser.email,
      DEFAULT_PASSWORD,
      false
    );

    // Create second reservation for same product (different dates)
    const secondReservation = await createReservation(secondUserPb, {
      user: secondUser!.id,
      product: product.id,
      location: location.id,
      start: getFutureDate(3),
      end: getFutureDate(4),
    });
    expect(secondReservation).toBeDefined();
  });

  test.describe("reservation_start_limit", () => {
    test("allows reservations when reservation_start_limit is 0", async () => {
      // Create location with reservation_start_limit = 0
      const location = await createLocation(
        "multiple",
        DEFAULT_OPENING_HOURS,
        0
      );
      // Create product in that location
      const product = await createProduct(location);
      // Create user
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

      // Create reservation far in the future (100 days)
      const reservation = await createReservation(userPb, {
        user: user.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(100),
        end: getFutureDate(101),
      });
      expect(reservation).toBeDefined();
    });

    test("allows reservations within reservation_start_limit", async () => {
      // Create location with reservation_start_limit = 14
      const location = await createLocation(
        "multiple",
        DEFAULT_OPENING_HOURS,
        14
      );
      // Create product in that location
      const product = await createProduct(location);
      // Create user
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

      // Create reservation within limit (10 days)
      const reservation = await createReservation(userPb, {
        user: user.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(10),
        end: getFutureDate(11),
      });
      expect(reservation).toBeDefined();
    });

    test("blocks reservations beyond reservation_start_limit for regular users", async () => {
      // Create location with reservation_start_limit = 14
      const location = await createLocation(
        "multiple",
        DEFAULT_OPENING_HOURS,
        14
      );
      // Create product in that location
      const product = await createProduct(location);
      // Create user
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

      // Try to create reservation beyond limit (20 days)
      await expect(
        createReservation(userPb, {
          user: user.id,
          product: product.id,
          location: location.id,
          start: getFutureDate(20),
          end: getFutureDate(21),
        })
      ).rejects.toThrow(ClientResponseError);
    });

    test("allows reservations beyond reservation_start_limit for admin users", async () => {
      const adminPb = await pocketbase();
      // Create location with reservation_start_limit = 14
      const location = await createLocation(
        "multiple",
        DEFAULT_OPENING_HOURS,
        14
      );
      // Create product in that location
      const product = await createProduct(location);
      // Create manager
      const manager = await createUser(undefined, undefined, "manager", [
        location.id,
      ]);

      // Admin creates reservation beyond limit (20 days)
      const reservation = await createReservation(adminPb, {
        user: manager.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(20),
        end: getFutureDate(21),
      });
      expect(reservation).toBeDefined();
    });
  });
});
