import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { Claim, DemoState, Role, Stage } from './types'
import { APPLICATOR_TRANCHES, DATES, JOB, LABOUR, PEOPLE, STAGE_PHOTOS, STAGE_TIMES, initialState } from './data'
import { SAMPLE_UPLOADS } from './photos'

const KEY = 'smartcare-assure-demo-v3'

export type Milestone =
  | 'start' | 'photo_submitted' | 'expert_reviewed' | 'report_ready' | 'booked'
  | 'mid_job' | 'job_done' | 'warranty_active' | 'claim_eligible' | 'claim_excluded' | 'monsoon_passed'

export type Action =
  | { type: 'reset' }
  | { type: 'hydrate'; state: DemoState }
  | { type: 'role'; role: Role }
  | { type: 'photoForm'; patch: Partial<DemoState['photoCheck']> }
  | { type: 'submitPhotoCheck' }
  | { type: 'expertReview' }
  | { type: 'bookVisit' }
  | { type: 'completeVisit' }
  | { type: 'acceptQuote' }
  | { type: 'rejectQuote'; reason: string }
  | { type: 'reopenQuote' }
  | { type: 'confirmBooking' }
  | { type: 'stageStart'; n: number }
  | { type: 'stageSubmit'; n: number; photos?: string[] }
  | { type: 'stageAudit'; n: number; decision: 'approved' | 'rework'; note?: string }
  | { type: 'advance' }
  | { type: 'scanProducts' }
  | { type: 'payCompletion' }
  | { type: 'activateWarranty' }
  | { type: 'monsoonReview'; outcome: 'dry' | 'hold' }
  | { type: 'releaseRetention' }
  | { type: 'raiseClaim'; area: string; description: string; photos: string[] }
  | { type: 'claimRetrieve'; id: string }
  | { type: 'claimDecide'; id: string; outcome: 'eligible' | 'excluded' }
  | { type: 'claimProgress'; id: string }
  | { type: 'jump'; to: Milestone }

const upd = (s: DemoState, n: number, f: (st: Stage) => Stage): DemoState => ({ ...s, stages: s.stages.map((st) => (st.n === n ? f(st) : st)) })

export const allApproved = (s: DemoState) => s.stages.every((x) => x.status === 'approved')
export const jobStarted = (s: DemoState) => s.stages.some((x) => x.status !== 'pending')
export const approvedCount = (s: DemoState) => s.stages.filter((x) => x.status === 'approved').length
export const activeStage = (s: DemoState) => s.stages.find((x) => x.status !== 'approved')
export const warrantyChecks = (s: DemoState) => [
  { label: 'AP products scanned at dealer counter', ok: s.productsScanned },
  { label: 'All 7 stage photo sets verified', ok: allApproved(s) },
  { label: 'Pre-cover audit & water test signed by auditor', ok: s.stages[5].status === 'approved' && s.stages[6].status === 'approved' },
  { label: '90% payment made on completion', ok: s.completion.paid90 },
]
export const canActivate = (s: DemoState) => warrantyChecks(s).every((c) => c.ok)
export const openClaim = (s: DemoState) => s.claims.find((c) => c.resolution !== 'closed' && !c.closedAt)

/** journey position 0..5 for the hero tracker */
export function journeyStep(s: DemoState) {
  if (s.warranty.active) return 5
  if (allApproved(s)) return 4
  if (s.booking.status === 'confirmed') return 3
  if (s.diagnosis.status === 'report_ready') return 2
  if (s.photoCheck.status !== 'none') return 1
  return 0
}

function canStart(s: DemoState, n: number) {
  if (s.booking.status !== 'confirmed') return false
  return n === 1 || s.stages[n - 2].status === 'approved'
}

function payTranches(s: DemoState): DemoState {
  const approved = approvedCount(s)
  let pay = s.applicatorPay
  for (const t of APPLICATOR_TRANCHES) {
    if (approved >= t.afterStage && !pay.find((p) => p.tranche === t.tranche)) {
      pay = [...pay, { tranche: t.tranche, paidAt: STAGE_TIMES[t.afterStage].approve, amount: Math.round((LABOUR * t.pct) / 100) }]
    }
  }
  return { ...s, applicatorPay: pay }
}

