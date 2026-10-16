import type { OpeningHours } from "../../web/lib/openingHours";
import { Location } from "../../web/models/location";
import { pocketbase } from "../services/pocketbase";
import { uniqueId } from "./utils";

/**
 * Default opening hours matching the ones in global.setup.ts
 */
export const DEFAULT_OPENING_HOURS: OpeningHours = {
  days: {
    tuesday: [
      {
        from: "18:00",
        to: "19:00",
      },
    ],
    friday: [
      {
        from: "17:00",
        to: "19:00",
      },
    ],
  },
  except: {
    dates: [],
  },
};

/**
 * Opening hours for every day (useful for tests that need today to be an open day)
 */
export const ALL_DAYS_OPENING_HOURS: OpeningHours = {
  days: {
    sunday: [{ from: "10:00", to: "20:00" }],
    monday: [{ from: "10:00", to: "20:00" }],
    tuesday: [{ from: "10:00", to: "20:00" }],
    wednesday: [{ from: "10:00", to: "20:00" }],
    thursday: [{ from: "10:00", to: "20:00" }],
    friday: [{ from: "10:00", to: "20:00" }],
    saturday: [{ from: "10:00", to: "20:00" }],
  },
  except: {
    dates: [],
  },
};

/**
 * Creates a new location with the specified reservation system, opening hours, and optional reservation_start_limit
 */
export async function createLocation(
  reservationSystem: "disabled" | "single" | "multiple",
  openingHours: OpeningHours = DEFAULT_OPENING_HOURS,
  reservationStartLimit?: number
) {
  const pb = await pocketbase();
  const id = uniqueId();
  try {
    const location = await pb.collection("location").create({
      active: true,
      name: `Test Location ${reservationSystem} ${id}`,
      address: "Test Address",
      email: `location-${reservationSystem}@example.com`,
      slug: `test-location-${reservationSystem}-${id}`,
      reservation_system: reservationSystem,
      opening_hours: openingHours,
      max_reservation_days: 14,
      reservation_start_limit: reservationStartLimit,
    });
    return location as Location;
  } catch (err) {
    console.log("Error creating test location", err?.response?.data);
    throw new Error(
      `createLocation: couldn't create location with reservation_system=${reservationSystem}`
    );
  }
}
