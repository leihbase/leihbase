/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  const { requestInfo, record } = e;

  if (!record) {
    throw new BadRequestError();
  }

  // Validate captcha, if captcha is enabled
  const capInstanceHost = $os.getenv("CONFIG_CAP_INSTANCE_HOST");
  const capSiteKey = $os.getenv("CONFIG_CAP_SITE_KEY");
  const capSecretKey = $os.getenv("CONFIG_CAP_SECRET_KEY");
  if (capInstanceHost && capSiteKey && capSecretKey) {
    const body = requestInfo().body;
    if (!body["cap-token"]) {
      throw new BadRequestError("Captcha_invalid.");
    }

    const res = $http.send({
      url: `https://${capInstanceHost}/${capSiteKey}/siteverify`,
      method: "POST",
      body: JSON.stringify({
        secret: capSecretKey,
        response: body["cap-token"],
      }),
      headers: { "Content-Type": "application/json" },
      timeout: 30,
    });

    if (!res.json.success) {
      throw new Error("Captcha_invalid.");
    }
  }

  // Make sure privacy policy has been accepted, if defined
  const leihbase = $app.findAllRecords("leihbase")[0];
  if (leihbase?.get("privacy_policy_link") && !record.getBool("terms")) {
    throw new BadRequestError("Terms_required.");
  }

  const isSuperuser = e.hasSuperuserAuth();
  if (!isSuperuser || !record.get("role")) {
    record.set("role", "user");
  }

  e.next();
}, "users");

onRecordEnrich((e) => {
  // Unhide 'role' and 'manager_locations' for requesting user.
  if (
    e.record &&
    e.requestInfo &&
    e.requestInfo.auth &&
    e.requestInfo.auth.id === e.record.id
  ) {
    e.record.unhide("role");
    e.record.unhide("manager_locations");
  }

  e.next();
}, "users");
