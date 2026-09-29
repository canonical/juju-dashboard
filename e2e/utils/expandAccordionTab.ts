import type { Locator } from "@playwright/test";

/**
 * Expands an accordion tab if it isn't already open.
 * Accordion tabs retain their expanded state between interactions, so clicking
 * an already-open tab would collapse it — this guard prevents that.
 */
export async function expandAccordionTab(tab: Locator): Promise<void> {
  if ((await tab.getAttribute("aria-expanded")) !== "true") {
    await tab.click();
  }
}
