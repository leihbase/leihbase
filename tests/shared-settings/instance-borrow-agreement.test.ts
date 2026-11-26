import { expect, test } from "@playwright/test";
import Client, { ClientResponseError, type RecordModel } from "pocketbase";
import {
  createBorrowAgreement,
  getBorrowAgreementAcceptances,
} from "../lib/borrowAgreement";
import { createLocation } from "../lib/location";
import { login } from "../lib/login";
import { createProduct } from "../lib/product";
import { closeReservationDialog, reserve } from "../lib/reservation";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { getFutureDate, uniqueId, waitForHydration } from "../lib/utils";
import { pocketbase } from "../services/pocketbase";

// Instance-wide borrowing terms apply to all locations without borrowing
// terms of their own, so these tests run on their own, after all other tests
// (see the "Shared settings" project in playwright.config.ts)
test.describe.configure({ mode: "serial" });

async function getLeihbase() {
  const pb = await pocketbase();
  return (await pb.collection("leihbase").getFullList())[0]!;
}

/**
 * Creates instance-wide borrowing terms and sets them as the current ones
 */
async function createInstanceBorrowAgreement(
  content = "<p>Treat all items with care.</p>"
) {
  const pb = await pocketbase();
  const borrowAgreement = await pb
    .collection("borrow_agreements")
    .create({ content });
  await pb
    .collection("leihbase")
    .update((await getLeihbase()).id, { borrow_agreement: borrowAgreement.id });
  return borrowAgreement;
}

async function createBorrower() {
  const user = await createUser();
  const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
  return { user, userPb };
}

async function createStaff(
  role: "manager" | "admin",
  locations: string[] = []
) {
  const user = await createUser(undefined, undefined, role, locations);
  const pb = await pocketbase(user.email, DEFAULT_PASSWORD, false);
  return { user, pb };
}

function reserveApi(
  pb: Client,
  user: RecordModel,
  product: RecordModel,
  [start, end]: [number, number],
  borrowAgreement?: RecordModel
) {
  return pb.collection("reservations").create({
    user: user.id,
    product: product.id,
    start: getFutureDate(start),
    end: getFutureDate(end),
    borrow_agreement: borrowAgreement?.id,
  });
}

