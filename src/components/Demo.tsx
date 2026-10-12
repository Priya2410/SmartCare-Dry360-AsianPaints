import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play, PlayCircle, RotateCcw, X } from 'lucide-react'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SAMPLE_UPLOADS } from '../lib/photos'
import { activeStage, allApproved, canActivate, openClaim, useStore, type Action, type Milestone } from '../lib/store'
import type { Role } from '../lib/types'
import { cx, useToast } from './ui'

/* ---------------- Guided jury demo ---------------- */
type GStep = { t: string; c: string; to: string; jump?: Milestone; extra?: Action[]; role?: Role }
const GUIDE: GStep[] = [
  { t: 'Meet Jayadevi', c: 'Bengaluru homeowner. Her upstairs ceiling has a damp patch after two failed repairs. She opens SmartCare Dry360.', to: '/', jump: 'start' },
  { t: 'Free photo check', c: 'She uploads 3–5 photos and ticks what she sees. Nothing is diagnosed from photos alone.', to: '/check', jump: 'start', extra: [{ type: 'photoForm', patch: { photos: SAMPLE_UPLOADS, symptoms: ['Damp patch', 'Crack'] } }] },
  { t: 'Expert replies in 24 hours', c: 'An AP technical expert, not a salesperson, reviews the photos and recommends a ₹999 site visit, credited if she hires.', to: '/check/submitted', jump: 'expert_reviewed' },
  { t: 'Independent diagnosis', c: 'Written cause, scope, fixed ₹75,000 quote and exclusions. The diagnostician is salaried, not paid on sales. The report works with any contractor.', to: '/diagnosis', jump: 'report_ready' },
  { t: 'Certified applicator assigned', c: 'Terrace-certified applicator with a visible quality record, an AP auditor, and material billed at her local dealer.', to: '/booking', jump: 'report_ready', extra: [{ type: 'acceptQuote' }] },
  { t: '7 stages, every one on record', c: 'Applicator uploads stage photos. An automated pre-screen only checks the photos are complete. A human auditor approves.', to: '/job', jump: 'mid_job' },
  { t: 'The auditor decides', c: 'AP Quality reviews evidence and can request rework. Pre-cover and water test are inspected on site.', to: '/partner/auditor', jump: 'mid_job', role: 'auditor' },
  { t: 'Warranty only after proof', c: 'Products scanned, 7 stages verified, both on-site audits signed, 90% paid. Only then does the work warranty switch on.', to: '/warranty', jump: 'job_done' },
  { t: '10% stays with her', c: '₹7,500 is retained by Jayadevi, not an AP wallet, until the first-monsoon review on 30 Sep 2027.', to: '/warranty', jump: 'warranty_active' },
  { t: 'Water Health Record', c: 'One property, one record: diagnosis, batch, applicator, 7 photo sets, audits, warranty. Transferable on resale.', to: '/record', jump: 'warranty_active' },
  { t: 'Claim: covered', c: 'A damp spot returns. The record is fetched, an independent inspector finds a workmanship debond: free rectification.', to: '/claims/CLM-2708', jump: 'claim_eligible' },
  { t: 'Claim: not covered', c: 'Different case: moisture traced to a plumbing line. Decision with proof, reasons, and next steps. Terrace warranty unchanged.', to: '/claims/CLM-2708', jump: 'claim_excluded' },
  { t: 'Har baarish, sookha ghar', c: 'Monsoon review passes; Jayadevi releases her 10%. A dry house, sold and proven.', to: '/warranty', jump: 'monsoon_passed' },
]
const STEP_MS = 14000

const GCtx = createContext<{ start: () => void; i: number | null }>({ start: () => {}, i: null })
export const useGuide = () => useContext(GCtx)

