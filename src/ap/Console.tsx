import { AlertTriangle, ArrowLeft, Award, BarChart3, Camera, Check, ChevronRight, CircleDot, ClipboardCheck, FileWarning, Gauge, IndianRupee, LayoutDashboard, Menu, MapPin, Radio, ShieldCheck, SlidersHorizontal, Store, UserCheck, Users, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DemoControls } from '../components/Demo'
import { Thumb, cx, useToast } from '../components/ui'
import { APPLICATOR_TRANCHES, CUSTOMER, DATES, JOB, LABOUR, NINETY, PEOPLE, RETENTION, RULES, fmtDate, fmtDateTime, inr } from '../lib/data'
import { activeStage, allApproved, approvedCount, openClaim, useStore } from '../lib/store'
import type { DemoState } from '../lib/types'
import { APPLICATORS, CITIES, DEALERS, FUNNEL, KPIS, MONSOON, SEED_CLAIMS, SEED_JOBS, type Gate, type Risk, type SeedJob } from './data'

const TABS = [
  { k: 'overview', t: 'Pilot overview', i: LayoutDashboard },
  { k: 'jobs', t: 'Live job register', i: ClipboardCheck },
  { k: 'quality', t: 'Quality & applicators', i: Award },
  { k: 'money', t: 'Money flow', i: IndianRupee },
  { k: 'claims', t: 'Warranty & claims', i: ShieldCheck },
  { k: 'dealers', t: 'Dealer network', i: Store },
] as const
type TabK = typeof TABS[number]['k']

const GATE: Record<Gate, [string, string]> = {
  diagnosis: ['Diagnosis', 'bg-slate-100 text-slate-600'],
  quote: ['Quote with customer', 'bg-slate-100 text-slate-600'],
  in_progress: ['Work in progress', 'bg-sky-50 text-sky-700'],
  photo_review: ['Photo review due', 'bg-amber-50 text-amber-700'],
  onsite_due: ['On-site audit due', 'bg-plum-50 text-plum-700'],
  rework: ['Rework requested', 'bg-red-50 text-red-700'],
  verified: ['Verified complete', 'bg-emerald-50 text-emerald-700'],
  warranty: ['Warranty active', 'bg-emerald-50 text-emerald-700'],
  monsoon_passed: ['Monsoon passed', 'bg-emerald-100 text-emerald-800'],
  claim: ['Claim open', 'bg-red-50 text-red-700'],
}
const RISK: Record<Risk, string> = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' }

function liveJob(s: DemoState): (SeedJob & { live: true }) | null {
  if (s.photoCheck.status === 'none') return null
  const st = activeStage(s)
  const oc = openClaim(s)
  let gate: Gate = 'diagnosis'
  if (s.diagnosis.status === 'report_ready') gate = 'quote'
  if (s.booking.status === 'confirmed') gate = 'in_progress'
  if (st?.status === 'submitted') gate = st.onsite ? 'onsite_due' : 'photo_review'
  if (st?.status === 'rework') gate = 'rework'
  if (allApproved(s)) gate = 'verified'
  if (s.warranty.active) gate = 'warranty'
  if (s.monsoon.status === 'review_passed') gate = 'monsoon_passed'
  if (oc) gate = 'claim'
  const risk: Risk = gate === 'rework' || gate === 'claim' ? (oc?.outcome === 'excluded' ? 'amber' : 'red') : 'green'
  return {
    live: true, id: JOB.id, customer: CUSTOMER.name, city: 'Bengaluru', surface: 'Terrace', sqft: 1000, stage: approvedCount(s), gate,
    applicator: s.booking.status === 'confirmed' ? PEOPLE.applicator.name : '—', auditor: s.booking.status === 'confirmed' ? PEOPLE.auditor.name : '—', risk,
    sla: gate === 'quote' ? 'Quote with customer' : gate === 'diagnosis' ? 'Expert review < 24 h' : gate === 'warranty' ? `Review ${fmtDate(DATES.monsoonReview)}` : gate === 'claim' ? 'Claim open' : st ? `Stage ${st.n}` : 'Closed',
    dealer: 'Sri Lakshmi Paints',
  }
}

