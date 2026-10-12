import { motion } from 'framer-motion'
import { ArrowRight, Bell, BadgeCheck, CalendarClock, Camera, ClipboardCheck, FileSearch, Home as HomeIcon, ScanSearch, ShieldCheck, Paintbrush, Droplets } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Progress, SectionLabel, cx } from '../components/ui'
import { CUSTOMER, DATES, PROPERTY, fmtDate } from '../lib/data'
import { activeStage, allApproved, approvedCount, journeyStep, openClaim, useStore } from '../lib/store'

const JOURNEY = [
  { k: 'Photo check', icon: Camera },
  { k: 'Diagnosis', icon: ScanSearch },
  { k: 'Execution', icon: Paintbrush },
  { k: 'Audit', icon: ClipboardCheck },
  { k: 'Assurance', icon: ShieldCheck },
]

export function useNextAction() {
  const { s } = useStore()
  const oc = openClaim(s)
  if (oc) return { title: `Claim ${oc.id} in progress`, body: oc.outcome ? (oc.outcome === 'eligible' ? 'Covered: free rectification under your work warranty.' : 'Decision shared with reasons and next steps.') : 'Independent inspection under way.', cta: 'View claim', to: `/claims/${oc.id}` }
  if (s.photoCheck.status === 'none') return { title: 'Seeing damp or a leak?', body: 'Send 3–5 photos. An expert replies within 24 hours, free.', cta: 'Check a water leakage', to: '/check' }
  if (s.photoCheck.status === 'submitted') return { title: 'Photo check submitted', body: `Request ${s.photoCheck.requestId}. Expert review within 24 hours.`, cta: 'View request', to: '/check/submitted' }
  if (s.diagnosis.status === 'none') return { title: 'Expert reviewed your photos', body: 'A ₹999 site visit will confirm the source. Credited if you go ahead.', cta: 'Book diagnosis visit', to: '/diagnosis' }
  if (s.diagnosis.status === 'visit_booked') return { title: 'Diagnosis visit booked', body: `${fmtDate(DATES.visit)}, 11:00 am · moisture meter + terrace inspection`, cta: 'View visit', to: '/diagnosis' }
  if (s.quote.status === 'pending') return { title: 'Your diagnosis report is ready', body: 'Written cause, scope and a fixed quote. Usable with any contractor.', cta: 'Read report', to: '/diagnosis' }
  if (s.quote.status === 'rejected') return { title: 'Quote declined', body: 'Your report is still yours to use. You can reopen the quote anytime.', cta: 'View report', to: '/diagnosis' }
  if (s.booking.status === 'proposed') return { title: 'Confirm your job schedule', body: 'Certified terrace applicator and AP auditor assigned.', cta: 'Review booking', to: '/booking' }
  if (!allApproved(s)) { const st = activeStage(s)!; return { title: `Stage ${st.n} of 7: ${st.short}`, body: st.onsite ? 'Independent auditor checks this stage on site.' : 'Applicator uploads stage photos; AP auditor verifies.', cta: 'Track job', to: '/job' } }
  if (!s.warranty.active) return { title: 'All 7 stages verified', body: 'Pay 90% on completion to switch on your work warranty.', cta: 'Activate warranty', to: '/warranty' }
  if (s.retention.status === 'release_due') return { title: 'Monsoon review passed', body: 'Your terrace stayed dry. Release your 10% retention when ready.', cta: 'Review release', to: '/warranty' }
  return { title: 'Your home is assured', body: `Work warranty to ${fmtDate(DATES.warrantyEnd)}. Retention with you until after the monsoon.`, cta: 'View warranty', to: '/warranty' }
}

