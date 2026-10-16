import { randomUUID } from "node:crypto";
import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Returns a unique id, e.g. to create test records with unique emails or slugs.
 */
export function uniqueId() {
  return randomUUID();
}

export async function waitForHydration(page: Page) {
  // Wait for dehydration
  await page.waitForFunction(() => window.useNuxtApp?.().isHydrating === false);
  // Wait extra 500ms to be more sure events are bound to elements
  await page.waitForTimeout(500);
}

export async function waitForClientMount(element: Locator) {
  await expect(element).toHaveAttribute("data-client-mounted", "true");
}

/**
 * Returns a date N days in the future (midnight UTC)
 */
export function getFutureDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns a date N days in the past (midnight UTC)
 */
export function getPastDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns today at midnight UTC
 */
export function getToday(): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
