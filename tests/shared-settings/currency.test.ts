import { expect, test } from "@playwright/test";
import { createProduct, navigateToProductPage } from "../lib/product";
import { createReservation } from "../lib/reservation";
import { createUser } from "../lib/user";
import { pocketbase } from "../services/pocketbase";

// Changes the currency of the whole instance, so runs on its own, after all
// other tests (see the "Shared settings" project in playwright.config.ts)
test.describe.configure({ mode: "serial" });

test.describe("currency", () => {
  test("deposits are shown in the currency set on the leihbase record", async ({
    page,
  }) => {
    const pb = await pocketbase();
    const leihbase = (await pb.collection("leihbase").getFullList())[0]!;
    const product = await createProduct();
    try {
      await pb.collection("leihbase").update(leihbase.id, { currency: "GBP" });

      // Product page
      await navigateToProductPage(page, product.id);
      await expect(page.getByText("£10")).toBeVisible();
      await expect(page.getByText("€10")).toHaveCount(0);

      // Emails (previews use the email locale, CONFIG_LOCALE)
      const customHtml = "Deposit: {PRODUCT_DEPOSIT}";
      const preview = () =>
        pb.send(
          `/api/email-templates/preview?templateName=reservation_confirmation&locale=en&customHtml=${encodeURIComponent(customHtml)}`,
          {}
        );
      expect((await preview()).html).toContain("Deposit: £50");

      // Currencies without a listed symbol are shown with their code
      await pb.collection("leihbase").update(leihbase.id, { currency: "CAD" });
      expect((await preview()).html).toContain("Deposit: CAD 50");
    } finally {
      await pb.collection("leihbase").update(leihbase.id, { currency: "" });
    }
  });

  test("English with pounds shows dates as dd/mm/yy", async ({ page }) => {
    const pb = await pocketbase();
    const leihbase = (await pb.collection("leihbase").getFullList())[0]!;
    const product = await createProduct();
    const user = await createUser();
    await createReservation(pb, {
      user: user.id,
      product: product.id,
      location: product.location,
      start: new Date(Date.UTC(2099, 10, 16)),
      end: new Date(Date.UTC(2099, 10, 18)),
    });
    const preview = async () =>
      (
        await pb.send(
          `/api/email-templates/preview?templateName=reservation_confirmation&locale=en&customHtml=${encodeURIComponent("From {RESERVATION_START}")}`,
          {}
        )
      ).html;
    try {
      // Other currencies keep the default English formats
      await navigateToProductPage(page, product.id);
      await expect(page.getByText("11/16/2099")).toBeVisible();
      expect(await preview()).toContain("From 15/1/2024");

      await pb.collection("leihbase").update(leihbase.id, { currency: "GBP" });
      await navigateToProductPage(page, product.id);
      await expect(page.getByText("16/11/99 - 18/11/99")).toBeVisible();
      expect(await preview()).toContain("From 15/01/24");
    } finally {
      await pb.collection("leihbase").update(leihbase.id, { currency: "" });
    }
  });

  test("only accepts three letter currency codes", async () => {
    const pb = await pocketbase();
    const leihbase = (await pb.collection("leihbase").getFullList())[0]!;
    await expect(
      pb.collection("leihbase").update(leihbase.id, { currency: "Euro" })
    ).rejects.toThrow();
  });
});
