import type { RecordModel } from "pocketbase";

export type BorrowAgreement = RecordModel & {
  id: string;
  location: string;
  content: string;
};

export type BorrowAgreementAcceptance = RecordModel & {
  id: string;
  user: string;
  borrow_agreement: string;
  recorded_by: string;
};