function reduce(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case 'reset': return { ...initialState(), role: s.role }
    case 'hydrate': return a.state
    case 'role': return { ...s, role: a.role }
    case 'photoForm': return { ...s, photoCheck: { ...s.photoCheck, ...a.patch } }
    case 'submitPhotoCheck':
      if (s.photoCheck.photos.length < 1) return s
      return { ...s, photoCheck: { ...s.photoCheck, status: 'submitted', requestId: JOB.requestId, submittedAt: DATES.photoCheck } }
    case 'expertReview':
      if (s.photoCheck.status !== 'submitted') return s
      return { ...s, photoCheck: { ...s.photoCheck, status: 'reviewed', expertNote: 'Photos suggest water entering at the terrace edge, not a plumbing line. A site visit with a moisture meter is needed to confirm the source before any quote.' } }
    case 'bookVisit':
      if (s.photoCheck.status !== 'reviewed') return s
      return { ...s, diagnosis: { ...s.diagnosis, status: 'visit_booked', visitAt: DATES.visit, feePaid: true } }
    case 'completeVisit':
      if (s.diagnosis.status !== 'visit_booked') return s
      return { ...s, diagnosis: { ...s.diagnosis, status: 'report_ready', reportAt: DATES.report } }
    case 'acceptQuote':
      if (s.diagnosis.status !== 'report_ready') return s
      return { ...s, quote: { status: 'accepted', decidedAt: DATES.quoteAccepted }, booking: { status: 'proposed' } }
    case 'rejectQuote':
      return { ...s, quote: { status: 'rejected', decidedAt: DATES.quoteAccepted, rejectReason: a.reason }, booking: { status: 'none' } }
    case 'reopenQuote':
      return { ...s, quote: { status: 'pending' } }
    case 'confirmBooking':
      if (s.quote.status !== 'accepted') return s
      return { ...s, booking: { status: 'confirmed', confirmedAt: DATES.bookingConfirmed } }
    case 'stageStart':
      if (!canStart(s, a.n)) return s
      return upd(s, a.n, (st) => (st.status === 'pending' ? { ...st, status: 'in_progress', startedAt: STAGE_TIMES[a.n].start } : st))
    case 'stageSubmit': {
      const st = s.stages[a.n - 1]
      if (st.status !== 'in_progress' && st.status !== 'rework') return s
      const photos = a.photos && a.photos.length ? a.photos : STAGE_PHOTOS[st.key]
      const flag = photos.length < 2
      let next = upd(s, a.n, (x) => ({
        ...x, status: 'submitted', photos, submittedAt: STAGE_TIMES[a.n].submit,
        aiCheck: flag
          ? { result: 'flag', note: 'Only one photo received; a wide shot of the full area is missing. Flagged for the auditor.', at: STAGE_TIMES[a.n].submit }
          : { result: 'clear', note: 'Photos are clear, geotagged at the site and time-stamped within the stage window. No missing angles.', at: STAGE_TIMES[a.n].submit },
      }))
      if (a.n === 4) next = { ...next, productsScanned: true }
      return next
    }
    case 'stageAudit': {
      const st = s.stages[a.n - 1]
      if (st.status !== 'submitted') return s
      const audit = {
        by: PEOPLE.auditor.name, at: STAGE_TIMES[a.n].approve, mode: st.onsite ? 'onsite' as const : 'remote' as const, decision: a.decision,
        note: a.note || (a.decision === 'approved'
          ? st.onsite ? (a.n === 6 ? 'On site: membrane continuous, coving and drain collar detailed to spec. Cleared for cover.' : 'On site: ponding held 48 hrs; ceiling below dry at start and end. Water test passed.') : 'Photo evidence matches the stage checklist. Approved.'
          : 'Detailing at the north parapet corner is incomplete. Redo and re-upload close-up photos.'),
      }
      const after = upd(s, a.n, (x) => ({ ...x, status: a.decision, audits: [...x.audits, audit], approvedAt: a.decision === 'approved' ? audit.at : x.approvedAt }))
      return payTranches(after)
    }
    case 'advance': {
      if (s.booking.status !== 'confirmed') return s
      const st = activeStage(s)
      if (!st) return s
      if (st.status === 'pending') return reduce(s, { type: 'stageStart', n: st.n })
      if (st.status === 'in_progress' || st.status === 'rework') return reduce(s, { type: 'stageSubmit', n: st.n })
      if (st.status === 'submitted') return reduce(s, { type: 'stageAudit', n: st.n, decision: 'approved' })
      return s
    }
    case 'scanProducts': return { ...s, productsScanned: true }
    case 'payCompletion':
      if (!allApproved(s)) return s
      return { ...s, completion: { paid90: true, paidAt: DATES.completion } }
    case 'activateWarranty':
      if (!canActivate(s)) return s
      return { ...s, warranty: { active: true, activatedAt: DATES.completion }, monsoon: { status: 'scheduled' } }
    case 'monsoonReview': {
      if (!s.warranty.active) return s
      const oc = openClaim(s)
      if (a.outcome === 'hold' || (oc && oc.outcome === 'eligible')) {
        return { ...s, monsoon: { status: 'on_hold', reviewedAt: DATES.monsoonReview + 'T11:00', note: oc ? `Review on hold: claim ${oc.id} is open. Retention stays with you until rectification is verified and the area passes review.` : 'Damp reading above threshold at one corner. Inspection booked; retention stays with you.' }, retention: { status: 'held' } }
      }
      return { ...s, monsoon: { status: 'review_passed', reviewedAt: DATES.monsoonReview + 'T11:00', note: 'Post-monsoon inspection: ceiling and terrace dry; moisture readings normal.' }, retention: { status: 'release_due' } }
    }
    case 'releaseRetention':
      if (s.retention.status !== 'release_due') return s
      return { ...s, retention: { status: 'released', releasedAt: '2027-10-03T10:00' } }
    case 'raiseClaim': {
      if (!s.warranty.active) return s
      const id = 'CLM-' + (2708 + s.claims.length * 7)
      const at = s.claims.length ? '2027-08-21T09:20' : '2027-07-14T08:45'
      const claim: Claim = {
        id, raisedAt: at, area: a.area, description: a.description, photos: a.photos, step: 1,
        events: [{ at, title: 'Claim raised', note: 'Customer uploaded fresh photos and described the issue.', by: 'Jayadevi S.' }],
      }
      return { ...s, claims: [claim, ...s.claims] }
    }
    case 'claimRetrieve':
      return mapClaim(s, a.id, (c) => c.step !== 1 ? c : ({
        ...c, step: 3,
        events: [...c.events,
          { at: bump(c.raisedAt, 1), title: 'Water Health Record retrieved', note: `Job ${JOB.id}: diagnosis, 7 stage photo sets, 2 audit sign-offs and product batch ${JOB.batch} attached to the claim.`, by: 'System' },
          { at: bump(c.raisedAt, 26), title: 'Independent inspection booked', note: `${PEOPLE.auditor.name} (AP Quality) will inspect. The original applicator does not decide the claim.`, by: 'AP Warranty Desk' }],
      }))
    case 'claimDecide':
      return mapClaim(s, a.id, (c) => c.step !== 3 ? c : ({
        ...c, step: 4, outcome: a.outcome,
        decisionNote: a.outcome === 'eligible'
          ? 'Covered. Membrane lifted at the parapet coving on the north-east corner; stage-3 photos show the coving was formed but the inspection found a debond. This is a workmanship defect under the 2-year work warranty.'
          : 'Not covered. Moisture traced to the concealed bathroom supply line in the wall below, not the terrace. Terrace membrane intact; ponding re-test dry. Plumbing is excluded from the work warranty.',
        events: [...c.events,
          { at: bump(c.raisedAt, 50), title: 'Inspection completed', note: a.outcome === 'eligible' ? 'Moisture meter + thermal scan on site; debond found at coving; photos added to the record.' : 'Moisture meter + thermal scan; wet zone follows the pipe chase; terrace re-test dry.', by: PEOPLE.auditor.name },
          { at: bump(c.raisedAt, 52), title: a.outcome === 'eligible' ? 'Decision: covered' : 'Decision: not covered', note: 'Written decision with photos shared with the customer.', by: 'AP Warranty Desk' }],
      }))
    case 'claimProgress':
      return mapClaim(s, a.id, (c) => {
        if (c.step < 4) return c
        if (c.outcome === 'excluded') {
          if (c.closedAt) return c
          return { ...c, step: 5, resolution: 'closed', closedAt: bump(c.raisedAt, 56), events: [...c.events, { at: bump(c.raisedAt, 56), title: 'Closed with next steps', note: 'Referred to a plumber via your dealer; free Guided advice offered for the wall repair once the line is fixed.', by: 'AP Warranty Desk' }] }
        }
        const order = ['scheduled', 'in_progress', 'verified', 'closed'] as const
        const idx = c.resolution ? order.indexOf(c.resolution) + 1 : 0
        if (idx >= order.length) return c
        const r = order[idx]
        const hrs = [72, 96, 150, 152][idx]
        const ev = {
          scheduled: { title: 'Free rectification scheduled', note: `${PEOPLE.applicator.name} to redo the coving and membrane at the NE corner. No charge to you.` },
          in_progress: { title: 'Rectification in progress', note: 'Stage photos for the repaired area uploaded to the record.' },
          verified: { title: 'Verified by auditor', note: 'Spot ponding test passed; repaired area dry.' },
          closed: { title: 'Claim closed', note: 'Rectification recorded in your Water Health Record. Your 10% retention is unaffected by this closure; it follows the post-monsoon review.' },
        }[r]
        return { ...c, step: 5, resolution: r, closedAt: r === 'closed' ? bump(c.raisedAt, hrs) : undefined, events: [...c.events, { at: bump(c.raisedAt, hrs), by: r === 'verified' ? PEOPLE.auditor.name : 'AP Warranty Desk', ...ev }] }
      })
    case 'jump': return jump(s.role, a.to)
  }
}

