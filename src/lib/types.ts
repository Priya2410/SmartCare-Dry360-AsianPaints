export type Role = 'homeowner' | 'applicator' | 'auditor' | 'dealer' | 'ap'

export type StageStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rework'

export interface StageAudit {
  by: string
  at: string
  mode: 'remote' | 'onsite'
  decision: 'approved' | 'rework'
  note: string
}

export interface Stage {
  n: number
  key: string
  title: string
  short: string
  onsite: boolean
  status: StageStatus
  startedAt?: string
  submittedAt?: string
  approvedAt?: string
  photos: string[] // photo keys
  applicatorNote?: string
  aiCheck?: { result: 'clear' | 'flag'; note: string; at: string }
  audits: StageAudit[]
  reading?: string
}

export type PhotoCheckStatus = 'none' | 'submitted' | 'reviewed'
export type DiagnosisStatus = 'none' | 'visit_booked' | 'visit_done' | 'report_ready'
export type QuoteStatus = 'pending' | 'accepted' | 'rejected'
export type BookingStatus = 'none' | 'proposed' | 'confirmed'
export type MonsoonStatus = 'not_started' | 'scheduled' | 'review_passed' | 'on_hold'
export type RetentionStatus = 'held' | 'release_due' | 'released'

export interface ClaimEvent { at: string; title: string; note: string; by: string }

export interface Claim {
  id: string
  raisedAt: string
  area: string
  description: string
  photos: string[]
  step: 1 | 2 | 3 | 4 | 5
  outcome?: 'eligible' | 'excluded'
  decisionNote?: string
  resolution?: 'scheduled' | 'in_progress' | 'verified' | 'closed'
  closedAt?: string
  events: ClaimEvent[]
}

export interface DemoState {
  version: number
  role: Role
  photoCheck: {
    status: PhotoCheckStatus
    requestId?: string
    submittedAt?: string
    area: string
    symptoms: string[]
    description: string
    photos: string[] // data URLs (customer uploads) or photo keys
    expertNote?: string
  }
  diagnosis: { status: DiagnosisStatus; visitAt?: string; reportAt?: string; feePaid: boolean }
  quote: { status: QuoteStatus; decidedAt?: string; rejectReason?: string }
  booking: { status: BookingStatus; confirmedAt?: string }
  stages: Stage[]
  productsScanned: boolean
  completion: { paid90: boolean; paidAt?: string }
  warranty: { active: boolean; activatedAt?: string }
  monsoon: { status: MonsoonStatus; reviewedAt?: string; note?: string }
  retention: { status: RetentionStatus; releasedAt?: string }
  applicatorPay: { tranche: number; paidAt: string; amount: number }[]
  claims: Claim[]
  toasts: number
}
