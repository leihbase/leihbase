import { expect, test } from "@playwright/test";
import { ClientResponseError } from "pocketbase";
import type { OpeningHours } from "../../web/models/openingHours";
import { createLocation, DEFAULT_OPENING_HOURS } from "../lib/location";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { pocketbase } from "../services/pocketbase";

const NEW_OPENING_HOURS: OpeningHours = {
  days: {
    monday: [{ from: "10:00", to: "12:00" }],
    wednesday: [
      { from: "09:00", to: "11:00" },
      { from: "16:00", to: "18:00" },
    ],
  },
  except: { dates: ["2030-12-25"] },
};

test.describe("location", () => {
  test.describe("opening hours", () => {
    test("manager can update opening hours of own location", async () => {
      const location = await createLocation("multiple");
      const manager = await createUser(undefined, undefined, "manager", [
        location.id,
      ]);
      const managerPb = await pocketbase(
        manager.email,
        DEFAULT_PASSWORD,
        false
      );

      const updated = await managerPb
        .collection("location")
        .update(location.id, { opening_hours: NEW_OPENING_HOURS });

      expect(updated.opening_hours).toEqual(NEW_OPENING_HOURS);
    });

    test("manager cannot update other fields of own location", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");
      const manager = await createUser(undefined, undefined, "manager", [
        location.id,
      ]);
      const managerPb = await pocketbase(
        manager.email,
        DEFAULT_PASSWORD,
        false
      );

      await expect(
        managerPb.collection("location").update(location.id, {
          name: "Renamed by manager",
          opening_hours: NEW_OPENING_HOURS,
        })
      ).rejects.toThrow(ClientResponseError);

      // Nothing should have changed
      const unchanged = await pb.collection("location").getOne(location.id);
      expect(unchanged.name).toBe(location.name);
      expect(unchanged.opening_hours).toEqual(DEFAULT_OPENING_HOURS);
    });

    test("manager cannot update opening hours of another location", async () => {
      const ownLocation = await createLocation("multiple");
      const otherLocation = await createLocation("multiple");
      const manager = await createUser(undefined, undefined, "manager", [
        ownLocation.id,
      ]);
      const managerPb = await pocketbase(
        manager.email,
        DEFAULT_PASSWORD,
        false
      );

      await expect(
        managerPb
          .collection("location")
          .update(otherLocation.id, { opening_hours: NEW_OPENING_HOURS })
      ).rejects.toThrow(ClientResponseError);
    });

    test("regular user cannot update opening hours", async () => {
      const location = await createLocation("multiple");
      const user = await createUser(undefined, undefined, "user", [
        location.id,
      ]);
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

      await expect(
        userPb
          .collection("location")
          .update(location.id, { opening_hours: NEW_OPENING_HOURS })
      ).rejects.toThrow(ClientResponseError);
    });

    test("admin can update other fields of a location", async () => {
      const location = await createLocation("multiple");
      const admin = await createUser(undefined, undefined, "admin");
      const adminPb = await pocketbase(admin.email, DEFAULT_PASSWORD, false);

      const updated = await adminPb
        .collection("location")
        .update(location.id, { name: "Renamed by admin" });

      expect(updated.name).toBe("Renamed by admin");
    });

    const invalidOpeningHours: [string, unknown][] = [
      ["unknown day", { days: { someday: [{ from: "10:00", to: "12:00" }] } }],
      ["day without ranges", { days: { monday: [] } }],
      ["invalid time", { days: { monday: [{ from: "10", to: "12:00" }] } }],
      [
        "range ending before it starts",
        { days: { monday: [{ from: "12:00", to: "10:00" }] } },
      ],
      [
        "overlapping ranges",
        {
          days: {
            monday: [
              { from: "10:00", to: "12:00" },
              { from: "11:00", to: "13:00" },
            ],
          },
        },
      ],
      ["invalid closed date", { days: {}, except: { dates: ["25-12-2030"] } }],
      ["missing days", { except: { dates: [] } }],
    ];

    for (const [name, openingHours] of invalidOpeningHours) {
      test(`rejects invalid opening hours: ${name}`, async () => {
        const location = await createLocation("multiple");
        const admin = await createUser(undefined, undefined, "admin");
        const adminPb = await pocketbase(admin.email, DEFAULT_PASSWORD, false);

        try {
          await adminPb
            .collection("location")
            .update(location.id, { opening_hours: openingHours });
          throw new Error("Expected update to be rejected");
        } catch (err) {
          expect(err).toBeInstanceOf(ClientResponseError);
          expect((err as ClientResponseError).status).toBe(400);
          expect(
            (err as ClientResponseError).response.data.opening_hours.code
          ).toBe("invalid_opening_hours");
        }
      });
    }
  });
});
