import type { RecordModel } from "pocketbase";
import type { OpeningHours } from "./openingHours";

export type Location = RecordModel & {
  id: string;
  name: string;
  address: string;
  email: string;
  description: string;
  slug: string;
  active: boolean;
  opening_hours: OpeningHours;
  links: { text: string; link: string }[];
  /** Email addresses notified about new and cancelled reservations */
  notifications: string[] | null;
  max_reservation_days: number;
  reservation_system: "disabled" | "single" | "multiple";
  reservation_start_limit: number;
};
