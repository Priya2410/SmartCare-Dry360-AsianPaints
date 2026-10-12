import type { DemoState, Stage } from './types'

/* ------------------------------------------------------------------ */
/* Business constants — from the SmartCare Dry360 solution document    */
/* ------------------------------------------------------------------ */
export const RULES = {
  photoCheckHours: 24,
  diagnosisFee: 999,
  pricePerSqFt: 75,
  workWarrantyYears: 2,
  retentionPct: 10,
  stages: 7,
  onsiteAudits: 2,
  applicatorStartDays: 10,
}

/* ------------------------------------------------------------------ */
/* Seeded demo scenario. Every value below is a DEMO ASSUMPTION unless */
/* marked as coming from research.                                     */
/* ------------------------------------------------------------------ */
export const CUSTOMER = {
  name: 'Jayadevi S.',
  first: 'Jayadevi',
  phone: '+91 98450 •• •• 12',
  email: 'jayadevi.s@example.com',
  city: 'Bengaluru',
}

export const PROPERTY = {
  id: 'WHR-BLR-560076-0418',
  type: 'Independent house (G+1)',
  address: '18, 4th Cross, BTM 2nd Stage, Bengaluru 560076',
  built: 2009,
  terraceArea: 1000,
  surface: 'Terrace',
  issue: 'Terrace seepage causing ceiling damp patch',
  affected: 'Upstairs bedroom ceiling, north-east corner',
}

export const JOB = {
  id: 'SCA-270419',
  requestId: 'PC-270406-118',
  area: 1000,
  value: 75000, // ₹75/sq ft × 1,000 sq ft
  system: 'SmartCare Damp Proof system',
  systemWarranty: 'Up to 10 years (as per product system terms)',
  batch: 'SC-DP-270418-B7',
  // customer-facing quote lines (sum = job value)
  quote: [
    { label: 'Surface preparation, crack cutting, parapet & drain-collar detailing', sub: 'Labour by certified applicator', amount: 31688 },
    { label: 'SmartCare Damp Proof system — material', sub: 'Billed at your AP dealer counter', amount: 40499 },
    { label: 'Assurance: 2 on-site audits, 7-stage photo record, work warranty', sub: 'AP service fee', amount: 2813 },
  ],
}

export const DATES = {
  photoCheck: '2027-04-06T09:42',
  expertReview: '2027-04-06T17:10',
  visit: '2027-04-08T11:00',
  report: '2027-04-08T18:30',
  quoteAccepted: '2027-04-09T10:15',
  bookingConfirmed: '2027-04-09T10:22',
  jobStart: '2027-04-19',
  jobEnd: '2027-04-24',
  completion: '2027-04-24T17:30',
  monsoonReview: '2027-09-30',
  warrantyEnd: '2029-04-24',
}

// timestamps used when stages are advanced in the demo (deterministic)
export const STAGE_TIMES: Record<number, { start: string; submit: string; approve: string }> = {
  1: { start: '2027-04-19T08:30', submit: '2027-04-19T12:10', approve: '2027-04-19T13:05' },
  2: { start: '2027-04-19T14:00', submit: '2027-04-20T11:40', approve: '2027-04-20T12:30' },
  3: { start: '2027-04-20T13:00', submit: '2027-04-20T17:20', approve: '2027-04-20T18:05' },
  4: { start: '2027-04-21T08:30', submit: '2027-04-21T09:15', approve: '2027-04-21T09:50' },
  5: { start: '2027-04-21T10:00', submit: '2027-04-22T16:30', approve: '2027-04-22T17:15' },
  6: { start: '2027-04-23T09:00', submit: '2027-04-23T10:30', approve: '2027-04-23T11:20' },
  7: { start: '2027-04-23T12:00', submit: '2027-04-24T12:00', approve: '2027-04-24T13:10' },
}

