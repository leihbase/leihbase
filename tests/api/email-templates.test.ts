import { expect, test } from "@playwright/test";
import { ClientResponseError } from "pocketbase";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { createLocation } from "../lib/location";
import { pocketbase } from "../services/pocketbase";

test.describe("email templates", () => {
  test.describe("CRUD operations", () => {
    test("admin can create email template", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");

      const template = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      expect(template).toBeDefined();
      expect(template.id).toBeTruthy();
      expect(template.name).toBe("reservation_confirmation");
      expect(template.subject).toBe("Test Subject");
      expect(template.html).toBe("<p>Test HTML</p>");
      expect(template.locale).toBe("en");
      expect(template.enabled).toBe(true);
      expect(template.location).toBe(location.id);
    });

    test("admin can list email templates", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");

      // Create a template
      await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      const templates = await pb.collection("email_templates").getFullList({
        filter: pb.filter("location = {:loc}", { loc: location.id }),
      });

      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0].name).toBe("reservation_confirmation");
    });

    test("admin can list all templates without filter", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");

      // Create a template
      await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      const allTemplates = await pb
        .collection("email_templates")
        .getFullList({ sort: "-created" });

      expect(allTemplates.length).toBeGreaterThan(0);
    });

    test("admin can get single template by id", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");

      const created = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      const fetched = await pb
        .collection("email_templates")
        .getOne(created.id);

      expect(fetched.id).toBe(created.id);
      expect(fetched.name).toBe("reservation_confirmation");
    });

    test("admin can update email template", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");

      // Create a template
      const template = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Original Subject",
        html: "<p>Original HTML</p>",
        enabled: true,
      });

      // Update the template
      const updated = await pb.collection("email_templates").update(
        template.id,
        {
          subject: "Updated Subject",
          html: "<p>Updated HTML</p>",
          enabled: false,
        }
      );

      expect(updated.subject).toBe("Updated Subject");
      expect(updated.html).toBe("<p>Updated HTML</p>");
      expect(updated.enabled).toBe(false);
    });

    test("admin can delete email template", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");

      // Create a template
      const template = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      // Delete the template
      await pb.collection("email_templates").delete(template.id);

      // Verify deletion
      const { items } = await pb.collection("email_templates").getList(1, 1, {
        filter: pb.filter("id = {:id}", { id: template.id }),
      });

      expect(items.length).toBe(0);
    });

    test("admin can create template for each template type", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");

      const templateTypes = [
        "reservation_confirmation",
        "reservation_confirmation_location",
        "reservation_start_reminder",
        "reservation_end_reminder",
        "cancellation_confirmation",
        "reservation_cancellation_location",
      ];

      for (const templateType of templateTypes) {
        const template = await pb.collection("email_templates").create({
          name: templateType,
          location: location.id,
          locale: "en",
          subject: `Test ${templateType}`,
          html: `<p>Test ${templateType}</p>`,
          enabled: true,
        });

        expect(template.name).toBe(templateType);
      }
    });

    test("admin can create template with different locales", async () => {
      const pb = await pocketbase();
      const location = await createLocation("multiple");

      // Create English template
      const enTemplate = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Reservation Confirmation",
        html: "<p>English template</p>",
        enabled: true,
      });

      // Create German template for same location and name
      const deTemplate = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "de",
        subject: "Buchungsbestätigung",
        html: "<p>Deutsche Vorlage</p>",
        enabled: true,
      });

      expect(enTemplate.locale).toBe("en");
      expect(deTemplate.locale).toBe("de");
      expect(enTemplate.id).not.toBe(deTemplate.id);
    });
  });

  test.describe("access control", () => {
    test("regular user cannot create email template", async () => {
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
      const location = await createLocation("multiple");

      await expect(
        userPb.collection("email_templates").create({
          name: "reservation_confirmation",
          location: location.id,
          locale: "en",
          subject: "Test Subject",
          html: "<p>Test HTML</p>",
          enabled: true,
        })
      ).rejects.toThrow(ClientResponseError);
    });

    test("regular user cannot list email templates", async () => {
      const pb = await pocketbase();
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
      const location = await createLocation("multiple");

      // Create a template as admin
      await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      // Try to list as regular user
      const templates = await userPb.collection("email_templates").getFullList();

      expect(templates.length).toBe(0);
    });

    test("regular user cannot view email template", async () => {
      const pb = await pocketbase();
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
      const location = await createLocation("multiple");

      // Create a template as admin
      const template = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      // Try to view as regular user
      await expect(
        userPb.collection("email_templates").getOne(template.id)
      ).rejects.toThrow(ClientResponseError);
    });

    test("regular user cannot update email template", async () => {
      const pb = await pocketbase();
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
      const location = await createLocation("multiple");

      // Create a template as admin
      const template = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      // Try to update as regular user
      await expect(
        userPb.collection("email_templates").update(template.id, {
          subject: "Should not be updated",
        })
      ).rejects.toThrow(ClientResponseError);
    });

    test("regular user cannot delete email template", async () => {
      const pb = await pocketbase();
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
      const location = await createLocation("multiple");

      // Create a template as admin
      const template = await pb.collection("email_templates").create({
        name: "reservation_confirmation",
        location: location.id,
        locale: "en",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        enabled: true,
      });

      // Try to delete as regular user
      await expect(
        userPb.collection("email_templates").delete(template.id)
      ).rejects.toThrow(ClientResponseError);
    });
  });

  test.describe("API endpoints", () => {
    test("defaults endpoint returns template with variables", async () => {
      const pb = await pocketbase();

      const response = await pb.send(
        "/api/email-templates/defaults/en/reservation_confirmation",
        {}
      );

      expect(response.template).toBeDefined();
      expect(response.template.subject).toBeTruthy();
      expect(response.template.html).toBeTruthy();
      expect(response.vars).toBeDefined();
      expect(Array.isArray(response.vars)).toBe(true);
      expect(response.vars.length).toBeGreaterThan(0);
    });

    test("defaults endpoint returns 404 for non-existent template", async () => {
      const pb = await pocketbase();

      await expect(
        pb.send("/api/email-templates/defaults/en/non_existent_template", {})
      ).rejects.toThrow(ClientResponseError);
    });

    test("defaults endpoint returns 400 for invalid locale", async () => {
      const pb = await pocketbase();

      await expect(
        pb.send("/api/email-templates/defaults/fr/reservation_confirmation", {})
      ).rejects.toThrow(ClientResponseError);
    });

    test("defaults endpoint works for all template types", async () => {
      const pb = await pocketbase();
      const templateTypes = [
        "reservation_confirmation",
        "reservation_confirmation_location",
        "reservation_start_reminder",
        "reservation_end_reminder",
        "cancellation_confirmation",
        "reservation_cancellation_location",
      ];

      for (const templateType of templateTypes) {
        const response = await pb.send(
          `/api/email-templates/defaults/en/${templateType}`,
          {}
        );

        expect(response.template).toBeDefined();
        expect(response.template.subject).toBeTruthy();
        expect(response.template.html).toBeTruthy();
        expect(response.vars).toBeDefined();
      }
    });

    test("defaults endpoint works for german locale", async () => {
      const pb = await pocketbase();

      const response = await pb.send(
        "/api/email-templates/defaults/de/reservation_confirmation",
        {}
      );

      expect(response.template).toBeDefined();
      expect(response.template.subject).toBeTruthy();
      expect(response.template.html).toBeTruthy();
    });
  });
});
