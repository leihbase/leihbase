import type { BorrowAgreementAcceptance } from "@@/models/borrowAgreement";
import type { Location } from "@@/models/location";
import type { Reservation } from "@@/models/reservation";

/**
 * Acceptances of the current borrow agreement of the location, for the admin
 * section. An acceptance is `null` when the user hasn't accepted the current
 * borrow agreement but should, and `undefined` when not applicable (the location
 * has no borrow agreement, or there is no user).
 */
export function useAdminBorrowAgreementAcceptances(location: Location) {
  const { pb } = usePocketbase();
  const borrowAgreement = location.borrow_agreement;

  /**
   * The acceptance of the user of the reservation, from its expand
   */
  function getFromReservation(reservation: Reservation) {
    if (!borrowAgreement || !reservation.user) {
      return undefined;
    }
    const acceptances: BorrowAgreementAcceptance[] =
      reservation.expand?.user?.expand?.borrow_agreement_acceptances_via_user ||
      [];
    return (
      acceptances.find(
        (acceptance) => acceptance.borrow_agreement === borrowAgreement
      ) || null
    );
  }

  /**
   * Fetches the acceptance of the user
   */
  async function fetch(user: string | undefined) {
    if (!borrowAgreement || !user) {
      return undefined;
    }
    const acceptances = await pb
      .collection("borrow_agreement_acceptances")
      .getList<BorrowAgreementAcceptance>(1, 1, {
        filter: pb.filter(
          "user = {:user} && borrow_agreement = {:borrowAgreement}",
          { user, borrowAgreement }
        ),
        skipTotal: true,
        requestKey: null,
      });
    return acceptances.items[0] || null;
  }

  /**
   * Records that the user accepted the current borrow agreement in the store
   */
  function record(user: string) {
    return pb
      .collection("borrow_agreement_acceptances")
      .create<BorrowAgreementAcceptance>({
        user,
        borrow_agreement: borrowAgreement,
      });
  }

  /**
   * Removes the acceptance
   */
  async function remove(acceptance: BorrowAgreementAcceptance) {
    await pb.collection("borrow_agreement_acceptances").delete(acceptance.id);
  }

  return { getFromReservation, fetch, record, remove };
}
