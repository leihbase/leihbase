import type { RecordModel } from "pocketbase";

export type EmailTemplate = RecordModel & {
  id: string;
  name: string;
  location: string;
  locale: string;
  subject: string;
  html: string;
  enabled: boolean;
  created: Date;
  updated: Date;
};
