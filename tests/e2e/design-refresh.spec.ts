import { expect, test } from '@playwright/test'

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
}

function visibleActivity(page: import('@playwright/test').Page) {
  return page.getByTestId('activity')
}

test.describe('design refresh smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.addStyleTag({
      content: `
        vite-plugin-vue-devtools,
        [data-vue-devtools],
        #vue-devtools-container,
        #__vue-devtools-container__,
        .vue-devtools__anchor {
          display: none !important;
        }
      `,
    })
  })

  test('renders the civic overview and dashboard frame', async ({ page }, testInfo) => {
    await expect(page.getByRole('link', { name: 'hudson.tube home' })).toBeVisible()
    await expect(page.getByText('Tracking the new Hudson River rail tunnels')).toBeVisible()
    await expect(page.locator('.feature-photo')).toBeVisible()
    await expect(page.locator('.feature-photo').getByRole('heading', { name: /TBM 1/ })).toBeVisible()
    await expect(page.locator('.route-card')).toBeVisible()
    await expect(page.getByText('TBM positions are estimates')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Construction cameras' })).toBeVisible()
    await expect(visibleActivity(page).getByRole('heading', { name: /Updates from the GDC/i })).toBeVisible()

    await expectNoHorizontalOverflow(page)
    await page.locator('#app').screenshot({ path: testInfo.outputPath('dashboard-light.png') })
  })

  test('supports core interactions', async ({ page }, testInfo) => {
    // The explainer drawer opens from the header and closes with Escape.
    await expect(page.getByRole('dialog', { name: "What is this?" })).toHaveCount(0)
    await page.getByRole('button', { name: /What is this/i }).click()
    await expect(page.getByRole('dialog', { name: "What is this?" })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: "What is this?" })).toHaveCount(0)

    // Route map stops jump to their camera.
    await page.locator('.strip, .vline').locator('a:visible').first().click()
    await expect(page).toHaveURL(/#cam-palisades-tunnel$/)

    await page.getByRole('button', { name: /Switch to dark mode/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expectNoHorizontalOverflow(page)
    await page.locator('#app').screenshot({ path: testInfo.outputPath('dashboard-dark.png') })
  })
})
