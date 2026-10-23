import { expect, type Page } from "@playwright/test";
import { ClientResponseError } from "pocketbase";
import type { Location } from "../../web/models/location";
import { pocketbase } from "../services/pocketbase";
import { waitForClientMount } from "./utils";

/**
 * Navigates to the product page,
 * given a product id
 */
export async function navigateToProductPage(page: Page, productId: string) {
  await page.goto(`/l/test-store`);
  await waitForClientMount(page.getByTestId(`product-card-${productId}`));
  await page.getByTestId(`product-card-${productId}`).click();
  await page.waitForURL(/\/l\/test-store\/p\/(.+)/);
  await expect(page.url()).toContain("/l/test-store/p/");
  await expect(page.getByTestId("product-page-h1")).toBeVisible();
}

/**
 * Creates a new product in the specified location, or the first available location
 */
export async function createProduct(location?: Location) {
  // Create test product
  const pb = await pocketbase();
  const targetLocation =
    location || (await pb.collection("location").getFullList()).at(0);
  if (!targetLocation) {
    throw new Error("createProduct: couldn't find location");
  }
  try {
    const product = await pb.collection("products").create({
      active: true,
      name: "Test Product",
      location: targetLocation.id,
      deposit: 10,
      description: "<p>Lorem ipsum dolor.</p>",
    });
    return product;
  } catch (err) {
    console.log(
      "Error creating test product",
      err instanceof ClientResponseError ? err.response.data : err
    );
    throw new Error("createProduct: couldn't create product");
  }
}

/**
 * Fetches a product with the computeAvailability query to populate computedIsAvailable field
 */
export async function getProductWithAvailability(productId: string) {
  const pb = await pocketbase();
  try {
    const product = await pb.collection("products").getOne(productId, {
      query: {
        computeAvailability: true,
      },
    });
    return product;
  } catch (err) {
    console.log(
      "Error fetching product with availability",
      err instanceof ClientResponseError ? err.response.data : err
    );
    throw new Error(
      `getProductWithAvailability: couldn't fetch product ${productId}`
    );
  }
}

/**
 * Returns the last created reservation given a product id
 */
export async function getLastProductReservation(productId: string) {
  const pb = await pocketbase();
  const reservation = await pb
    .collection("reservations")
    .getFirstListItem(`product = '${productId}'`, { sort: "created" });
  return reservation;
}

/**
 * Updates the created reservation given a product id
 */
export async function updateLastProductReservation(
  productId: string,
  data: Record<string, unknown>
) {
  const pb = await pocketbase();
  const reservation = await getLastProductReservation(productId);
  try {
    return await pb.collection("reservations").update(reservation.id, data);
  } catch (e) {
    if (e instanceof ClientResponseError) {
      console.log(JSON.stringify(e.data, null, 2));
    }
    throw e;
  }
}
