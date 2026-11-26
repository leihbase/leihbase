/// <reference path="../pb_data/types.d.ts" />

onRecordUpdateRequest((e) => {
  const { record } = e;
  if (!record) {
    throw new BadRequestError("Record_not_defined.");
  }

  // The instance-wide borrow agreement can't belong to a location
  const borrowAgreementId = record.getString("borrow_agreement");
  if (borrowAgreementId) {
    const borrowAgreement = $app.findRecordById(
      "borrow_agreements",
      borrowAgreementId
    );
    if (borrowAgreement.getString("location")) {
      throw new BadRequestError("Borrow_agreement_of_location.");
    }
  }

  e.next();
}, "leihbase");
