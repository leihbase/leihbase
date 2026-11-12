import type { BorrowAgreementAcceptance } from "@@/models/borrowAgreement";
import { ClientResponseError } from "pocketbase";

export type AcceptBorrowAgreementResult =
  | { status: "accepted" }
  // The borrow agreement isn't the current one of the location anymore
  | { status: "not_current" }
  | { status: "error"; message: string };

/**
 * Checks and accepts borrow agreements as the user
 */
export function useBorrowAgreementAcceptance() {
  const { pb } = usePocketbase();
  const { t } = useI18n({ useScope: "global" });

  /**
   * Checks if the user has accepted the borrow agreement. Returns `undefined`
   * when this couldn't be checked.
   */
  async function hasAcceptedBorrowAgreement(
    user: string,
    borrowAgreement: string
  ) {
    try {
      const acceptances = await pb
        .collection("borrow_agreement_acceptances")
        .getList<BorrowAgreementAcceptance>(1, 1, {
          filter: pb.filter(
            "user = {:user} && borrow_agreement = {:borrowAgreement}",
            { user, borrowAgreement }
          ),
          skipTotal: true,
        });
      return acceptances.items.length > 0;
    } catch (e) {
      console.error("Failed to check borrow agreement acceptance", e);
      return undefined;
    }
  }

  async function acceptBorrowAgreement(
    user: string,
    borrowAgreement: string
  ): Promise<AcceptBorrowAgreementResult> {
    try {
      await pb
        .collection("borrow_agreement_acceptances")
        .create({ user, borrow_agreement: borrowAgreement });
      return { status: "accepted" };
    } catch (e) {
      if (
        e instanceof ClientResponseError &&
        e.message === "Borrow_agreement_not_current."
      ) {
        return { status: "not_current" };
      }
      // Already accepted in the meantime (e.g. in another tab)
      if (await hasAcceptedBorrowAgreement(user, borrowAgreement)) {
        return { status: "accepted" };
      }
      return {
        status: "error",
        message: t("borrow_agreement_acceptance_error"),
      };
    }
  }

  return { hasAcceptedBorrowAgreement, acceptBorrowAgreement };
}
