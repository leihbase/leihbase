import { expect, test } from "@playwright/test";
import { pocketbase } from "../services/pocketbase";

test.describe("email preview", () => {
  test("preview route returns rendered template with default values", async () => {
    const pb = await pocketbase();

    // Test preview of default reservation_confirmation template
    const response = await pb.send(
      "/api/email-templates/preview?templateName=reservation_confirmation&locale=en",
      {}
    );

    expect(response.subject).toContain("Drill Machine");
    expect(response.html).toContain("John Doe");
    expect(response.html).toContain("Borrow-Store");
    expect(response.templateName).toBe("reservation_confirmation");
  });

  test("preview route renders custom subject and html", async () => {
    const pb = await pocketbase();

    const customSubject = "Hello {USER_NAME}, your {PRODUCT_NAME} is ready";
    const customHtml =
      "<p>Dear {USER_NAME},<br>Your {PRODUCT_NAME} can be picked up at {LOCATION_NAME}</p>";

    const response = await pb.send(
      `/api/email-templates/preview?templateName=reservation_confirmation&locale=en&customSubject=${encodeURIComponent(customSubject)}&customHtml=${encodeURIComponent(customHtml)}`,
      {}
    );

    expect(response.subject).toBe(
      "Hello John Doe, your Drill Machine is ready"
    );
    expect(response.html).toContain("Dear John Doe");
    expect(response.html).toContain("Drill Machine");
    expect(response.html).toContain("Borrow-Store");
  });

  test("preview route handles conditional blocks", async () => {
    const pb = await pocketbase();

    const customHtml = "{#if PRODUCT_DEPOSIT}Deposit: {PRODUCT_DEPOSIT}{/if}";

    const response = await pb.send(
      `/api/email-templates/preview?templateName=reservation_confirmation&locale=en&customHtml=${encodeURIComponent(customHtml)}`,
      {}
    );

    // PRODUCT_DEPOSIT has a value in defaults, so it should be rendered
    expect(response.html).toContain("Deposit: €50");
  });

  test("preview route handles conditional blocks with false condition", async () => {
    const pb = await pocketbase();

    // Use a template that doesn't have NONEXISTENT_VAR
    const customHtml =
      "{#if NONEXISTENT_VAR}This should not appear{/if}This should appear";

    const response = await pb.send(
      `/api/email-templates/preview?templateName=reservation_confirmation&locale=en&customHtml=${encodeURIComponent(customHtml)}`,
      {}
    );

    expect(response.html).not.toContain("This should not appear");
    expect(response.html).toContain("This should appear");
  });

  test("preview route requires templateName and locale", async () => {
    const pb = await pocketbase();

    // Missing templateName
    await expect(
      pb.send("/api/email-templates/preview?locale=en", {})
    ).rejects.toThrow();

    // Missing locale
    await expect(
      pb.send(
        "/api/email-templates/preview?templateName=reservation_confirmation",
        {}
      )
    ).rejects.toThrow();
  });

  test("preview route handles all template types", async () => {
    const pb = await pocketbase();
    const templateTypes = [
      "reservation_confirmation",
      "reservation_confirmation_location",
      "reservation_start_reminder",
      "reservation_end_reminder",
      "cancellation_confirmation",
      "reservation_cancellation_location",
    ];

    for (const templateName of templateTypes) {
      const response = await pb.send(
        `/api/email-templates/preview?templateName=${templateName}&locale=en`,
        {}
      );

      expect(response.subject).toBeTruthy();
      expect(response.html).toBeTruthy();
      expect(response.templateName).toBe(templateName);
    }
  });
});
