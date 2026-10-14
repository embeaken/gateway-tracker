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
                { frame: '/api/cam-frame/resource6/test1', takenAt: new Date().toISOString(), camera: 'camera', ref: 'r1', since: '2026-01-01T12:00:00.000Z' },
                { frame: '/api/cam-frame/resource6/test2', takenAt: new Date().toISOString(), camera: 'camera', ref: 'r2', since: '2026-01-01T12:00:00.000Z' },
              ],
              panoramas: [
                { camera: 'camera', since: '2026-01-01T12:00:00.000Z', takenAt: '2026-10-11T16:00:00.000Z' },
              ],
            },
            {
              projectId: 'hudson-yards',
              views: [{ frame: '/api/cam-frame/resource6/test3', takenAt: new Date().toISOString(), camera: 'camera', ref: 'r3', since: '2026-01-01T12:00:00.000Z' }],
              panoramas: [{ camera: 'camera', since: '2026-01-01T12:00:00.000Z', takenAt: '2026-10-11T16:00:00.000Z' }],
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

  test('browses the camera archive', async ({ page }) => {
    const asked: string[] = []
    await page.route('**/api/cam-archive/**', (route) => {
      const url = new URL(route.request().url())
      asked.push(url.pathname + url.search)
      const date = url.searchParams.get('date')
      route.fulfill({
        json: {
          frames: ['09:00', '12:00', '15:00'].map((t, i) => ({
            frame: `/api/cam-frame/resource6/${date}-${i}`,
            takenAt: `${date}T${t}:00.000-04:00`,
          })),
        },
      })
    })

    // The dashboard links to the archive
    await page.getByRole('link', { name: /See all/ }).click()
    await expect(page).toHaveURL(/\/cameras$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Construction cameras' })).toBeVisible()
    await expect(page).toHaveTitle(/Construction cameras/)

    // Every site is on the page; a chip scrolls to its card
    await expect(page.locator('section.viewer-card')).toHaveCount(5)
    await page.getByRole('link', { name: 'Manhattan Access Shaft' }).click()
    await expect(page).toHaveURL(/\/cameras#manhattan-shaft$/)
    await expect(page.locator('#manhattan-shaft')).toBeInViewport()

    // Panoramas are tabs next to the views, and are browsed by date
    await page.route('**/api/cam-panoramas/**', (route) =>
      route.fulfill({
        json: {
          captures: ['2026-08-10', '2026-09-13', '2026-09-29'].map((d, i) => ({
            frame: `/api/cam-frame/resource6/pano-${i}`,
            takenAt: `${d}T17:00:00.000Z`,
          })),
        },
      }),
    )
    const pano = page.locator('#hudson-county-shaft')
    await pano.scrollIntoViewIfNeeded()
    await pano.getByRole('button', { name: 'Panorama' }).click()
    await expect(pano.locator('.control-label b')).toHaveText('September 29, 2026')
    await pano.getByRole('button', { name: 'Earlier panorama' }).click()
    await expect(pano.locator('.control-label b')).toHaveText('September 13, 2026')
    await pano.getByRole('button', { name: 'August 10, 2026' }).click()
    await expect(pano.locator('.control-label b')).toHaveText('August 10, 2026')
    await pano.getByRole('button', { name: 'Latest' }).click()
    await expect(pano.locator('.control-label b')).toHaveText('September 29, 2026')
    await expect(pano.getByRole('button', { name: 'Previous day' })).toHaveCount(0)

    // A site with one view and a panorama still gets a tab to get back to the camera
    const yards = page.locator('#hudson-yards')
    await yards.scrollIntoViewIfNeeded()
    await expect(yards.getByRole('button', { name: 'Camera' })).toHaveAttribute('aria-pressed', 'true')
    await yards.getByRole('button', { name: 'Panorama' }).click()
    await expect(yards.locator('.control-label b')).toHaveText('September 29, 2026')
    await yards.getByRole('button', { name: 'Camera' }).click()
    await expect(yards.getByRole('button', { name: 'Previous day' })).toBeVisible()

    // A site with two views: pick one, step a day back, an earlier photo
    const card = page.locator('#hudson-county-shaft')
    await card.scrollIntoViewIfNeeded()
    await card.getByRole('button', { name: 'View 2' }).click()
    await expect(card.locator('.stage img').last()).toBeVisible()
    await card.getByRole('button', { name: 'Previous day' }).click()
    await expect.poll(() => asked.some((u) => u.includes('ref=r2') && u.includes('kind=day'))).toBe(true)
    await card.getByRole('button', { name: 'Earlier photo' }).click()
    await expect(card.locator('.control-label b')).toContainText('12:00 PM')

    // Scrolling over the photo zooms in around the pointer; double click resets
    const stage = card.locator('.stage')
    const box = (await stage.boundingBox())!
    // A double click at 100% nudges in to 1.4×, another resets
    await stage.dblclick()
    await expect(card.locator('.zoom-badge')).toContainText('1.4×')
    await stage.dblclick()
    await expect(card.locator('.zoom-badge')).toHaveCount(0)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, -400)
    await expect(card.locator('.zoom-badge')).toBeVisible()
    // Zoomed in, a larger size is requested (half, then full once enlarged past 1920px)
    await expect(card.locator('.stage img').last()).toHaveAttribute('src', /size=(half|full)/)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 20)
    await page.mouse.up()
    await stage.dblclick()
    await expect(card.locator('.zoom-badge')).toHaveCount(0)

    // One slider covers days and times: "Today" jumps to the latest photo, and
    // stepping back past the first photo of a day lands on the last of the day before
    const label = card.locator('.control-label b')
    await card.getByRole('button', { name: 'Today' }).click()
    await expect(card.getByRole('button', { name: 'Next day' })).toBeDisabled()
    await expect(card.locator('.control-label b')).toContainText('3:00 PM')
    const todayLabel = await label.textContent()
    for (let i = 0; i < 3; i++) await card.getByRole('button', { name: 'Earlier photo' }).click()
    await expect(label).not.toHaveText(todayLabel!)
    await expect(card.locator('.control-label b')).toContainText('3:00 PM')
    // The day buttons keep the time of day
    await card.getByRole('button', { name: 'Earlier photo' }).click()
    const time = (await label.textContent())!.split(' · ')[1]
    await card.getByRole('button', { name: 'Next day' }).click()
    await expect(label).toContainText(time)
    await expect(card.getByRole('link', { name: /EarthCam/ })).toHaveAttribute('href', /earthcam\.net/)

    // Old per-site links and unknown paths
    await page.goto('/cameras/river')
    await expect(page).toHaveURL(/\/cameras#river$/)
    await expectNoHorizontalOverflow(page)
  })
})