export const PEOPLE = {
  diagnostician: { name: 'Er. Kavya Raman', role: 'AP Diagnostician', id: 'APD-BLR-031', cred: 'Diploma, Civil Engineering · 6 yrs site experience', note: 'Salaried by Asian Paints. Pay is not linked to material or job sales.' },
  applicator: { name: 'Manjunath K.', firm: 'MK Waterproofing Works', id: 'CAP-BLR-0217', level: 'Certified', surface: 'Terrace systems', jobs: 38, audited: 14, repeat: '1 of 38 (2.6%)', since: 'Feb 2027', training: '5-day terrace module · passed' },
  auditor: { name: 'Suresh Iyer', role: 'AP Quality Auditor', id: 'APQ-BLR-007', note: 'Reports to AP Quality, not to sales.' },
  dealer: { name: 'Sri Lakshmi Paints & Hardware', area: 'BTM Layout, Bengaluru', code: 'APD-56-1182', owner: 'Ravi Shankar' },
  warrantyDesk: { name: 'AP Warranty Desk', id: 'Bengaluru service centre' },
  lead: { name: 'Anil Deshpande', role: 'City Waterproofing Lead, Bengaluru' },
}

export const STAGE_DEFS: Omit<Stage, 'status' | 'photos' | 'audits'>[] = [
  { n: 1, key: 'clean', title: 'Surface cleaning', short: 'Surface clean', onsite: false, applicatorNote: 'Old coating, moss and loose screed removed; surface pressure-washed and dried.' },
  { n: 2, key: 'cracks', title: 'Crack cutting & preparation', short: 'Cracks cut', onsite: false, applicatorNote: 'Hairline cracks V-cut and filled; parapet–slab joint opened and cleaned for detailing.' },
  { n: 3, key: 'slope', title: 'Slope & drain detailing', short: 'Slope & drain', onsite: false, applicatorNote: 'Drain collar rebuilt; coving at parapet junction; slope towards outlet checked with level.' },
  { n: 4, key: 'mix', title: 'Material mixing', short: 'Mixing', onsite: false, applicatorNote: 'Two-component mix per data sheet; batch label photographed before opening.' },
  { n: 5, key: 'thick', title: 'Application thickness verification', short: 'Thickness', onsite: false, applicatorNote: 'Two coats applied cross-wise; wet-film gauge readings logged at 5 points.', reading: 'Avg. 1.6 mm DFT across 5 points (demo value)' },
  { n: 6, key: 'precover', title: 'Pre-cover audit', short: 'Pre-cover audit', onsite: true, applicatorNote: 'Membrane cured; ready for protective layer. Auditor visit requested.' },
  { n: 7, key: 'water', title: 'Water test', short: 'Water test', onsite: true, applicatorNote: 'Ponding test set up at 50 mm; ceiling below checked at start and end.', reading: '48-hr ponding: no seepage observed below (demo assumption)' },
]

export const STAGE_PHOTOS: Record<string, string[]> = {
  clean: ['clean1', 'clean2'],
  cracks: ['crack1', 'crack2'],
  slope: ['drain1', 'slope1'],
  mix: ['mix1', 'batch1'],
  thick: ['coat1', 'gauge1'],
  precover: ['membrane1', 'audit1'],
  water: ['pond1', 'ceiling1'],
}

export function freshStages(): Stage[] {
  return STAGE_DEFS.map((d) => ({ ...d, status: 'pending', photos: [], audits: [] }))
}

export function initialState(): DemoState {
  return {
    version: 3,
    role: 'homeowner',
    photoCheck: { status: 'none', area: 'Terrace', symptoms: ['Damp patch'], description: '', photos: [] },
    diagnosis: { status: 'none', feePaid: false },
    quote: { status: 'pending' },
    booking: { status: 'none' },
    stages: freshStages(),
    productsScanned: false,
    completion: { paid90: false },
    warranty: { active: false },
    monsoon: { status: 'not_started' },
    retention: { status: 'held' },
    applicatorPay: [],
    claims: [],
    toasts: 0,
  }
}

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

export const fmtDate = (s?: string) => {
  if (!s) return '—'
  const d = new Date(s.length <= 10 ? s + 'T00:00' : s)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
export const fmtDateTime = (s?: string) => {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export const RETENTION = Math.round((JOB.value * RULES.retentionPct) / 100) // 7,500
export const NINETY = JOB.value - RETENTION // 67,500

// AP pays the applicator at verified stages (demo assumption: 30/40/30 split of labour)
export const APPLICATOR_TRANCHES = [
  { tranche: 1, afterStage: 2, pct: 30, label: 'Prep verified (stages 1–2)' },
  { tranche: 2, afterStage: 5, pct: 40, label: 'Application verified (stages 3–5)' },
  { tranche: 3, afterStage: 7, pct: 30, label: 'Audits passed (stages 6–7)' },
]
export const LABOUR = JOB.quote[0].amount
