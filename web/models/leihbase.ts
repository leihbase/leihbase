import type { RecordModel } from "pocketbase";

export type Leihbase = RecordModel & {
  id: string;
  name: string;
  description?: string;
  contact_link?: string;
  privacy_policy_link?: string;
  footer_links?: {
    text: string;
    link: string;
  }[];
  style?: string;
  /** ISO 4217 code of the currency of deposits, "EUR" when empty */
  currency?: string;
};