test.describe("instance-wide borrowing terms", () => {
  test.afterEach(async () => {
    const pb = await pocketbase();
    await pb
      .collection("leihbase")
      .update((await getLeihbase()).id, { borrow_agreement: "" });
  });

  test("apply to all locations, and one acceptance covers them all", async () => {
    const borrowAgreement = await createInstanceBorrowAgreement();
    const firstProduct = await createProduct(await createLocation("multiple"));
    const secondProduct = await createProduct(await createLocation("multiple"));
    const { user, userPb } = await createBorrower();

    await expect(
      reserveApi(userPb, user, firstProduct, [1, 2])
    ).rejects.toThrow("Borrow_agreement_not_accepted.");

    // Accepting them along with a reservation at one location...
    await reserveApi(userPb, user, firstProduct, [1, 2], borrowAgreement);
    expect(
      (await getBorrowAgreementAcceptances(user.id)).map(
        (a) => a.borrow_agreement
      )
    ).toEqual([borrowAgreement.id]);

    // ...allows reserving at another location without accepting again
    await expect(
      reserveApi(userPb, user, secondProduct, [3, 4])
    ).resolves.toBeDefined();
  });

  test("public locations show the borrowing terms that apply", async () => {
    const borrowAgreement = await createInstanceBorrowAgreement();
    const usesInstance = await createLocation("multiple");
    const ownTerms = await createLocation("multiple");
    const ownBorrowAgreement = await createBorrowAgreement(ownTerms);
    const pb = new Client(
      process.env.POCKETBASE_BASE_URL || "http://127.0.0.1:8081"
    );

    const publicUsesInstance = await pb
      .collection("public_locations")
      .getOne(usesInstance.id);
    expect(publicUsesInstance.borrow_agreement).toBe(borrowAgreement.id);
    const publicOwnTerms = await pb
      .collection("public_locations")
      .getOne(ownTerms.id);
    expect(publicOwnTerms.borrow_agreement).toBe(ownBorrowAgreement.id);
  });

  test("a location's own borrowing terms take precedence", async () => {
    const instanceBorrowAgreement = await createInstanceBorrowAgreement();
    const location = await createLocation("multiple");
    const ownBorrowAgreement = await createBorrowAgreement(location);
    const product = await createProduct(location);
    const { user, userPb } = await createBorrower();

    // Accepting the instance-wide terms isn't enough here
    await userPb.collection("borrow_agreement_acceptances").create({
      user: user.id,
      borrow_agreement: instanceBorrowAgreement.id,
    });
    await expect(reserveApi(userPb, user, product, [1, 2])).rejects.toThrow(
      "Borrow_agreement_not_accepted."
    );
    await expect(
      reserveApi(userPb, user, product, [1, 2], ownBorrowAgreement)
    ).resolves.toBeDefined();
  });

  test("a new version has to be accepted again, a minor edit doesn't", async () => {
    const borrowAgreement = await createInstanceBorrowAgreement();
    const location = await createLocation("multiple");
    // A product per reservation: users can't reserve a product twice
    const [first, second, third] = await Promise.all([
      createProduct(location),
      createProduct(location),
      createProduct(location),
    ]);
    const { user, userPb } = await createBorrower();
    await reserveApi(userPb, user, first!, [1, 2], borrowAgreement);

    // Minor edit: updated in place
    const pb = await pocketbase();
    await pb
      .collection("borrow_agreements")
      .update(borrowAgreement.id, { content: "<p>Treat items with care.</p>" });
    await expect(
      reserveApi(userPb, user, second!, [3, 4])
    ).resolves.toBeDefined();

    // New version
    await createInstanceBorrowAgreement("<p>New terms.</p>");
    await expect(reserveApi(userPb, user, third!, [5, 6])).rejects.toThrow(
      "Borrow_agreement_not_accepted."
    );

    // The previous version can no longer be accepted
    await expect(
      userPb
        .collection("borrow_agreement_acceptances")
        .create({ user: user.id, borrow_agreement: borrowAgreement.id })
    ).rejects.toThrow("Borrow_agreement_not_current.");
  });

  test("managers record and see acceptances in the store", async () => {
    const borrowAgreement = await createInstanceBorrowAgreement();
    const location = await createLocation("multiple");
    const { pb: managerPb } = await createStaff("manager", [location.id]);
    const { user } = await createBorrower();

    const acceptance = await managerPb
      .collection("borrow_agreement_acceptances")
      .create({ user: user.id, borrow_agreement: borrowAgreement.id });
    expect(acceptance.recorded_by).not.toBe("");

    const listed = await managerPb
      .collection("borrow_agreement_acceptances")
      .getFullList({
        filter: managerPb.filter("user = {:user}", { user: user.id }),
      });
    expect(listed.map((a) => a.id)).toEqual([acceptance.id]);
  });

  test("admins set the borrowing terms of the instance, not a location's", async () => {
    const leihbase = await getLeihbase();
    const { pb: adminPb } = await createStaff("admin");
    const borrowAgreement = await adminPb
      .collection("borrow_agreements")
      .create({ content: "<p>Set by an admin.</p>" });

    await adminPb
      .collection("leihbase")
      .update(leihbase.id, { borrow_agreement: borrowAgreement.id });
    expect((await getLeihbase()).borrow_agreement).toBe(borrowAgreement.id);

    // Borrowing terms of a location can't become the instance's
    const location = await createLocation("multiple");
    const locationBorrowAgreement = await createBorrowAgreement(location);
    await expect(
      adminPb
        .collection("leihbase")
        .update(leihbase.id, { borrow_agreement: locationBorrowAgreement.id })
    ).rejects.toThrow("Borrow_agreement_of_location.");
  });

  test("managers can't change the borrowing terms of the instance", async () => {
    const leihbase = await getLeihbase();
    const location = await createLocation("multiple");
    const { pb: managerPb } = await createStaff("manager", [location.id]);
    const pb = await pocketbase();
    const borrowAgreement = await pb
      .collection("borrow_agreements")
      .create({ content: "<p>Not set by a manager.</p>" });

    await expect(
      managerPb
        .collection("leihbase")
        .update(leihbase.id, { borrow_agreement: borrowAgreement.id })
    ).rejects.toThrow(ClientResponseError);
  });

  test("admin edits them in the instance settings, and users accept them when reserving", async ({
    page,
    browser,
  }) => {
    const location = await createLocation("multiple");
    const product = await createProduct(location);
    const { user: admin } = await createStaff("admin", [location.id]);

    // Admin enters the borrowing terms
    await login(page, admin.email, DEFAULT_PASSWORD);
    await page.goto(`/admin/${location.slug}/settings`);
    await waitForHydration(page);
    await page.getByTestId("instance-settings-link").click();
    await page.waitForURL("/admin/settings");
    await waitForHydration(page);
    // The editor in the "Borrowing terms" section, after the description's
    await page
      .locator("section")
      .filter({
        has: page.getByRole("heading", { name: "Borrowing terms" }),
      })
      .locator(".ql-editor")
      .fill("Treat all items with care, at every location.");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Settings saved.")).toBeVisible();
    expect((await getLeihbase()).borrow_agreement).not.toBe("");

    // The location settings mention them
    await page.goto(`/admin/${location.slug}/settings`);
    await waitForHydration(page);
    await expect(
      page.getByTestId("borrow-agreement-instance-info")
    ).toBeVisible();

    // A user accepts them when reserving at the location, in their own browser
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    const email = `instance-terms-${uniqueId()}@example.com`;
    const user = await createUser(email, DEFAULT_PASSWORD);
    await login(userPage, email, DEFAULT_PASSWORD);
    await userPage.goto(`/l/${location.slug}/p/${product.id}`);
    await reserve(userPage, 0, 1);
    await expect(
      userPage.getByTestId("borrow-agreement-content")
    ).toContainText("at every location");
    await userPage.getByTestId("borrow-agreement-checkbox").check();
    await userPage.getByTestId("reserve-submit").click();
    await closeReservationDialog(userPage);
    expect(await getBorrowAgreementAcceptances(user.id)).toHaveLength(1);
    await userContext.close();
  });
});
