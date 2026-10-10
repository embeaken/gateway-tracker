import { expect, test } from '@playwright/test'

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
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
    await expect(page.locator('.feature-photo')).toBeVisible()
    await expect(page.locator('.route-card')).toBeVisible()
    await expect(page.getByText('About this graphic')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Construction cameras' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Updates from the GDC/i })).toBeVisible()

    await expectNoHorizontalOverflow(page)
    await page.locator('#app').screenshot({ path: testInfo.outputPath('dashboard-light.png') })
  })

  test('supports core interactions', async ({ page }, testInfo) => {
    // The explainer drawer opens from the header and closes with Escape.
    await expect(page.getByRole('dialog', { name: "What is this?" })).toHaveCount(0)
    const explainerBtn = page.getByRole('button', { name: /What is this/i })
    await explainerBtn.click()
    await expect(page.getByRole('dialog', { name: "What is this?" })).toBeVisible()
    // Focus stays in the drawer, then returns to the button.
    for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+Tab')
    expect(await page.evaluate(() => !document.getElementById('app')?.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: "What is this?" })).toHaveCount(0)
    await expect(explainerBtn).toBeFocused()

    // Route map sites highlight on hover but don't link anywhere.
    await expect(page.locator('#route a[href^="#cam-"]')).toHaveCount(0)
    const hit = page.locator('.hit:visible').first()
    if (await hit.count()) {
      await hit.hover()
      await expect(page.locator('.flabel--hover, .glow--on').first()).toBeAttached()
    }

    await page.getByRole('button', { name: /Switch to dark mode/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expectNoHorizontalOverflow(page)
    await page.locator('#app').screenshot({ path: testInfo.outputPath('dashboard-dark.png') })
  })
})
