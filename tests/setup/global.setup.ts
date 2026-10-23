import { expect, test as setup } from "@playwright/test";
import { ClientResponseError } from "pocketbase";
import { createUser } from "../lib/user";
import { pocketbase } from "../services/pocketbase";

setup.describe.configure({ mode: "serial" });

setup.describe("setup", () => {
  setup("create location, product and user", async ({ page }) => {
    const pb = await pocketbase();
    await expect(pb).toBeDefined();

    // Configure mailing
    await pb.settings.update({
      smtp: {
        enabled: true,
        host: "localhost",
        port: 1025,
      },
    });

    // Create leihbase
    try {
      await pb.collection("leihbase").create({
        name: "Leihbase",
        privacy_policy_link: "https://example.com",
        footer_links: [
          {
            text: "Imprint",
            link: "https://example.com",
          },
          {
            text: "Privacy Policy",
            link: "https://example.com",
          },
        ],
      });
    } catch (err) {
      console.log(
        "Error creating leihbase record",
        err instanceof ClientResponseError ? err.response.data : err
      );
    }

    // Create test store
    let location;
    try {
      location = await pb.collection("location").create({
        active: true,
        name: "Test Store",
        address: "Example Street 1, Example City",
        email: "location@example.com",
        slug: "test-store",
        reservation_system: "multiple",
        opening_hours: {
          days: {
            tuesday: [
              {
                from: "18:00",
                to: "19:00",
              },
            ],
            friday: [
              {
                from: "17:00",
                to: "19:00",
              },
            ],
          },
        },
      });
    } catch (err) {
      console.log(
        "Error creating test store",
        err instanceof ClientResponseError ? err.response.data : err
      );
    }

    // Create test user
    createUser("test@example.com", "testtest");
  });

  // Wait for homepage to load with extra long timeout
  // as Nuxt first needs to finish building
  setup("wait for homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Test Store", { timeout: 30000 });
  });
});
