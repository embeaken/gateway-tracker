import data from './fundingData.json'

// Written by scripts/update_funding.py from USAspending.gov. Amounts in dollars.

export type FundingPeriod = {
  /** First and last calendar month (YYYY-MM) this payment figure covers */
  from: string
  to: string
  amount: number
}

export type FederalAward = {
  key: 'cig' | 'fsp' | 'raise' | 'mega'
  name: string
  agency: string
  recipient: 'GDC' | 'Amtrak'
  usaspendingUrl: string
  /** Maximum in the signed agreement */
  committed: number
  /** Released so far (legally available to pay out) */
  obligated: number
  /** Paid out so far */
  paid: number
  lastModified: string | null
  monthly: FundingPeriod[]
}

export type FundingData = {
  source: string
  /** Latest month (YYYY-MM) covered */
  through: string
  awards: FederalAward[]
}

export const fundingData = data as FundingData