export default function Console() {
  const { s } = useStore()
  const loc = useLocation()
  const nav = useNavigate()
  const tab = ((loc.pathname.split('/')[2] || 'overview') as TabK)
  const [demo, setDemo] = useState(false)
  const [menu, setMenu] = useState(false)
  const [drawer, setDrawer] = useState<string | null>(null)
  const live = liveJob(s)
  const jobs = live ? [live, ...SEED_JOBS] : SEED_JOBS
  const cur = TABS.find((t) => t.k === tab) || TABS[0]

  const Side = (
    <div className="flex h-full flex-col bg-plum-900 text-white">
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-saffron-500 font-display text-[13px] font-bold">AP</span>
          <div>
            <div className="font-display text-[15px] font-bold leading-tight">SmartCare <span className="text-saffron-300">Dry360</span></div>
            <div className="text-[11px] text-white/55">Command Centre</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => { nav(`/ap/${t.k}`); setMenu(false) }} className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition', tab === t.k ? 'bg-white/12 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white')}>
            <t.i size={17} className={tab === t.k ? 'text-saffron-300' : ''} />{t.t}
            {t.k === 'jobs' && live && <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-saffron-400" />}
          </button>
        ))}
      </nav>
      <div className="space-y-2 p-4">
        <button onClick={() => setDemo(true)} className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-[12.5px] font-semibold"><SlidersHorizontal size={15} /> Demo controls</button>
        <button onClick={() => nav('/')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold text-white/70 hover:text-white"><ArrowLeft size={15} /> Homeowner app</button>
        <p className="px-1 text-[10.5px] leading-snug text-white/40">Concept prototype for Asian Paints CANVAS 2026 by The Syndicate, XLRI. Not an official AP system. Pilot figures are prototype data.</p>
      </div>
    </div>
  )

  return (
    <div className="flex h-[100dvh] bg-[#f6f5f9] text-ink">
      <aside className="hidden w-[248px] shrink-0 lg:block">{Side}</aside>
      <AnimatePresence>{menu && (
        <motion.div className="fixed inset-0 z-50 flex bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)}>
          <motion.div className="w-[260px]" initial={{ x: -40 }} animate={{ x: 0 }} onClick={(e) => e.stopPropagation()}>{Side}</motion.div>
        </motion.div>
      )}</AnimatePresence>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-plum-100 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <button aria-label="Menu" onClick={() => setMenu(true)} className="rounded-lg p-1.5 hover:bg-slate-100 lg:hidden"><Menu size={20} /></button>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-saffron-600">Asian Paints · Waterproofing outcomes</div>
            <h1 className="truncate font-display text-[19px] font-bold text-plum-900">{cur.t}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11.5px] font-semibold text-amber-700 ring-1 ring-amber-200 md:flex"><CircleDot size={12} /> Prototype dataset · pilot targets, not actuals</span>
            <button onClick={() => setDemo(true)} className="rounded-lg bg-plum-50 px-3 py-1.5 text-[12px] font-semibold text-plum-700 lg:hidden">Demo</button>
          </div>
        </header>

        <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}>
            {tab === 'overview' && <Overview live={live} jobs={jobs} open={setDrawer} />}
            {tab === 'jobs' && <Register jobs={jobs} open={setDrawer} />}
            {tab === 'quality' && <Quality />}
            {tab === 'money' && <Money />}
            {tab === 'claims' && <Claims open={setDrawer} />}
            {tab === 'dealers' && <Dealers />}
          </motion.div>
        </div>
      </main>

      <JobDrawer id={drawer} jobs={jobs} onClose={() => setDrawer(null)} />

      <AnimatePresence>{demo && (
        <motion.div className="fixed inset-0 z-[70] flex justify-end bg-plum-900/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDemo(false)}>
          <motion.div className="h-full w-full max-w-[380px] overflow-y-auto bg-white p-5" initial={{ x: 40 }} animate={{ x: 0 }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between font-bold text-plum-900"><span className="flex items-center gap-2"><SlidersHorizontal size={16} /> Demo controls</span><button onClick={() => setDemo(false)}><X size={18} /></button></div>
            <p className="mb-4 rounded-xl bg-saffron-50 p-3 text-[12px] text-saffron-800">Actions here move Jayadevi's job. Her row in the register updates live.</p>
            <DemoControls stay onDone={() => setDemo(false)} />
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  )
}

/* ---------- shared bits ---------- */
function Panel({ title, sub, right, children, className }: { title: string; sub?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('min-w-0 rounded-2xl bg-white p-5 shadow-card ring-1 ring-plum-900/[.04]', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h2 className="text-[15px] font-bold text-plum-900">{title}</h2>{sub && <p className="text-[12px] text-slate-500">{sub}</p>}</div>{right}
      </div>
      {children}
    </section>
  )
}
const GatePill = ({ g }: { g: Gate }) => <span className={cx('inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold', GATE[g][1])}>{GATE[g][0]}</span>
const Bar = ({ v, max = 100, tone = 'bg-saffron-500' }: { v: number; max?: number; tone?: string }) => <div className="h-2 flex-1 overflow-hidden rounded-full bg-plum-50"><div className={cx('h-full rounded-full', tone)} style={{ width: `${Math.min(100, (v / max) * 100)}%` }} /></div>

function StageDots({ n, live }: { n: number; live?: boolean }) {
  return <div className="flex items-center gap-1">{Array.from({ length: 7 }).map((_, i) => <span key={i} className={cx('h-2 w-3.5 rounded-sm', i < n ? 'bg-saffron-500' : 'bg-plum-100', live && i === n && 'animate-pulse bg-saffron-200')} />)}<span className="ml-1.5 text-[12px] tabular-nums text-slate-500">{n}/7</span></div>
}

/* ---------- Overview ---------- */
function Overview({ live, jobs, open }: { live: ReturnType<typeof liveJob>; jobs: SeedJob[]; open: (id: string) => void }) {
  const nav = useNavigate()
  const max = FUNNEL[0].v
  const attention = jobs.filter((j) => ['rework', 'claim', 'onsite_due', 'photo_review'].includes(j.gate) || j.risk === 'red')
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-slate-500">
        <span className="font-semibold text-plum-900">Pilot · 3 cities · 236 jobs · first monsoon 2027</span>
        <span>·</span><span>Bengaluru, Hyderabad, Visakhapatnam</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KPIS.map((k) => (
          <div key={k.k} className={cx('rounded-2xl bg-white p-4 shadow-card ring-1', k.ok ? 'ring-plum-900/[.04]' : 'ring-amber-300')}>
            <div className={cx('mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold', k.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{k.ok ? <Check size={11} /> : <AlertTriangle size={11} />}{k.gate}</div>
            <div className="font-display text-[28px] font-bold leading-none tabular-nums text-plum-900">{k.v}</div>
            <div className="mt-1.5 text-[12.5px] font-semibold text-ink">{k.k}</div>
            <div className="mt-0.5 text-[11px] leading-snug text-slate-500">{k.note}</div>
          </div>
        ))}
      </div>

      {live && (
        <button onClick={() => open(live.id)} className="flex w-full flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-r from-plum-800 to-plum-700 p-4 text-left text-white shadow-lift">
          <span className="flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"><Radio size={13} className="animate-pulse text-saffron-300" /> Live from homeowner app</span>
          <div className="min-w-0"><div className="font-bold">{live.id} · {live.customer} · Terrace 1,000 sq ft</div><div className="text-[12.5px] text-white/75">{GATE[live.gate][0]} · {live.sla}</div></div>
          <div className="ml-auto flex items-center gap-3"><StageDots n={live.stage} /><ChevronRight size={18} /></div>
        </button>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Conversion funnel" sub="Pilot to date · prototype data">
          <div className="space-y-2.5">
            {FUNNEL.map((f, i) => (
              <div key={f.k} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-[13px]">
                <span className="text-slate-600">{f.k}</span>
                <div className="h-7 overflow-hidden rounded-lg bg-plum-50"><div className="flex h-full items-center rounded-lg bg-gradient-to-r from-plum-700 to-plum-500 pl-2 text-[11.5px] font-semibold text-white" style={{ width: `${(f.v / max) * 100}%` }}>{f.v.toLocaleString('en-IN')}</div></div>
                <span className="w-12 text-right text-[12px] tabular-nums text-saffron-700">{i ? Math.round((f.v / FUNNEL[i - 1].v) * 100) + '%' : ''}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-slate-500">Diagnosis → job 58% vs survey signal of 60% willing to pay ₹1,000+ when credited.</p>
        </Panel>

        <Panel title="Needs attention" sub="Quality gates and claims waiting on AP" right={<button onClick={() => nav('/ap/jobs')} className="text-[12px] font-semibold text-plum-600">All jobs →</button>}>
          <div className="divide-y divide-slate-100">
            {attention.slice(0, 5).map((j) => (
              <button key={j.id} onClick={() => open(j.id)} className="flex w-full items-center gap-3 py-2.5 text-left">
                <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', RISK[j.risk])} />
                <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold">{j.id} · {j.customer}</div><div className="text-[11.5px] text-slate-500">{j.city} · {j.surface}</div></div>
                <GatePill g={j.gate} />
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Quality by city" sub="First-monsoon cohort · prototype data">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400"><th className="pb-2 font-semibold">City</th><th className="pb-2 font-semibold">Jobs</th><th className="pb-2 font-semibold">Evidence complete</th><th className="pb-2 font-semibold">Right first time</th><th className="pb-2 font-semibold">Repeat leaks</th><th className="pb-2 font-semibold">Diag → job</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {CITIES.map((c) => (
                <tr key={c.city}>
                  <td className="py-2.5 font-semibold">{c.city}</td>
                  <td className="tabular-nums">{c.jobs}</td>
                  <td><div className="flex items-center gap-2 pr-4"><Bar v={c.evidence} /><span className="w-9 tabular-nums">{c.evidence}%</span></div></td>
                  <td className="tabular-nums">{c.rft}%</td>
                  <td className={cx('tabular-nums font-semibold', c.repeat < 3 ? 'text-emerald-700' : 'text-amber-700')}>{c.repeat}%</td>
                  <td className="tabular-nums">{c.conv}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ---------- Register ---------- */
function Register({ jobs, open }: { jobs: (SeedJob & { live?: true })[]; open: (id: string) => void }) {
  const [city, setCity] = useState('All')
  const [risk, setRisk] = useState<'all' | Risk>('all')
  const rows = jobs.filter((j) => (city === 'All' || j.city === city) && (risk === 'all' || j.risk === risk))
  return (
    <Panel title="Every job, every stage" sub="Evidence, gate, owner and SLA. Click a row for the full trail." right={
      <div className="flex flex-wrap gap-2">
        <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-[12.5px]">{['All', ...CITIES.map((c) => c.city)].map((c) => <option key={c}>{c}</option>)}</select>
        <select value={risk} onChange={(e) => setRisk(e.target.value as any)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-[12.5px]"><option value="all">All risk tiers</option><option value="green">Green</option><option value="amber">Amber</option><option value="red">Red</option></select>
      </div>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-[13px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400"><th className="pb-2 font-semibold">Job / customer</th><th className="pb-2 font-semibold">City · surface</th><th className="pb-2 font-semibold">Risk</th><th className="pb-2 font-semibold">Stage evidence</th><th className="pb-2 font-semibold">Quality gate</th><th className="pb-2 font-semibold">Applicator / auditor</th><th className="pb-2 font-semibold">SLA</th><th /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((j) => (
              <tr key={j.id} onClick={() => open(j.id)} className={cx('cursor-pointer hover:bg-plum-50/50', j.live && 'bg-saffron-50/60')}>
                <td className="py-3"><div className="flex items-center gap-1.5 font-semibold text-plum-900">{j.id}{j.live && <span className="rounded bg-saffron-500 px-1.5 text-[10px] font-bold text-white">LIVE</span>}</div><div className="text-[12px] text-slate-500">{j.customer}</div></td>
                <td>{j.city}<div className="text-[12px] text-slate-500">{j.surface} · {j.sqft.toLocaleString('en-IN')} sq ft</div></td>
                <td><span className="flex items-center gap-1.5 capitalize"><span className={cx('h-2.5 w-2.5 rounded-full', RISK[j.risk])} />{j.risk}</span></td>
                <td><StageDots n={j.stage} live={j.live} /></td>
                <td><GatePill g={j.gate} /></td>
                <td>{j.applicator}<div className="text-[12px] text-slate-500">{j.auditor}</div></td>
                <td className="text-[12.5px] text-slate-600">{j.sla}</td>
                <td><ChevronRight size={16} className="text-slate-400" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11.5px] text-slate-500">Risk tier sets audit intensity: green = photo review + 2 on-site audits; amber = extra photo checks; red = specialist escalation. Seeded rows are prototype data.</p>
    </Panel>
  )
}

/* ---------- Job drawer ---------- */
function JobDrawer({ id, jobs, onClose }: { id: string | null; jobs: (SeedJob & { live?: true })[]; onClose: () => void }) {
  const { s, d } = useStore()
  const toast = useToast()
  const j = jobs.find((x) => x.id === id)
  return (
    <AnimatePresence>{j && (
      <motion.div className="fixed inset-0 z-[60] flex justify-end bg-plum-900/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="h-full w-full max-w-[460px] overflow-y-auto bg-white" initial={{ x: 50 }} animate={{ x: 0 }} exit={{ x: 50 }} onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5">
            <div><div className="flex items-center gap-2 font-display text-lg font-bold text-plum-900">{j.id}{j.live && <span className="rounded bg-saffron-500 px-1.5 text-[10px] font-bold text-white">LIVE</span>}</div><div className="text-[12.5px] text-slate-500">{j.customer} · {j.city} · {j.surface} {j.sqft.toLocaleString('en-IN')} sq ft</div></div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100"><X size={18} /></button>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2"><GatePill g={j.gate} /><span className="flex items-center gap-1.5 text-[12px] capitalize"><span className={cx('h-2.5 w-2.5 rounded-full', RISK[j.risk])} />{j.risk} risk</span><span className="text-[12px] text-slate-500">· {j.dealer}</span></div>
            <div className="grid grid-cols-2 gap-2 text-[12.5px]">
              <Info k="Job value" v={inr(j.sqft * RULES.pricePerSqFt)} /><Info k="Applicator" v={j.applicator} />
              <Info k="Auditor (AP Quality)" v={j.auditor} /><Info k="SLA" v={j.sla} />
            </div>
            {j.live ? (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stage trail</div>
                {s.stages.map((st) => {
                  const a = st.audits[st.audits.length - 1]
                  return (
                    <div key={st.n} className="rounded-xl border border-slate-100 p-3">
                      <div className="flex items-center justify-between text-[13px]"><span className="font-semibold">{st.n}. {st.title}{st.onsite && <span className="ml-1.5 text-[10.5px] font-bold text-plum-600">ON-SITE</span>}</span><span className={cx('rounded-full px-2 py-0.5 text-[11px] font-semibold', st.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : st.status === 'submitted' ? 'bg-amber-50 text-amber-700' : st.status === 'rework' ? 'bg-red-50 text-red-700' : st.status === 'in_progress' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-500')}>{st.status.replace('_', ' ')}</span></div>
                      {st.photos.length > 0 && <div className="mt-2 flex gap-1.5">{st.photos.map((p, i) => <Thumb key={i} k={p} all={st.photos} i={i} className="h-12 w-16" />)}</div>}
                      {st.aiCheck && <div className="mt-1.5 text-[11.5px] text-sky-700">Pre-screen: {st.aiCheck.result === 'clear' ? 'photos complete' : 'flagged'} (does not approve work)</div>}
                      {a && <div className={cx('mt-1 text-[11.5px]', a.decision === 'approved' ? 'text-emerald-700' : 'text-red-600')}>{a.by} · {a.decision} · {fmtDateTime(a.at)}</div>}
                      {st.status === 'submitted' && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <button onClick={() => { d({ type: 'stageAudit', n: st.n, decision: 'rework' }); toast(`Stage ${st.n}: rework requested`) }} className="rounded-lg border border-red-200 py-1.5 text-[12px] font-semibold text-red-600">Request rework</button>
                          <button onClick={() => { d({ type: 'stageAudit', n: st.n, decision: 'approved' }); toast(`Stage ${st.n} approved by AP Quality`) }} className="rounded-lg bg-emerald-600 py-1.5 text-[12px] font-semibold text-white">Approve</button>
                        </div>
                      )}
                    </div>
                  )
                })}
                {s.booking.status !== 'confirmed' && <p className="rounded-xl bg-slate-50 p-3 text-[12.5px] text-slate-600">Stages start once the customer confirms the schedule in the homeowner app.</p>}
                {s.booking.status === 'confirmed' && !allApproved(s) && <button onClick={() => d({ type: 'advance' })} className="w-full rounded-xl bg-plum-50 py-2.5 text-[13px] font-semibold text-plum-700">Simulate next step on site</button>}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stage trail</div>
                {['Surface cleaning', 'Crack cutting', 'Slope & drain', 'Material mixing', 'Thickness check', 'Pre-cover audit (on site)', 'Water test (on site)'].map((t, i) => (
                  <div key={t} className="flex items-center gap-3 text-[13px]">
                    <span className={cx('grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold', i < j.stage ? 'bg-saffron-500 text-white' : i === j.stage && j.gate === 'rework' ? 'bg-red-100 text-red-600' : 'bg-plum-50 text-plum-400')}>{i < j.stage ? <Check size={12} /> : i + 1}</span>
                    <span className={i < j.stage ? 'text-ink' : 'text-slate-400'}>{t}</span>
                    {i === j.stage && j.gate === 'rework' && <span className="ml-auto text-[11.5px] font-semibold text-red-600">Rework: drain collar detailing</span>}
                  </div>
                ))}
                <p className="pt-2 text-[11.5px] text-slate-500">Seeded job for illustration. Open Jayadevi's live job to act on stages.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  )
}
const Info = ({ k, v }: { k: string; v: string }) => <div className="rounded-xl bg-slate-50 p-2.5"><div className="text-[11px] text-slate-500">{k}</div><div className="font-semibold text-ink">{v}</div></div>

/* ---------- Quality ---------- */
function Quality() {
  const { s } = useStore()
  const tone = (l: string) => l === 'Master' ? 'bg-saffron-500 text-white' : l === 'Certified' ? 'bg-plum-100 text-plum-800' : 'bg-slate-100 text-slate-600'
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { t: 'Trained', d: '5-day surface module passed', n: 14 },
          { t: 'Certified', d: '3 audited jobs pass · gets pilot leads', n: 23 },
          { t: 'Master', d: '< 3% repeats · first in lead queue · trains others', n: 4 },
        ].map((x, i) => (
          <div key={x.t} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card">
            <span className={cx('grid h-11 w-11 place-items-center rounded-xl font-display font-bold', tone(x.t))}>{i + 1}</span>
            <div className="flex-1"><div className="font-bold text-plum-900">{x.t}</div><div className="text-[12px] text-slate-500">{x.d}</div></div>
            <div className="font-display text-2xl font-bold tabular-nums text-plum-900">{x.n}</div>
          </div>
        ))}
      </div>

      <Panel title="Applicator leaderboard" sub="Leads go first to the best record, not the cheapest bid" right={<span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11.5px] font-semibold text-red-700"><AlertTriangle size={12} /> Rule: 2 repeat leaks → review</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400"><th className="pb-2 font-semibold">Applicator</th><th className="pb-2 font-semibold">Level</th><th className="pb-2 font-semibold">Jobs</th><th className="pb-2 font-semibold">Right first time</th><th className="pb-2 font-semibold">Repeat leaks</th><th className="pb-2 font-semibold">Lead priority</th><th className="pb-2 font-semibold">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {APPLICATORS.map((a) => {
                const isLive = a.name === PEOPLE.applicator.name
                const flagged = a.repeat >= 2
                return (
                  <tr key={a.name} className={flagged ? 'bg-red-50/40' : ''}>
                    <td className="py-3"><div className="font-semibold">{a.name}</div><div className="text-[12px] text-slate-500">{a.firm} · {a.city}</div></td>
                    <td><span className={cx('rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold', tone(a.level))}>{a.level}</span></td>
                    <td className="tabular-nums">{a.jobs}</td>
                    <td><div className="flex items-center gap-2 pr-6"><Bar v={a.rft} tone={a.rft >= 90 ? 'bg-emerald-500' : 'bg-amber-500'} /><span className="w-9 tabular-nums">{a.rft}%</span></div></td>
                    <td className={cx('font-semibold tabular-nums', flagged ? 'text-red-600' : 'text-ink')}>{a.repeat}</td>
                    <td className="tabular-nums">{a.leadRank ? `#${a.leadRank} in city` : '—'}</td>
                    <td className="text-[12px]">{flagged ? <span className="font-semibold text-red-600">Leads paused · retraining</span> : isLive && s.booking.status === 'confirmed' && !allApproved(s) ? <span className="font-semibold text-saffron-700">On Jayadevi's job</span> : a.level === 'Trained' ? 'Shadowing' : 'Active'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11.5px] text-slate-500">Names and figures are prototype data. Specialist interview: leads, not tokens, keep good applicators.</p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Why stages get sent back" sub="Rework reasons, last 60 days">
          {[['Drain collar / outlet detailing', 34], ['Missing wide-angle photo', 22], ['Coving at parapet incomplete', 18], ['Coat thickness below spec', 15], ['Batch label not captured', 11]].map(([k, v]) => (
            <div key={k} className="mb-2.5 flex items-center gap-3 text-[13px]"><span className="w-[200px] shrink-0 text-slate-600">{k}</span><Bar v={v as number} max={34} tone="bg-plum-500" /><span className="w-9 text-right tabular-nums">{v}%</span></div>
          ))}
          <p className="mt-2 text-[11.5px] text-slate-500">Feeds back into the 5-day training module.</p>
        </Panel>
        <Panel title="Who checks what" sub="Separation of roles is the product">
          {[
            [Camera, 'Applicator', 'Does the work, uploads stage evidence'],
            [Gauge, 'Automated pre-screen', 'Flags missing or unclear photos only'],
            [UserCheck, 'AP Quality auditor', 'Approves stages; on site for pre-cover and water test'],
            [Users, 'AP Diagnostician', 'Finds the cause; salaried, not paid on sales'],
            [ShieldCheck, 'Warranty desk', 'Decides claims on inspection + record'],
          ].map(([I, t, d]: any) => (
            <div key={t} className="flex items-start gap-3 py-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-plum-50 text-plum-700"><I size={16} /></span><div><div className="text-[13px] font-semibold">{t}</div><div className="text-[12px] text-slate-500">{d}</div></div></div>
          ))}
        </Panel>
      </div>
    </div>
  )
}

/* ---------- Money ---------- */
function Money() {
  const { s } = useStore()
  const material = JOB.quote[1].amount
  const dealerMargin = 4050
  const apFee = JOB.quote[2].amount
  const parts = [
    { k: 'Applicator labour', v: LABOUR, c: 'bg-saffron-500', who: 'Paid by AP in 3 verified tranches' },
    { k: 'AP product revenue', v: material - dealerMargin, c: 'bg-plum-700', who: 'Material sold through the dealer' },
    { k: 'Dealer margin', v: dealerMargin, c: 'bg-sky-500', who: 'Billed at the dealer counter' },
    { k: 'AP assurance fee', v: apFee, c: 'bg-emerald-500', who: 'Audits, record, warranty desk' },
  ]
  const paid = s.applicatorPay.reduce((a, p) => a + p.amount, 0)
  return (
    <div className="space-y-5">
      <Panel title="Where ₹75,000 goes" sub={`One 1,000 sq ft terrace at ₹${RULES.pricePerSqFt}/sq ft · team cost model · demo values`}>
        <div className="flex h-12 overflow-hidden rounded-xl">
          {parts.map((p) => <div key={p.k} className={cx('flex items-center justify-center text-[12px] font-bold text-white', p.c)} style={{ width: `${(p.v / JOB.value) * 100}%` }}>{Math.round((p.v / JOB.value) * 100)}%</div>)}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {parts.map((p) => (
            <div key={p.k} className="flex gap-2.5"><span className={cx('mt-1 h-3 w-3 shrink-0 rounded-sm', p.c)} /><div><div className="text-[13px] font-semibold">{p.k}</div><div className="font-display text-lg font-bold tabular-nums text-plum-900">{inr(p.v)}</div><div className="text-[11.5px] text-slate-500">{p.who}</div></div></div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Cash timeline for one job" sub="Who pays whom, and when">
          {[
            ['Diagnosis visit', 'Customer → AP', inr(RULES.diagnosisFee), 'Credited if hired'],
            ['Stages 1–2 verified', 'AP → applicator', inr(Math.round(LABOUR * .3)), '30% of labour'],
            ['Stages 3–5 verified', 'AP → applicator', inr(Math.round(LABOUR * .4)), '40% of labour'],
            ['Stages 6–7 on-site pass', 'AP → applicator', inr(Math.round(LABOUR * .3)), '30% of labour'],
            ['Verified completion', 'Customer → AP', inr(NINETY - RULES.diagnosisFee), '90% less ₹999 credit'],
            ['After first monsoon', 'Customer → AP', inr(RETENTION), '10% held by the customer until review'],
          ].map(([a, b, c, d], i) => (
            <div key={a} className="relative flex gap-3 pb-3 last:pb-0">
              <span className={cx('z-10 mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-white', b.startsWith('AP') ? 'bg-saffron-500' : 'bg-plum-600')} />
              {i < 5 && <span className="absolute left-[5px] top-4 h-full w-0.5 bg-plum-100" />}
              <div className="flex flex-1 justify-between gap-3"><div><div className="text-[13px] font-semibold">{a}</div><div className="text-[11.5px] text-slate-500">{b} · {d}</div></div><div className="font-semibold tabular-nums">{c}</div></div>
            </div>
          ))}
          <p className="mt-3 rounded-xl bg-saffron-50 p-3 text-[12px] text-saffron-800">The applicator is paid on proof, not on the customer's payment. AP carries the gap; the 10% is never in an AP wallet.</p>
        </Panel>

        <Panel title="Live job payouts" sub={`${JOB.id} · Manjunath K.`}>
          {APPLICATOR_TRANCHES.map((t) => {
            const p = s.applicatorPay.find((x) => x.tranche === t.tranche)
            return (
              <div key={t.tranche} className="flex items-center gap-3 border-b border-slate-100 py-2.5 text-[13px] last:border-0">
                <span className={cx('grid h-7 w-7 place-items-center rounded-full', p ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400')}>{p ? <Check size={14} /> : <IndianRupee size={13} />}</span>
                <div className="flex-1"><div className="font-semibold">{t.label}</div><div className="text-[11.5px] text-slate-500">{p ? `Released ${fmtDate(p.paidAt)}` : 'Waiting for auditor approval'}</div></div>
                <span className="font-semibold tabular-nums">{inr(Math.round((LABOUR * t.pct) / 100))}</span>
              </div>
            )
          })}
          <div className="mt-3 flex justify-between rounded-xl bg-plum-50 p-3 text-[13px]"><span>Released so far</span><b className="tabular-nums">{inr(paid)} / {inr(LABOUR)}</b></div>
          <div className="mt-2 flex justify-between rounded-xl bg-slate-50 p-3 text-[13px]"><span>Customer 10% retention</span><b>{s.retention.status === 'released' ? 'Received' : s.warranty.active ? 'Held by customer' : 'Not started'}</b></div>
        </Panel>
      </div>

      <Panel title="Monsoon retention calendar" sub="10% retentions falling due across the pilot · prototype data">
        <div className="flex h-40 items-end gap-4">
          {MONSOON.map((m) => (
            <div key={m.m} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="relative flex w-full max-w-[64px] flex-1 items-end">
                <div className="w-full rounded-t-lg bg-plum-100" style={{ height: `${(m.due / 63) * 100}%` }}>
                  <div className="w-full rounded-t-lg bg-emerald-500" style={{ height: `${m.due ? (m.released / m.due) * 100 : 0}%`, marginTop: 'auto' }} />
                </div>
              </div>
              <div className="text-[12px] font-semibold">{m.m}</div><div className="text-[11px] tabular-nums text-slate-500">{m.released}/{m.due}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[11.5px] text-slate-500"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Released</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-plum-100" />Due</span></div>
      </Panel>
    </div>
  )
}

/* ---------- Claims ---------- */
function Claims({ open }: { open: (id: string) => void }) {
  const { s } = useStore()
  const nav = useNavigate()
  const liveClaims = s.claims.map((c) => ({ id: c.id, job: JOB.id, city: 'Bengaluru', raised: c.raisedAt, status: c.closedAt ? 'Closed' : c.outcome ? (c.outcome === 'eligible' ? 'Rectification' : 'Decision shared') : 'Inspection booked', outcome: c.outcome === 'eligible' ? 'Covered' : c.outcome === 'excluded' ? 'Excluded · plumbing' : '—', days: c.outcome ? 2.2 : 0, live: true }))
  const all = [...liveClaims, ...SEED_CLAIMS.map((c) => ({ ...c, live: false }))]
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Warranties active', '221'], ['Claim rate', '6.8%'], ['Covered vs excluded', '62 : 38'], ['Avg decision time', '4.2 days']].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 shadow-card"><div className="text-[12px] text-slate-500">{k}</div><div className="font-display text-2xl font-bold tabular-nums text-plum-900">{v}</div></div>
        ))}
      </div>
      <Panel title="Claims queue" sub="Every decision made on inspection + the Water Health Record">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-[13px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400"><th className="pb-2 font-semibold">Claim</th><th className="pb-2 font-semibold">Job · city</th><th className="pb-2 font-semibold">Raised</th><th className="pb-2 font-semibold">Status</th><th className="pb-2 font-semibold">Outcome</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {all.map((c) => (
                <tr key={c.id} onClick={() => c.live ? nav(`/claims/${c.id}`) : open(c.job)} className={cx('cursor-pointer hover:bg-plum-50/50', c.live && 'bg-saffron-50/60')}>
                  <td className="py-3 font-semibold text-plum-900">{c.id}{c.live && <span className="ml-1.5 rounded bg-saffron-500 px-1.5 text-[10px] font-bold text-white">LIVE</span>}</td>
                  <td>{c.job}<div className="text-[12px] text-slate-500">{c.city}</div></td>
                  <td className="text-slate-600">{fmtDate(c.raised)}</td>
                  <td>{c.status}</td>
                  <td className={cx('font-semibold', c.outcome.startsWith('Covered') ? 'text-emerald-700' : c.outcome.startsWith('Excluded') ? 'text-slate-600' : 'text-slate-400')}>{c.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!liveClaims.length && <p className="mt-3 text-[12px] text-slate-500">Raise a claim from the homeowner app (or Demo controls) and it appears here as LIVE.</p>}
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Why claims are excluded" sub="Excluded claims still get a written reason">
          {[['Plumbing line', 46], ['Structural crack', 24], ['Drainage blockage', 18], ['New construction damage', 12]].map(([k, v]) => <div key={k} className="mb-2.5 flex items-center gap-3 text-[13px]"><span className="w-[170px] shrink-0 text-slate-600">{k}</span><Bar v={v as number} max={46} tone="bg-slate-400" /><span className="w-9 text-right tabular-nums">{v}%</span></div>)}
        </Panel>
        <Panel title="Live job: retention status" sub={`${JOB.id} · ${CUSTOMER.name}`}>
          <div className="space-y-2 text-[13px]">
            <Row k="Work warranty" v={s.warranty.active ? `Active to ${fmtDate(DATES.warrantyEnd)}` : 'Not active'} />
            <Row k="Monsoon review" v={s.monsoon.status === 'review_passed' ? 'Passed' : s.monsoon.status === 'on_hold' ? 'On hold (open claim)' : s.warranty.active ? `Due ${fmtDate(DATES.monsoonReview)}` : '—'} />
            <Row k="10% retention" v={s.retention.status === 'released' ? 'Released by customer' : s.retention.status === 'release_due' ? 'Release due' : 'Held by customer'} />
            <p className="pt-1 text-[11.5px] text-slate-500">Closing a claim never releases the retention by itself.</p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
const Row = ({ k, v }: { k: string; v: string }) => <div className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">{k}</span><b>{v}</b></div>

/* ---------- Dealers ---------- */
function Dealers() {
  const { s } = useStore()
  const max = Math.max(...DEALERS.map((d) => d.leads))
  return (
    <div className="space-y-5">
      <Panel title="Dealer network" sub="Material always flows company → dealer → applicator. No dealer is bypassed.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400"><th className="pb-2 font-semibold">Dealer</th><th className="pb-2 font-semibold">Leads referred</th><th className="pb-2 font-semibold">Jobs</th><th className="pb-2 font-semibold">Conversion</th><th className="pb-2 font-semibold">Counter billing</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {DEALERS.map((d) => {
                const live = d.name === PEOPLE.dealer.name
                const extraJob = live && s.quote.status === 'accepted' ? 1 : 0
                return (
                  <tr key={d.name} className={live ? 'bg-saffron-50/50' : ''}>
                    <td className="py-3"><div className="font-semibold">{d.name}</div><div className="flex items-center gap-1 text-[12px] text-slate-500"><MapPin size={11} />{d.city}</div></td>
                    <td><div className="flex items-center gap-2 pr-6"><Bar v={d.leads} max={max} tone="bg-sky-500" /><span className="w-7 tabular-nums">{d.leads}</span></div></td>
                    <td className="tabular-nums">{d.jobs + extraJob}</td>
                    <td className="tabular-nums">{Math.round(((d.jobs + extraJob) / d.leads) * 100)}%</td>
                    <td className="font-semibold tabular-nums">{inr(d.billing + (live && s.productsScanned ? JOB.quote[1].amount : 0))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          [Store, 'Dealer gets', 'Full counter margin on every job; leads logged to their code; alert on the billing terminal.'],
          [BarChart3, 'AP gets', 'Product scanned at the counter links the batch to the warranty: stock and proof in one step.'],
          [FileWarning, 'Watch-out', 'Stock-outs break the 10-day start promise. Allocate kits at quote acceptance.'],
        ].map(([I, t, d]: any) => (
          <div key={t} className="rounded-2xl bg-white p-4 shadow-card"><I size={20} className="text-saffron-600" /><div className="mt-2 font-bold text-plum-900">{t}</div><p className="mt-1 text-[12.5px] text-slate-600">{d}</p></div>
        ))}
      </div>
    </div>
  )
}
