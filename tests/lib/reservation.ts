import { expect, type Page } from "@playwright/test";
import Client from "pocketbase";
import { waitForClientMount } from "./utils";

/**
 * Creates a new reservation
 */
export async function createReservation(
  pb: Client,
  {
    user,
    product,
    location,
    start,
    end,
  }: {
    user: string;
    product: string;
    location: string;
    start: Date;
    end: Date;
  }
) {
  const reservation = await pb.collection("reservations").create({
    user,
    product,
    location,
    start,
    end,
  });
  return reservation;
}

/**
 * Opens the reservation dialog on the product page, selects the start and end
 * date and submits the form
 */
export async function reserve(
  page: Page,
  startIndex: number,
  endIndex: number,
  navigateToNextMonth = true
) {
  // Click reserve
  await waitForClientMount(page.getByTestId("reserve-button"));
  await page.getByTestId("reserve-button").click();
  // Reserve
  await expect(page.getByTestId("opening-hours")).toBeVisible();
  // enter start
  await page.getByTestId("start-input").click();
  await expect(page.getByTestId("start-input-calendar")).toBeVisible();
  // go to next month to be sure we're not trying to reserve at the end
  // of this month, as it might result in no date buttons being available
  if (navigateToNextMonth) {
    await page
      .getByTestId("start-input-calendar")
      .locator("div button")
      .nth(1)
      .click({ force: true });
  }
  await page
    .getByTestId("start-input-calendar")
    .locator("shadow=calendar-month >> td button:not([aria-disabled=true])")
    .nth(startIndex)
    .click();
  // enter end
  await page.getByTestId("end-input").click();
  await expect(page.getByTestId("end-input-calendar")).toBeVisible();
  // go to next month to be sure we're not trying to reserve at the end
  // of this month, as it might result in no date buttons being available
  if (navigateToNextMonth) {
    await page
      .getByTestId("end-input-calendar")
      .locator("div button")
      .nth(1)
      .click({ force: true });
  }
  await page
    .getByTestId("end-input-calendar")
    .locator("shadow=calendar-month >> td button:not([aria-disabled=true])")
    .nth(endIndex)
    .click();
  // submit
  await page.getByTestId("reserve-submit").click();
}
