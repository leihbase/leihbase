import type { RecordModel } from "pocketbase";

export type BorrowAgreement = RecordModel & {
  id: string;
  /** Empty for the instance-wide borrow agreement */
  location: string;
  content: string;
};

export type BorrowAgreementAcceptance = RecordModel & {
  id: string;
  user: string;
  borrow_agreement: string;
  recorded_by: string;
};
