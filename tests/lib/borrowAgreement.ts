import type { Location } from "../../web/models/location";
import { pocketbase } from "../services/pocketbase";

/**
 * Creates a new borrow agreement and sets it as the current borrow agreement
 * of the location
 */
export async function createBorrowAgreement(
  location: Location,
  content = "<p>Handle borrowed items with care.</p>"
) {
  const pb = await pocketbase();
  const borrowAgreement = await pb.collection("borrow_agreements").create({
    location: location.id,
    content,
  });
  await pb
    .collection("location")
    .update(location.id, { borrow_agreement: borrowAgreement.id });
  return borrowAgreement;
}