function bump(iso: string, hours: number) {
  const d = new Date(iso)
  d.setHours(d.getHours() + hours)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function mapClaim(s: DemoState, id: string, f: (c: Claim) => Claim): DemoState {
  return { ...s, claims: s.claims.map((c) => (c.id === id ? f(c) : c)) }
}

const run = (s: DemoState, acts: Action[]) => acts.reduce(reduce, s)

function jump(role: Role, to: Milestone): DemoState {
  let s: DemoState = { ...initialState(), role }
  const seq: Milestone[] = ['start', 'photo_submitted', 'expert_reviewed', 'report_ready', 'booked', 'mid_job', 'job_done', 'warranty_active']
  const target = to === 'claim_eligible' || to === 'claim_excluded' || to === 'monsoon_passed' ? 'warranty_active' : to
  for (const m of seq) {
    if (m === 'photo_submitted') s = run(s, [{ type: 'photoForm', patch: { photos: SAMPLE_UPLOADS, area: 'Terrace', symptoms: ['Damp patch', 'Crack'], description: 'Brown damp patch on the upstairs bedroom ceiling, worse after rain. Two earlier repairs failed.' } }, { type: 'submitPhotoCheck' }])
    if (m === 'expert_reviewed') s = run(s, [{ type: 'expertReview' }])
    if (m === 'report_ready') s = run(s, [{ type: 'bookVisit' }, { type: 'completeVisit' }])
    if (m === 'booked') s = run(s, [{ type: 'acceptQuote' }, { type: 'confirmBooking' }])
    if (m === 'mid_job') for (let i = 0; i < 4 * 3 + 2; i++) s = reduce(s, { type: 'advance' }) // stages 1–4 approved, 5 submitted
    if (m === 'job_done') for (let i = 0; i < 30; i++) s = reduce(s, { type: 'advance' })
    if (m === 'warranty_active') s = run(s, [{ type: 'payCompletion' }, { type: 'activateWarranty' }])
    if (m === target) break
  }
  if (to === 'claim_eligible' || to === 'claim_excluded') {
    s = run(s, [{ type: 'raiseClaim', area: 'Terrace / ceiling below', description: 'Small damp spot back on the bedroom ceiling near the corner after heavy rain last week.', photos: [to === 'claim_eligible' ? 'claimLeak' : 'claimPipe'] }])
    const id = s.claims[0].id
    s = run(s, [{ type: 'claimRetrieve', id }, { type: 'claimDecide', id, outcome: to === 'claim_eligible' ? 'eligible' : 'excluded' }])
  }
  if (to === 'monsoon_passed') s = run(s, [{ type: 'monsoonReview', outcome: 'dry' }])
  return s
}

/* ------------------------------------------------------------------ */
const Ctx = createContext<{ s: DemoState; d: (a: Action) => void } | null>(null)

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as DemoState
      if (p.version === initialState().version) return p
    }
  } catch { /* storage unavailable */ }
  return initialState()
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reduce, undefined, load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* quota or private mode */ }
  }, [s])
  return <Ctx.Provider value={{ s, d }}>{children}</Ctx.Provider>
}

export function useStore() {
  const c = useContext(Ctx)
  if (!c) throw new Error('StoreProvider missing')
  return c
}
