import { expect, test } from "@playwright/test";
import {
  ALL_DAYS_OPENING_HOURS,
  createLocation,
  DEFAULT_OPENING_HOURS,
} from "../lib/location";
import { createProduct, getProductWithAvailability } from "../lib/product";
import { createReservation } from "../lib/reservation";
import { getFutureDate, getPastDate, getToday } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

test.describe("product", () => {
  test.describe("availability", () => {
    test("product with no reservations is shown as available", async () => {
      // Create location with multiple reservation system and default opening hours
      const location = await createLocation("multiple");
      // Create product in that location
      const product = await createProduct(location);

      // Fetch product with availability computation
      const productWithAvailability = await getProductWithAvailability(
        product.id
      );
      // Expect the product to be available (no reservations)
      expect(productWithAvailability.computedIsAvailable).toBe(true);
    });

    test("product of location with 'single' system and future reservation shows as unavailable", async () => {
      // Create location with single reservation system
      const location = await createLocation("single");
      // Create product in that location
      const product = await createProduct(location);
      // Create admin user to create reservation
      const adminPb = await pocketbase();
      const adminUser = await adminPb.collection("users").getFirstListItem("");

      // Create future reservation
      await createReservation(adminPb, {
        user: adminUser.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(1),
        end: getFutureDate(2),
      });

      // Fetch product with availability computation
      const productWithAvailability = await getProductWithAvailability(
        product.id
      );
      // Expect the product to be unavailable
      expect(productWithAvailability.computedIsAvailable).toBe(false);
    });

    test("product of location with 'single' system and past unreturned reservation shows as unavailable", async () => {
      // Create location with single reservation system
      const location = await createLocation("single");
      // Create product in that location
      const product = await createProduct(location);
      // Create admin user to create reservation
      const adminPb = await pocketbase();
      const adminUser = await adminPb.collection("users").getFirstListItem("");

      // Create past reservation that was not returned
      const reservation = await createReservation(adminPb, {
        user: adminUser.id,
        product: product.id,
        location: location.id,
        start: getPastDate(2),
        end: getPastDate(1),
      });

      // Update reservation to mark as not ended
      await adminPb.collection("reservations").update(reservation.id, {
        ended: false,
      });

      // Fetch product with availability computation
      const productWithAvailability = await getProductWithAvailability(
        product.id
      );
      // Expect the product to be unavailable
      expect(productWithAvailability.computedIsAvailable).toBe(false);
    });

    test("product of location with 'multiple' system and future reservation shows as available", async () => {
      // Create location with multiple reservation system
      const location = await createLocation("multiple");
      // Create product in that location
      const product = await createProduct(location);
      // Get admin user to create reservation
      const adminPb = await pocketbase();
      const adminUser = await adminPb.collection("users").getFirstListItem("");

      // Create future reservation
      await createReservation(adminPb, {
        user: adminUser.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(7), // Far in the future, won't overlap with next open days
        end: getFutureDate(8),
      });

      // Fetch product with availability computation
      const productWithAvailability = await getProductWithAvailability(
        product.id
      );
      // Expect the product to be available (reservation is in the future, not overlapping with next open days)
      expect(productWithAvailability.computedIsAvailable).toBe(true);
    });

    test("product of location with 'multiple' system and reservation starting today shows as unavailable", async () => {
      // Create location with multiple reservation system and all days open
      const location = await createLocation("multiple", ALL_DAYS_OPENING_HOURS);
      // Create product in that location
      const product = await createProduct(location);
      // Create admin user to create reservation
      const adminPb = await pocketbase();
      const adminUser = await adminPb.collection("users").getFirstListItem("");

      // Create reservation starting today (will overlap with next open days)
      await createReservation(adminPb, {
        user: adminUser.id,
        product: product.id,
        location: location.id,
        start: getToday(),
        end: getFutureDate(1),
      });

      // Fetch product with availability computation
      const productWithAvailability = await getProductWithAvailability(
        product.id
      );
      // Expect the product to be unavailable
      expect(productWithAvailability.computedIsAvailable).toBe(false);
    });

    test("product of location with 'multiple' system and reservation starting on next opening day shows as unavailable", async () => {
      // Create location with multiple reservation system and default opening hours (tuesday/friday)
      const location = await createLocation("multiple", DEFAULT_OPENING_HOURS);
      // Create product in that location
      const product = await createProduct(location);
      // Create admin user to create reservation
      const adminPb = await pocketbase();
      const adminUser = await adminPb.collection("users").getFirstListItem("");

      // Calculate next opening day based on current day
      // Default opening hours: tuesday (18:00-19:00) and friday (17:00-19:00)
      // getNextOpenDate will find the next tuesday or friday
      // We need to create a reservation starting on that day
      // For simplicity, create a reservation starting in 1 day and lasting 2 days
      // This should overlap with the next opening day(s)
      await createReservation(adminPb, {
        user: adminUser.id,
        product: product.id,
        location: location.id,
        start: getFutureDate(1),
        end: getFutureDate(3),
      });

      // Fetch product with availability computation
      const productWithAvailability = await getProductWithAvailability(
        product.id
      );
      // Expect the product to be unavailable
      expect(productWithAvailability.computedIsAvailable).toBe(false);
    });

    test("product of location with 'multiple' system and reservation ending today shows as unavailable", async () => {
      // Create location with multiple reservation system and all days open
      const location = await createLocation("multiple", ALL_DAYS_OPENING_HOURS);
      // Create product in that location
      const product = await createProduct(location);
      // Create admin user to create reservation
      const adminPb = await pocketbase();
      const adminUser = await adminPb.collection("users").getFirstListItem("");

      // Create reservation ending today
      await createReservation(adminPb, {
        user: adminUser.id,
        product: product.id,
        location: location.id,
        start: getPastDate(1),
        end: getToday(),
      });

      // Fetch product with availability computation
      const productWithAvailability = await getProductWithAvailability(
        product.id
      );
      // Expect the product to be unavailable
      expect(productWithAvailability.computedIsAvailable).toBe(false);
    });
  });
});