export function GuideProvider({ children }: { children: ReactNode }) {
  const [i, setI] = useState<number | null>(null)
  const [play, setPlay] = useState(true)
  const { d } = useStore()
  const nav = useNavigate()
  const timer = useRef<number>()

  function go(n: number) {
    const g = GUIDE[n]
    if (g.jump) d({ type: 'jump', to: g.jump })
    g.extra?.forEach(d)
    d({ type: 'role', role: g.role ?? 'homeowner' })
    nav(g.to)
    setI(n)
  }
  useEffect(() => {
    window.clearTimeout(timer.current)
    if (i !== null && play && i < GUIDE.length - 1) timer.current = window.setTimeout(() => go(i + 1), STEP_MS)
    return () => window.clearTimeout(timer.current)
  }, [i, play])

  return (
    <GCtx.Provider value={{ start: () => { setPlay(true); go(0) }, i }}>
      {children}
      <AnimatePresence>
        {i !== null && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
            className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-[560px] rounded-2xl bg-plum-900 p-4 text-white shadow-2xl ring-1 ring-white/10 lg:bottom-6">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-saffron-300">
              <span>Guided jury demo · {i + 1} / {GUIDE.length}</span>
              <button aria-label="Close guide" onClick={() => setI(null)} className="rounded-full p-1 text-white/60 hover:bg-white/10"><X size={16} /></button>
            </div>
            <div className="mt-1 font-display text-[17px] font-bold">{GUIDE[i].t}</div>
            <p className="mt-0.5 text-[13px] leading-snug text-white/80">{GUIDE[i].c}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
              <motion.div key={i + String(play)} className="h-full bg-saffron-500" initial={{ width: `${(i / GUIDE.length) * 100}%` }} animate={{ width: `${((i + (play ? 1 : 0)) / GUIDE.length) * 100}%` }} transition={{ duration: play ? STEP_MS / 1000 : 0.3, ease: 'linear' }} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => i > 0 && go(i - 1)} disabled={i === 0} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 disabled:opacity-30"><ChevronLeft size={18} /></button>
              <button onClick={() => setPlay(!play)} className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[12.5px] font-semibold">{play ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Auto-play</>}</button>
              <div className="flex-1" />
              {i < GUIDE.length - 1
                ? <button onClick={() => go(i + 1)} className="flex h-9 items-center gap-1 rounded-full bg-saffron-500 px-4 text-[13px] font-bold">Next <ChevronRight size={16} /></button>
                : <button onClick={() => setI(null)} className="h-9 rounded-full bg-saffron-500 px-4 text-[13px] font-bold">Finish</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GCtx.Provider>
  )
}

/* ---------------- Demo controls panel ---------------- */
const JUMPS: [Milestone, string][] = [
  ['start', 'Fresh start'], ['photo_submitted', 'Photos submitted'], ['report_ready', 'Diagnosis ready'], ['booked', 'Job booked'],
  ['mid_job', 'Mid-job (stage 5)'], ['job_done', 'Work verified'], ['warranty_active', 'Warranty active'],
  ['claim_eligible', 'Claim: covered'], ['claim_excluded', 'Claim: excluded'], ['monsoon_passed', 'Monsoon passed'],
]
const JUMP_ROUTE: Record<Milestone, string> = {
  start: '/', photo_submitted: '/check/submitted', expert_reviewed: '/check/submitted', report_ready: '/diagnosis', booked: '/job', mid_job: '/job', job_done: '/warranty', warranty_active: '/warranty', claim_eligible: '/claims/CLM-2708', claim_excluded: '/claims/CLM-2708', monsoon_passed: '/warranty',
}

export function DemoControls({ onDone, compact, stay }: { onDone?: () => void; compact?: boolean; stay?: boolean }) {
  const { s, d } = useStore()
  const realNav = useNavigate()
  const nav = (to: string) => { if (!stay) realNav(to) }
  const loc = useLocation()
  const toast = useToast()
  const { start } = useGuide()
  const oc = openClaim(s)
  const cur = activeStage(s)

  const actions: { t: string; ok: boolean; run: () => void }[] = [
    { t: 'Simulate expert review', ok: s.photoCheck.status === 'submitted', run: () => { d({ type: 'expertReview' }); nav('/check/submitted') } },
    { t: 'Book & complete diagnosis visit', ok: s.photoCheck.status === 'reviewed' && s.diagnosis.status !== 'report_ready', run: () => { d({ type: 'bookVisit' }); d({ type: 'completeVisit' }); nav('/diagnosis') } },
    { t: 'Accept diagnosis quote', ok: s.diagnosis.status === 'report_ready' && s.quote.status !== 'accepted', run: () => { d({ type: 'acceptQuote' }); nav('/booking') } },
    { t: 'Assign applicator & confirm', ok: s.quote.status === 'accepted' && s.booking.status !== 'confirmed', run: () => { d({ type: 'confirmBooking' }); nav('/job') } },
    { t: cur?.status === 'submitted' ? `Approve audit · stage ${cur.n}` : cur ? `Advance stage ${cur.n}` : 'Advance work stage', ok: s.booking.status === 'confirmed' && !allApproved(s), run: () => { d({ type: 'advance' }); if (!loc.pathname.startsWith('/job') && !loc.pathname.startsWith('/partner')) nav('/job') } },
    { t: 'Pay 90% & activate warranty', ok: allApproved(s) && !s.warranty.active, run: () => { d({ type: 'payCompletion' }); d({ type: 'activateWarranty' }); nav('/warranty') } },
    { t: 'Raise workmanship claim', ok: s.warranty.active && !oc, run: () => raise('eligible') },
    { t: 'Raise plumbing claim (excluded)', ok: s.warranty.active && !oc, run: () => raise('excluded') },
    { t: 'Next claim step', ok: !!oc, run: () => { if (!oc) return; if (oc.step === 1) d({ type: 'claimRetrieve', id: oc.id }); else d({ type: 'claimProgress', id: oc.id }); nav(`/claims/${oc.id}`) } },
    { t: 'Run first-monsoon review', ok: s.warranty.active && (s.monsoon.status === 'scheduled' || s.monsoon.status === 'on_hold'), run: () => { d({ type: 'monsoonReview', outcome: 'dry' }); nav('/warranty') } },
    { t: 'Customer releases 10%', ok: s.retention.status === 'release_due', run: () => { d({ type: 'releaseRetention' }); nav('/warranty') } },
  ]
  function raise(kind: 'eligible' | 'excluded') {
    d({ type: 'raiseClaim', area: kind === 'eligible' ? 'Terrace / ceiling below' : 'Wall below terrace', description: kind === 'eligible' ? 'Small damp spot back on the bedroom ceiling near the corner after heavy rain.' : 'Damp patch on the wall below, near the bathroom, after rain.', photos: [kind === 'eligible' ? 'claimLeak' : 'claimPipe'] })
    // the newest claim id is deterministic from the count
    const id = 'CLM-' + (2708 + s.claims.length * 7)
    d({ type: 'claimRetrieve', id })
    d({ type: 'claimDecide', id, outcome: kind })
    nav(`/claims/${id}`)
  }
  const avail = actions.filter((a) => a.ok)

  return (
    <div className="space-y-5 text-[13px]">
      <button onClick={() => { start(); onDone?.() }} className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-saffron-500 to-saffron-600 p-3.5 text-left text-white shadow-lg">
        <PlayCircle size={30} />
        <div><div className="font-bold">Guided jury demo</div><div className="text-[12px] text-white/85">13 steps · about 3 minutes · auto-plays</div></div>
      </button>

      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Next actions</div>
        <div className="space-y-1.5">
          {avail.length === 0 && <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-500">{s.photoCheck.status === 'none' ? 'Submit a photo check in the app, or jump below.' : 'Journey complete. Reset or jump to a stage.'}</div>}
          {avail.map((a) => (
            <button key={a.t} onClick={() => { a.run(); onDone?.() }} className="flex w-full items-center justify-between rounded-xl bg-plum-50 px-3 py-2.5 text-left font-semibold text-plum-800 hover:bg-plum-100">{a.t}<ChevronRight size={16} /></button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Jump to stage</div>
        <div className={cx('grid gap-1.5', compact ? 'grid-cols-2' : 'grid-cols-2')}>
          {JUMPS.map(([m, t]) => (
            <button key={m} onClick={() => { d({ type: 'jump', to: m }); if (!stay) d({ type: 'role', role: 'homeowner' }); nav(JUMP_ROUTE[m]); toast(`Jumped to: ${t}`); onDone?.() }} className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-left text-[12.5px] font-medium text-slate-700 hover:border-plum-300">{t}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Switch demo role</div>
        <button onClick={() => { d({ type: 'role', role: 'ap' }); realNav('/ap/overview'); onDone?.() }} className={cx('mb-1.5 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[12.5px] font-semibold', s.role === 'ap' ? 'bg-saffron-500 text-white' : 'bg-saffron-50 text-saffron-700')}>Asian Paints Command Centre <ChevronRight size={15} /></button>
        <div className="grid grid-cols-4 gap-1.5">
          {([['homeowner', 'Owner', '/'], ['applicator', 'Applicator', '/partner/applicator'], ['auditor', 'Auditor', '/partner/auditor'], ['dealer', 'Dealer', '/partner/dealer']] as const).map(([r, t, to]) => (
            <button key={r} onClick={() => { d({ type: 'role', role: r }); realNav(to); onDone?.() }} className={cx('rounded-xl px-1 py-2 text-[12px] font-semibold', s.role === r ? 'bg-plum-700 text-white' : 'bg-slate-100 text-slate-600')}>{t}</button>
          ))}
        </div>
      </div>

      <button onClick={() => { d({ type: 'reset' }); if (!stay) d({ type: 'role', role: 'homeowner' }); nav('/'); toast('Demo reset'); onDone?.() }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 font-semibold text-red-600 hover:bg-red-50"><RotateCcw size={15} /> Reset entire demo</button>
      <p className="text-[11px] leading-snug text-slate-400">Concept prototype developed for Asian Paints CANVAS 2026. Not an official Asian Paints application. Progress is saved in this browser.</p>
      {canActivate(s) && null}
    </div>
  )
}
