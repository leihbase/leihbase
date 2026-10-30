import type { RecordModel } from "pocketbase";

export type User = RecordModel & {
  id: string;
  name: string;
  role: "user" | "manager" | "admin";
  manager_locations: string[];
};
