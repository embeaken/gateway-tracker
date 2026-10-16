import { expect, test } from '@playwright/test'

test.describe('adjacent camera days', () => {
  const days: string[] = []
  const images: string[] = []

  test.beforeEach(async ({ page }) => {
    days.length = 0
    images.length = 0
    await page.clock.setFixedTime(new Date('2026-06-10T16:30:00Z'))
    await page.route('**/api/cams', (route) => route.fulfill({
      json: {
        fetchedAt: '2026-06-10T16:30:00Z',
        sites: [{
          projectId: 'hudson-county-shaft',
          views: [{
            frame: '/api/cam-frame/resource6/latest',
            takenAt: '2026-06-10T16:00:00Z',
            camera: 'camera',
            ref: 'r1',
            since: '2026-06-08T13:00:00Z',
          }],
          panoramas: ['camera'],
        }],
      },
    }))
    await page.route('**/api/cam-archive/**', (route) => {
      const day = new URL(route.request().url()).searchParams.get('date')!
      days.push(day)
      return route.fulfill({
        json: {
          frames: (day === '2026-06-10' ? ['09:00', '12:00'] : ['09:00', '12:00', '15:00']).map((time) => ({
            frame: `/api/cam-frame/resource6/${day}-${time}`,
            takenAt: `${day}T${time}:00-04:00`,
          })),
        },
      })
    })
    await page.route('**/api/cam-frame/**', (route) => {
      images.push(new URL(route.request().url()).pathname)
      return route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"/>',
      })
    })
  })

  test('warms matching times, reuses lists, and respects the date bounds', async ({ page }) => {
    await page.goto('/cameras')
    const card = page.locator('#hudson-county-shaft')
    await expect.poll(() => images.some((url) => url.endsWith('2026-06-09-12:00'))).toBe(true)
    expect(days).toEqual(['2026-06-10', '2026-06-09'])
    expect(images.some((url) => url.includes('2026-06-09-15:00'))).toBe(false)

    await card.getByRole('button', { name: 'Previous day' }).click()
    await expect(card.locator('.control-label b')).toContainText('12:00 PM')
    await expect.poll(() => images.some((url) => url.endsWith('2026-06-08-12:00'))).toBe(true)
    expect(days.filter((day) => day === '2026-06-09')).toHaveLength(1)

    await card.getByRole('button', { name: 'Earlier photo' }).click()
    await expect.poll(() => images.some((url) => url.endsWith('2026-06-08-09:00'))).toBe(true)
    expect(days.filter((day) => day === '2026-06-08')).toHaveLength(1)

    await card.getByRole('button', { name: 'Previous day' }).click()
    await expect(card.locator('.control-label b')).toContainText('9:00 AM')
    await expect(card.getByRole('button', { name: 'Previous day' })).toBeDisabled()
    await page.waitForTimeout(400)
    expect(days.every((day) => day >= '2026-06-08' && day <= '2026-06-10')).toBe(true)
  })

  test('navigation shares an in-flight prefetch', async ({ page }) => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    let requests = 0
    await page.route('**/api/cam-archive/**', async (route) => {
      if (new URL(route.request().url()).searchParams.get('date') !== '2026-06-09') {
        await route.fallback()
        return
      }
      requests++
      await gate
      await route.fallback()
    })
    await page.goto('/cameras')
    await expect.poll(() => requests).toBe(1)
    const card = page.locator('#hudson-county-shaft')
    await card.getByRole('button', { name: 'Previous day' }).click()
    await expect(card.locator('.stage')).toHaveAttribute('aria-busy', 'true')
    release()
    await expect(card.locator('.control-label b')).toContainText('12:00 PM')
    await expect(card.locator('.stage img').last()).toHaveAttribute('src', /2026-06-09-12:00/)
    expect(requests).toBe(1)
  })

  test("doesn't keep today's list in memory", async ({ page }) => {
    await page.goto('/cameras')
    const card = page.locator('#hudson-county-shaft')
    await expect.poll(() => days.includes('2026-06-09')).toBe(true)
    await card.getByRole('button', { name: 'Previous day' }).click()
    await expect(card.locator('.control-label b')).toContainText('June 9')
    await card.getByRole('button', { name: 'Next day' }).click()
    await expect.poll(() => days.filter((day) => day === '2026-06-10').length).toBe(2)
  })

  test('warms the next photo across midnight at the start of a day', async ({ page }) => {
    await page.goto('/cameras')
    const card = page.locator('#hudson-county-shaft')
    await expect.poll(() => images.some((url) => url.endsWith('2026-06-09-12:00'))).toBe(true)
    expect(images.some((url) => url.endsWith('2026-06-09-15:00'))).toBe(false)
    await card.getByRole('button', { name: 'Earlier photo' }).click()
    await expect.poll(() => images.some((url) => url.endsWith('2026-06-09-15:00'))).toBe(true)
  })

  test('switching to panoramas cancels stale image warming', async ({ page }) => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    let started = false
    await page.route('**/api/cam-archive/**', async (route) => {
      if (new URL(route.request().url()).searchParams.get('date') === '2026-06-09') {
        started = true
        await gate
      }
      await route.fallback()
    })
    await page.route('**/api/cam-panoramas/**', (route) => route.fulfill({
      json: { frames: [{ frame: '/api/cam-frame/resource6/pano', takenAt: '2026-06-10T16:00:00Z' }] },
    }))
    await page.goto('/cameras')
    await expect.poll(() => started).toBe(true)
    const card = page.locator('#hudson-county-shaft')
    await card.getByRole('button', { name: 'Panorama' }).click()
    await expect(card.locator('.stage img').last()).toHaveAttribute('src', /pano/)
    release()
    await expect.poll(() => days.includes('2026-06-09')).toBe(true)
    await page.waitForTimeout(400)
    expect(images.some((url) => url.includes('2026-06-09'))).toBe(false)
    expect(days).not.toContain('2026-06-08')
  })

  test('failed prefetch stays silent and is retried on navigation', async ({ page }) => {
    let attempts = 0
    await page.route('**/api/cam-archive/**', async (route) => {
      if (new URL(route.request().url()).searchParams.get('date') === '2026-06-09' && ++attempts === 1) {
        await route.fulfill({ status: 503, body: 'Unavailable' })
      } else {
        await route.fallback()
      }
    })
    await page.goto('/cameras')
    const card = page.locator('#hudson-county-shaft')
    await expect.poll(() => attempts).toBe(1)
    await expect(card.locator('.stage img').last()).toHaveAttribute('src', /2026-06-10-12:00/)
    await card.getByRole('button', { name: 'Previous day' }).click()
    await expect(card.locator('.stage img').last()).toHaveAttribute('src', /2026-06-09-12:00/)
    expect(attempts).toBe(2)
  })
})