export default function Home() {
  const { s } = useStore()
  const nav = useNavigate()
  const step = journeyStep(s)
  const next = useNextAction()
  const done = approvedCount(s)
  const jobOn = s.booking.status === 'confirmed'

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="relative -mx-4 -mt-1 overflow-hidden rounded-b-[32px] bg-gradient-to-br from-plum-800 via-plum-700 to-plum-600 px-5 pb-6 pt-5 text-white">
        <svg className="absolute -right-10 -top-6 h-56 w-56 opacity-[.13]" viewBox="0 0 200 200"><path d="M100 10 C130 60 170 90 170 130 a70 70 0 0 1 -140 0 C30 90 70 60 100 10z" fill="#fff" /></svg>
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-saffron-500/25 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="font-display text-[17px] font-bold">SmartCare <span className="text-saffron-300">Dry360</span></div>
          <button aria-label="Notifications" onClick={() => nav('/jobs')} className="relative grid h-9 w-9 place-items-center rounded-full bg-white/10"><Bell size={18} />{(jobOn || s.photoCheck.status !== 'none') && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-saffron-500" />}</button>
        </div>
        <div className="relative mt-5 text-[13.5px] text-white/70">Namaste, {CUSTOMER.first}</div>
        <h1 className="relative mt-0.5 font-display text-[25px] font-bold leading-tight">Welcome to SmartCare Dry360</h1>
        <div className="relative mt-1 text-[15px] font-semibold text-saffron-300">Har baarish, sookha ghar.</div>

        {/* journey */}
        <div className="relative mt-5 flex items-start justify-between">
          {JOURNEY.map((j, i) => {
            const st = i < step ? 'done' : i === step ? 'now' : 'todo'
            return (
              <div key={j.k} className="relative flex flex-1 flex-col items-center">
                {i > 0 && <div className={cx('absolute right-1/2 top-4 h-0.5 w-full', i <= step ? 'bg-saffron-400' : 'bg-white/20')} />}
                <div className={cx('relative z-10 grid h-8 w-8 place-items-center rounded-full transition', st === 'done' ? 'bg-saffron-500 text-white' : st === 'now' ? 'bg-white text-plum-700 ring-4 ring-white/25' : 'bg-white/15 text-white/60')}>
                  <j.icon size={15} />
                </div>
                <span className={cx('mt-1.5 text-[10.5px] font-medium', st === 'todo' ? 'text-white/50' : 'text-white')}>{j.k}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next action */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="-mt-1 mt-4 overflow-hidden">
          <div className="p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-saffron-600">Next step</div>
            <div className="mt-1 font-display text-[18px] font-bold text-plum-900">{next.title}</div>
            <p className="mt-1 text-[13.5px] text-slate-600">{next.body}</p>
            <Button className="mt-4 w-full" onClick={() => nav(next.to)} icon={s.photoCheck.status === 'none' ? <Droplets size={18} /> : undefined}>{next.cta} <ArrowRight size={17} /></Button>
            <Button variant="ghost" className="mt-1 w-full" onClick={() => nav('/record')}>View my Water Health Record</Button>
          </div>
        </Card>
      </motion.div>

      {/* Property */}
      <SectionLabel right={<button onClick={() => nav('/property')} className="text-[12.5px] font-semibold text-plum-600">Details</button>}>My property</SectionLabel>
      <Card className="flex gap-3 p-3" onClick={() => nav('/property')}>
        <HouseArt />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="text-[15px] font-bold text-plum-900">{PROPERTY.type}</div>
          <div className="truncate text-[12.5px] text-slate-500">BTM 2nd Stage, Bengaluru</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={s.warranty.active ? 'green' : s.photoCheck.status === 'none' ? 'orange' : 'plum'}>{s.warranty.active ? 'Terrace assured' : s.photoCheck.status === 'none' ? 'Ceiling damp reported' : 'Terrace under care'}</Badge>
            <Badge tone="gray">{PROPERTY.id.slice(-9)}</Badge>
          </div>
        </div>
      </Card>

      {/* Active job */}
      {jobOn && (
        <>
          <SectionLabel>Active job</SectionLabel>
          <Card className="p-4" onClick={() => nav('/job')}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold text-plum-900">Terrace waterproofing</div>
                <div className="text-[12.5px] text-slate-500">{done} of 7 stages verified</div>
              </div>
              <Badge tone={done === 7 ? 'green' : 'blue'}>{done === 7 ? 'Completed' : 'In progress'}</Badge>
            </div>
            <Progress value={(done / 7) * 100} className="mt-3" />
          </Card>
        </>
      )}

      {/* Warranty + inspection */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card className="p-3.5" onClick={() => nav('/warranty')}>
          <ShieldCheck className={s.warranty.active ? 'text-emerald-600' : 'text-slate-400'} size={22} />
          <div className="mt-2 text-[12px] text-slate-500">Work warranty</div>
          <div className="text-[14px] font-bold text-plum-900">{s.warranty.active ? `Active · 2 yrs` : 'Not active yet'}</div>
          <div className="mt-0.5 text-[11.5px] text-slate-500">{s.warranty.active ? `to ${fmtDate(DATES.warrantyEnd)}` : 'Starts after verified completion'}</div>
        </Card>
        <Card className="p-3.5" onClick={() => nav(s.warranty.active ? '/warranty' : s.diagnosis.status === 'visit_booked' ? '/diagnosis' : '/job')}>
          <CalendarClock className="text-saffron-500" size={22} />
          <div className="mt-2 text-[12px] text-slate-500">Upcoming inspection</div>
          <div className="text-[14px] font-bold text-plum-900">{upcoming(s).t}</div>
          <div className="mt-0.5 text-[11.5px] text-slate-500">{upcoming(s).d}</div>
        </Card>
      </div>

      {/* Pillars */}
      <SectionLabel right={<button onClick={() => nav('/how')} className="text-[12.5px] font-semibold text-plum-600">How it works</button>}>Sell a dry house, not just chemicals</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { i: FileSearch, t: 'Diagnose', b: 'By an expert not paid on sales' },
          { i: BadgeCheck, t: 'Verify', b: '7 photo stages, 2 on-site audits' },
          { i: ShieldCheck, t: 'Assure', b: '2-yr work warranty + 10% held by you' },
        ].map((p) => (
          <Card key={p.t} className="p-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-plum-50 text-plum-700"><p.i size={18} /></div>
            <div className="mt-2 text-[14px] font-bold text-plum-900">{p.t}</div>
            <div className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{p.b}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-3 flex items-center gap-3 bg-gradient-to-r from-saffron-50 to-white p-4" onClick={() => nav('/how')}>
        <HomeIcon className="shrink-0 text-saffron-600" />
        <div className="text-[13px] text-plum-900"><b>Guided, Certified or Assure.</b> See what each service level includes.</div>
        <ArrowRight size={18} className="ml-auto shrink-0 text-plum-500" />
      </Card>
    </div>
  )
}

function upcoming(s: ReturnType<typeof useStore>['s']) {
  if (s.diagnosis.status === 'visit_booked') return { t: 'Diagnosis visit', d: fmtDate(DATES.visit) + ', 11 am' }
  if (s.booking.status === 'confirmed' && !allApproved(s)) {
    const st = activeStage(s)!
    if (st.n <= 6) return { t: 'Pre-cover audit', d: 'On site · 23 Apr 2027' }
    return { t: 'Water test audit', d: 'On site · 24 Apr 2027' }
  }
  if (s.warranty.active && s.monsoon.status === 'scheduled') return { t: 'Monsoon review', d: fmtDate(DATES.monsoonReview) }
  if (s.monsoon.status === 'review_passed') return { t: 'Yearly check', d: 'Before monsoon 2028' }
  return { t: 'None scheduled', d: 'Free photo check anytime' }
}

export function HouseArt({ className }: { className?: string }) {
  return (
    <div className={cx('h-[78px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-sky-200 to-sky-50', className)}>
      <svg viewBox="0 0 92 78" className="h-full w-full">
        <rect x="14" y="30" width="64" height="44" fill="#f3ede4" />
        <rect x="10" y="26" width="72" height="6" fill="#d9cfbf" />
        <rect x="18" y="10" width="44" height="18" fill="#efe7da" /><rect x="15" y="8" width="50" height="4" fill="#cfc4b2" />
        <rect x="22" y="40" width="14" height="12" rx="1" fill="#6b3fb8" opacity=".75" /><rect x="56" y="40" width="14" height="12" rx="1" fill="#6b3fb8" opacity=".75" />
        <rect x="40" y="52" width="12" height="22" fill="#f47b20" />
        <rect x="24" y="14" width="10" height="9" fill="#6b3fb8" opacity=".6" />
        <path d="M70 6 q2 3 0 6 M76 4 q2 3 0 6" stroke="#5aa0d8" strokeWidth="1.5" fill="none" />
        <rect x="0" y="74" width="92" height="4" fill="#9cc77e" />
      </svg>
    </div>
  )
}
