import { expect, test } from '@playwright/test'

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
}

function visibleActivity(page: import('@playwright/test').Page) {
  return page.getByTestId('mobile-activity').or(page.getByTestId('desktop-activity')).filter({ visible: true }).first()
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
    await expect(page.getByRole('heading', { name: /America is building a big new infrastructure project/i })).toBeVisible()
    await expect(page.getByText('6 / 10')).toBeVisible()
    await expect(page.locator('.feature-photo')).toBeVisible()
    await expect(page.getByText('Live construction camera').first()).toBeVisible()
    await expect(visibleActivity(page).getByRole('heading', { name: /Updates from the GDC/i })).toBeVisible()

    await expectNoHorizontalOverflow(page)
    await page.locator('#app').screenshot({ path: testInfo.outputPath('dashboard-light.png') })
  })

  test('supports core interactions', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Browse latest updates' }).click()
    const visibleTimelineHeading = visibleActivity(page).getByRole('heading', { name: /Updates from the GDC/i })
    await expect(visibleTimelineHeading).toBeInViewport()

    await page.getByRole('tab', { name: 'Photos' }).click()
    await expect(page.getByRole('tab', { name: 'Photos' })).toHaveAttribute('aria-selected', 'true')

    const contextButton = page.getByRole('button', { name: /What's going on/i }).first()
    await contextButton.click()
    await expect(page.getByRole('heading', { name: "What's going on?" })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('heading', { name: "What's going on?" })).toBeHidden()

    await page.getByRole('button', { name: /Switch to dark mode/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expectNoHorizontalOverflow(page)
    await page.locator('#app').screenshot({ path: testInfo.outputPath('dashboard-dark.png') })
  })
})
