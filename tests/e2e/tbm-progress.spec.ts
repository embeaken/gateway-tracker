import { expect, test } from '@playwright/test'
import type { Tbm } from '../../src/assets/data'
import { estimateTbmProgress } from '../../src/useTbmProgress'

const tbm: Tbm = { id: 'test', label: 'Test TBM', tube: 'North', launched: '2026-10-08' }
const reported: Tbm = { ...tbm, reported: { date: '2026-11-20', ft: 400 } }

test('estimates from launch until an official report is effective', () => {
  const beforeReport = new Date('2026-11-20T04:00:00Z') // Still Thursday in New York.
  const fromLaunch = estimateTbmProgress(tbm, beforeReport).ft
  expect(fromLaunch).toBeGreaterThan(400)
  expect(estimateTbmProgress(reported, beforeReport).ft).toBe(fromLaunch)
})

test('holds the official figure for the New York report day and resumes on weekdays', () => {
  // 10 PM Friday in New York, even though UTC is already Saturday.
  expect(estimateTbmProgress(reported, new Date('2026-11-21T03:00:00Z')).ft).toBe(400)
  expect(estimateTbmProgress(reported, new Date('2026-11-22T17:00:00Z')).ft).toBe(400)
  expect(Math.round(estimateTbmProgress(reported, new Date('2026-11-23T17:00:00Z')).ft)).toBe(410)
})
