import type { RecordModel } from "pocketbase";

export type BorrowAgreement = RecordModel & {
  id: string;
  location: string;
  content: string;
};
