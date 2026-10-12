import { ArrowRight, BarChart3, Bath, BellRing, Building2, Camera, ChevronRight, ClipboardCheck, Droplets, FileText, Globe, Hammer, Home as HomeIcon, Info, Languages, LogOut, Phone, ScanSearch, ShieldCheck, Star, UserRound, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Card, KV, ScreenHeader, SectionLabel, StageBadge, cx, useToast } from '../components/ui'
import { CUSTOMER, DATES, JOB, PROPERTY, fmtDate, fmtDateTime, inr } from '../lib/data'
import { activeStage, allApproved, approvedCount, openClaim, useStore } from '../lib/store'
import { claimTone } from './Claims'
import { HouseArt } from './Home'

export function Property() {
  const { s } = useStore()
  const nav = useNavigate()
  const surfaces = [
    { i: HomeIcon, t: 'Terrace', st: s.warranty.active ? 'Assured' : s.photoCheck.status !== 'none' ? 'Under care' : 'Leak reported', tone: s.warranty.active ? 'green' : 'orange' },
    { i: Bath, t: 'Bathrooms (2)', st: 'No issues', tone: 'gray' },
    { i: Building2, t: 'Exterior walls', st: 'No issues', tone: 'gray' },
    { i: Droplets, t: 'Overhead tank', st: 'No issues', tone: 'gray' },
  ] as const
  return (
    <div className="pb-6">
      <ScreenHeader title="My Property" back={false} />
      <Card className="overflow-hidden">
        <HouseArt className="h-40 w-full rounded-none" />
        <div className="p-4">
          <div className="text-[16px] font-bold text-plum-900">{PROPERTY.type}</div>
          <div className="text-[13px] text-slate-500">{PROPERTY.address}</div>
          <div className="mt-2 flex gap-2"><Badge tone="plum">{PROPERTY.id}</Badge><Badge tone="gray">Built {PROPERTY.built}</Badge></div>
        </div>
      </Card>
      <SectionLabel>Surfaces</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        {surfaces.map((x) => (
          <Card key={x.t} className="p-3.5" onClick={() => nav(x.t === 'Terrace' ? '/record' : '/check')}>
            <x.i className="text-plum-600" size={20} />
            <div className="mt-2 text-[14px] font-bold text-plum-900">{x.t}</div>
            <Badge tone={x.tone} className="mt-1">{x.st}</Badge>
          </Card>
        ))}
      </div>
      <SectionLabel>Affected area</SectionLabel>
      <Card className="px-4 py-1">
        <KV k="Reported issue" v="Damp patch on upstairs ceiling" />
        <KV k="Location" v={PROPERTY.affected} />
        <KV k="Earlier repairs" v="2 attempts, no warranty (demo)" />
      </Card>
      <Button className="mt-4 w-full" onClick={() => nav('/record')}>Open Water Health Record <ArrowRight size={17} /></Button>
      <Button variant="ghost" className="mt-1 w-full" onClick={() => nav('/check')}>Report a new issue</Button>
    </div>
  )
}

