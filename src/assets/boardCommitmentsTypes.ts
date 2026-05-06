export type CommitmentCategory =
  | 'construction'
  | 'delivery-partner'
  | 'professional-services'
  | 'funding'
  | 'operating-budget'
  | 'governance'

export type Commitment = {
  meetingDate: string
  minutesPdf: string
  resolutionId: string
  title: string
  contractId: string | null
  amountUsd: number | null
  category: CommitmentCategory
  isDuplicate: boolean
}
