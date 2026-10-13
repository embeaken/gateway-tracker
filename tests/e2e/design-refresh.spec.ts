import { expect, test } from '@playwright/test'

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
}

// A 1×1 JPEG, so camera tiles render without reaching EarthCam
const PIXEL = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64',
)

test.describe('dashboard smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/cams', (route) =>
      route.fulfill({
        json: {
          fetchedAt: new Date().toISOString(),
          sites: [
            {
              projectId: 'hudson-county-shaft',
              views: [
                { label: 'View 1', frame: '/api/cam-frame/resource6/test1', takenAt: new Date().toISOString() },
                { label: 'View 2', frame: '/api/cam-frame/resource6/test2', takenAt: new Date().toISOString() },
              ],
            },
          ],
        },
      }),
    )
    await page.route('**/api/cam-frame/**', (route) => route.fulfill({ body: PIXEL, contentType: 'image/jpeg' }))
    // GDC photos go through hudson.tube's Image CDN; keep the tests off the network.
    await page.route('**/.netlify/images**', (route) => route.fulfill({ body: PIXEL, contentType: 'image/jpeg' }))
    await page.route('https://share.earthcam.net/**', (route) => route.fulfill({ body: '<html></html>', contentType: 'text/html' }))

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

  test('renders the dashboard', async ({ page }, testInfo) => {
    await expect(page.getByRole('link', { name: 'hudson.tube home' })).toBeVisible()
    if (testInfo.project.name !== 'desktop') {
      // The route map is hidden on phones and tablets for now
      await expect(page.locator('#route')).toBeHidden()
    } else {
      await expect(page.locator('.route-card')).toBeVisible()
      await expect(page.getByText('About this graphic')).toBeVisible()
    }
    await expect(page.locator('.tbm-card')).toHaveCount(2)
    await expect(page.getByRole('heading', { name: 'Construction cameras' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Construction packages' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Financing' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Timeline' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Updates from the GDC/i })).toBeVisible()

    // One tile per project, even when a site has several views
    await expect(page.locator('#cam-hudson-county-shaft')).toBeVisible()
    await expect(page.locator('.cam-tile')).toHaveCount(5)

    await expectNoHorizontalOverflow(page)
    await page.locator('#app').screenshot({ path: testInfo.outputPath('dashboard-light.png') })
  })

  test('supports core interactions', async ({ page }, testInfo) => {
    // The explainer drawer opens from the header and closes with Escape.
    await expect(page.getByRole('dialog', { name: 'What is this?' })).toHaveCount(0)
    const explainerBtn = page.getByRole('button', { name: /What is this/i })
    await explainerBtn.click()
    await expect(page.getByRole('dialog', { name: 'What is this?' })).toBeVisible()
    // Focus stays in the drawer, then returns to the button.
    for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+Tab')
    expect(await page.evaluate(() => !document.getElementById('app')?.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'What is this?' })).toHaveCount(0)
    await expect(explainerBtn).toBeFocused()

    // Route map sites highlight on hover but don't link anywhere.
    await expect(page.locator('#route a[href^="#cam-"]')).toHaveCount(0)
    const hit = page.locator('#route .hit:visible').first()
    if (await hit.count()) {
      await hit.hover()
      await expect(page.locator('.flabel--hover, .glow--on').first()).toBeAttached()
    }

    // A camera tile opens the live player, and Escape closes it.
    const tile = page.getByRole('button', { name: 'Open live camera: Hudson County Access Shaft' })
    await tile.click()
    await expect(page.getByRole('dialog', { name: /Hudson County Access Shaft live camera/ })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(tile).toBeFocused()

    await page.getByRole('button', { name: /Switch to dark mode/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expectNoHorizontalOverflow(page)
    await page.locator('#app').screenshot({ path: testInfo.outputPath('dashboard-dark.png') })
  })
})