export function Jobs() {
  const { s } = useStore()
  const nav = useNavigate()
  const items: { i: typeof Camera; t: string; sub: string; badge: [any, string]; to: string }[] = []
  if (s.photoCheck.status !== 'none') items.push({ i: Camera, t: `Photo check ${s.photoCheck.requestId}`, sub: fmtDateTime(s.photoCheck.submittedAt), badge: s.photoCheck.status === 'reviewed' ? ['green', 'Reviewed'] : ['orange', 'In review'], to: '/check/submitted' })
  if (s.diagnosis.status !== 'none') items.push({ i: ScanSearch, t: 'Diagnosis visit', sub: s.diagnosis.status === 'report_ready' ? `Report ${fmtDate(s.diagnosis.reportAt)}` : `Booked ${fmtDateTime(s.diagnosis.visitAt)}`, badge: s.diagnosis.status === 'report_ready' ? (s.quote.status === 'accepted' ? ['green', 'Quote accepted'] : s.quote.status === 'rejected' ? ['gray', 'Quote declined'] : ['orange', 'Quote awaiting you']) : ['blue', 'Visit booked'], to: '/diagnosis' })
  if (s.quote.status === 'accepted') {
    const cur = activeStage(s)
    items.push({ i: Hammer, t: `Terrace waterproofing · ${JOB.id}`, sub: s.booking.status === 'confirmed' ? `${approvedCount(s)} of 7 stages verified` : 'Schedule awaiting confirmation', badge: allApproved(s) ? ['green', 'Completed'] : s.booking.status === 'confirmed' ? ['blue', cur ? `Stage ${cur.n}` : ''] : ['orange', 'Confirm'], to: s.booking.status === 'confirmed' ? '/job' : '/booking' })
  }
  s.claims.forEach((c) => { const t = claimTone(c); items.push({ i: Wrench, t: `Claim ${c.id}`, sub: fmtDate(c.raisedAt), badge: [t.tone, t.t], to: `/claims/${c.id}` }) })
  return (
    <div className="pb-6">
      <ScreenHeader title="My Jobs" back={false} sub="Every request, visit, job and claim in one place." />
      {items.length === 0 ? (
        <Card className="p-6 text-center"><Camera className="mx-auto text-plum-400" /><div className="mt-2 font-bold text-plum-900">Nothing yet</div><p className="text-sm text-slate-500">Start with a free photo check.</p><Button className="mt-4 w-full" onClick={() => nav('/check')}>Check a water leakage</Button></Card>
      ) : (
        <div className="space-y-3">
          {[...items].reverse().map((x) => (
            <Card key={x.t} className="flex items-center gap-3 p-3.5" onClick={() => nav(x.to)}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-plum-50 text-plum-700"><x.i size={20} /></span>
              <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-bold text-plum-900">{x.t}</div><div className="text-[12px] text-slate-500">{x.sub}</div></div>
              <Badge tone={x.badge[0]}>{x.badge[1]}</Badge>
            </Card>
          ))}
        </div>
      )}
      {s.booking.status === 'confirmed' && (
        <>
          <SectionLabel>Stages at a glance</SectionLabel>
          <Card className="divide-y divide-slate-100 px-4">
            {s.stages.map((st) => <div key={st.n} className="flex items-center justify-between py-2.5 text-[13.5px]"><span>{st.n}. {st.short}</span><StageBadge s={st.status} /></div>)}
          </Card>
        </>
      )}
    </div>
  )
}

