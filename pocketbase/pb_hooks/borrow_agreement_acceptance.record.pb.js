/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  const { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  if (e.hasSuperuserAuth()) {
    e.next();
    return;
  }

  // Only the current borrow agreement of a location can be accepted
  $app.expandRecord(record, ["borrow_agreement"]);
  const borrowAgreement = record.expandedOne("borrow_agreement");
  if (!borrowAgreement) {
    throw new BadRequestError("Borrow_agreement_not_found.");
  }
  const location = $app.findRecordById(
    "location",
    borrowAgreement.getString("location")
  );
  if (location.getString("borrow_agreement") !== borrowAgreement.id) {
    throw new BadRequestError("Borrow_agreement_not_current.");
  }

  // Accepted online by the user themselves, or recorded by staff (an admin or
  // manager of the location, as enforced by the create rule)
  const requestUser = e.auth;
  record.set(
    "recorded_by",
    requestUser && requestUser.id !== record.getString("user")
      ? requestUser.id
      : ""
  );

  e.next();
}, "borrow_agreement_acceptances");
