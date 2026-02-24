import { test, expect } from "@playwright/test";

test.describe("Home Page E2E", () => {
  test("should load the landing page and show features", async ({ page }) => {
    // Start from the index page
    await page.goto("/");

    // Check for the main heading
    await expect(page.locator("h1")).toContainText("Precise.");

    // Check for navigation links
    const enterWorkspace = page.getByRole("link", { name: /Enter Workspace/i });
    await expect(enterWorkspace).toBeVisible();
    await expect(enterWorkspace).toHaveAttribute("href", "/graph");

    // Check for feature cards
    await expect(page.getByText("Graphing Workspace")).toBeVisible();
    await expect(page.getByText("3D Mapping")).toBeVisible();
  });

  test("should be able to access the graph page", async ({ page }) => {
    // Navigate directly to /graph to verify it loads
    await page.goto("/graph");

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    // Verify we're on the graph page
    await expect(page).toHaveURL(/\/graph/);
  });
});