export function Profile() {
  const { s, d } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  return (
    <div className="pb-6">
      <ScreenHeader title="Profile" back={false} />
      <Card className="flex items-center gap-3 p-4">
        <Avatar name={CUSTOMER.name} size={56} tone="orange" />
        <div><div className="text-[17px] font-bold text-plum-900">{CUSTOMER.name}</div><div className="text-[12.5px] text-slate-500">{CUSTOMER.phone}</div><div className="text-[12.5px] text-slate-500">{CUSTOMER.city}</div></div>
      </Card>
      <SectionLabel>Account</SectionLabel>
      <Card className="divide-y divide-slate-100">
        {[
          { i: HomeIcon, t: 'My property', to: '/property' },
          { i: ShieldCheck, t: 'Warranty & claims', to: '/warranty' },
          { i: FileText, t: 'Water Health Record', to: '/record' },
          { i: Info, t: 'How SmartCare Dry360 works', to: '/how' },
        ].map((x) => (
          <button key={x.t} onClick={() => nav(x.to)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[14px] font-medium text-ink"><x.i size={18} className="text-plum-500" />{x.t}<ChevronRight size={16} className="ml-auto text-slate-400" /></button>
        ))}
        {[{ i: BellRing, t: 'Notifications', v: 'On' }, { i: Languages, t: 'Language', v: 'English' }, { i: Phone, t: 'Call AP helpline', v: '' }].map((x) => (
          <button key={x.t} onClick={() => toast(`${x.t} (demo)`)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[14px] font-medium text-ink"><x.i size={18} className="text-plum-500" />{x.t}<span className="ml-auto text-[12.5px] text-slate-400">{x.v}</span></button>
        ))}
      </Card>
      <SectionLabel>Demo</SectionLabel>
      <Card className="p-4">
        <div className="text-[13px] text-slate-600">Switch to a partner view. All roles share the same job data.</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {([['applicator', 'Applicator'], ['auditor', 'Auditor'], ['dealer', 'Dealer']] as const).map(([r, t]) => (
            <Button key={r} variant="soft" className="px-2 py-2.5 text-[13px]" onClick={() => { d({ type: 'role', role: r }); nav(`/partner/${r}`) }}>{t}</Button>
          ))}
        </div>
        <Button variant="danger" className="mt-3 w-full" icon={<LogOut size={16} />} onClick={() => { d({ type: 'reset' }); nav('/'); toast('Demo reset') }}>Reset demo</Button>
      </Card>
      <p className="mt-4 text-center text-[11.5px] text-slate-400">Concept prototype developed for Asian Paints CANVAS 2026 by Team The Syndicate, XLRI Jamshedpur. Not an official Asian Paints application.</p>
    </div>
  )
}

export function HowItWorks() {
  const rows = [
    { c: 'Upload leak photos', a: 'Expert review in 24 hrs', m: 'Lead-to-diagnosis conversion', i: Camera },
    { c: 'Review written diagnosis', a: 'Independent cause assessment', m: 'Diagnosis-to-job conversion', i: ScanSearch },
    { c: 'Track work progress', a: '7 photo checks + 2 on-site audits', m: 'Right-first-time rate', i: ClipboardCheck },
    { c: 'View warranty & release milestone', a: 'Manage assurance and claims', m: 'Repeat-leak rate; retention released on time', i: ShieldCheck },
  ]
  const levels = [
    { t: 'Guided', p: 'Free', b: ['Photo check & expert advice', 'Use any contractor'], tone: 'from-amber-100 to-amber-50 text-amber-800' },
    { t: 'Certified', p: 'Certified work', b: ['Certified applicator', 'Stage photos on record', 'Product + work warranty'], tone: 'from-plum-100 to-plum-50 text-plum-800' },
    { t: 'Assure', p: '₹75 / sq ft', b: ['Managed end to end', '2 on-site audits', '2-yr work warranty', '10% held by you to monsoon'], tone: 'from-saffron-500 to-saffron-600 text-white', hi: true },
  ]
  return (
    <div className="pb-6">
      <ScreenHeader title="How SmartCare Dry360 works" sub="One managed job from diagnosis to the first monsoon, with a different person checking each step." />
      <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-card">
        {['Photo check', 'Diagnosis', 'Execution', 'Audit', 'Assurance'].map((t, i) => (
          <div key={t} className="flex items-center"><div className="text-center"><div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-plum-700 text-[12px] font-bold text-white">{i + 1}</div><div className="mt-1 text-[10px] font-semibold text-plum-900">{t}</div></div>{i < 4 && <ChevronRight size={14} className="mx-0.5 text-saffron-500" />}</div>
        ))}
      </div>
      <SectionLabel>Customer → Asian Paints → Outcome</SectionLabel>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <Card key={r.c} className="grid grid-cols-[auto_1fr] gap-x-3 p-3.5">
            <span className="row-span-3 grid h-10 w-10 place-items-center rounded-xl bg-saffron-50 text-saffron-600"><r.i size={19} /></span>
            <div className="text-[13.5px]"><span className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Customer · </span><b className="text-plum-900">{r.c}</b></div>
            <div className="text-[13px]"><span className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">AP · </span>{r.a}</div>
            <div className="text-[13px] text-saffron-700"><span className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Measure · </span>{r.m}</div>
          </Card>
        ))}
      </div>
      <SectionLabel>Three service levels</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {levels.map((l) => (
          <div key={l.t} className={cx('rounded-2xl bg-gradient-to-b p-3', l.tone, l.hi && 'shadow-lift')}>
            <Star size={16} className={l.hi ? 'text-white' : ''} />
            <div className="mt-1 font-display text-[15px] font-bold">{l.t}</div>
            <div className={cx('text-[11.5px] font-semibold', l.hi ? 'text-white/90' : 'opacity-80')}>{l.p}</div>
            <ul className="mt-2 space-y-1 text-[11px] leading-snug">{l.b.map((x) => <li key={x}>• {x}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="mt-2 text-center text-[11.5px] text-slate-500">AP control and liability rise together.</div>
      <SectionLabel>Who decides what</SectionLabel>
      <Card className="divide-y divide-slate-100 px-4">
        {[['AP Diagnostician', 'Cause & scope', 'Salary, not sales'], ['Certified applicator', 'Execution', 'Steady jobs, paid per verified stage'], ['AP Auditor', 'Stage sign-off', 'Reports to Quality'], ['Warranty desk', 'Claims & closure', 'Closure time'], ['AI pre-screen', 'Flags missing photos only', 'Never decides cause or warranty']].map(([a, b, c]) => (
          <div key={a} className="py-2.5"><div className="text-[13.5px] font-bold text-plum-900">{a}</div><div className="text-[12.5px] text-slate-600">{b} · <span className="text-slate-400">{c}</span></div></div>
        ))}
      </Card>
      <p className="mt-4 text-center text-[11.5px] text-slate-400">Concept prototype developed for Asian Paints CANVAS 2026. Not an official Asian Paints application.</p>
    </div>
  )
}

