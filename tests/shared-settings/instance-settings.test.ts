import { expect, test } from "@playwright/test";
import { login } from "../lib/login";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { waitForHydration } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

// Changes settings of the whole instance, so runs on its own, after all other
// tests, one at a time (see the "Shared settings" project in
// playwright.config.ts)

test.describe("instance settings", () => {
  test("admins can update the leihbase record, managers and users can't", async () => {
    const pb = await pocketbase();
    const leihbase = (await pb.collection("leihbase").getFullList())[0]!;
    try {
      for (const role of ["user", "manager"] as const) {
        const user = await createUser(undefined, undefined, role);
        const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
        await expect(
          userPb.collection("leihbase").update(leihbase.id, { currency: "GBP" })
        ).rejects.toThrow();
      }

      const admin = await createUser(undefined, undefined, "admin");
      const adminPb = await pocketbase(admin.email, DEFAULT_PASSWORD, false);
      const updated = await adminPb
        .collection("leihbase")
        .update(leihbase.id, { currency: "GBP" });
      expect(updated.currency).toBe("GBP");
    } finally {
      await pb.collection("leihbase").update(leihbase.id, { currency: "" });
    }
  });

  test("admins can change the instance name on the settings page", async ({
    page,
  }) => {
    const pb = await pocketbase();
    const leihbase = (await pb.collection("leihbase").getFullList())[0]!;
    const admin = await createUser(undefined, undefined, "admin");
    try {
      await login(page, admin.email, DEFAULT_PASSWORD);
      await page.goto("/admin/settings");
      await waitForHydration(page);

      await page.getByTestId("name-input").fill("Test Leihbase");
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Settings saved.")).toBeVisible();
      expect((await pb.collection("leihbase").getOne(leihbase.id)).name).toBe(
        "Test Leihbase"
      );
    } finally {
      await pb.collection("leihbase").update(leihbase.id, {
        name: leihbase.name,
      });
    }
  });
});
