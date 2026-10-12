import { motion } from 'framer-motion'
import QRCode from 'qrcode'
import { ArrowRight, BarChart3, Building, CalendarDays, Check, CheckCircle2, Circle, Clock, CloudRain, Download, FileWarning, Hash, Home, Layers, Lock, Package, Settings2, ShieldCheck, UserRound, Wallet, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Footnote, MeasureStrip, ScreenHeader, SectionLabel, Sheet, cx, useToast } from '../components/ui'
import { CUSTOMER, DATES, JOB, NINETY, PEOPLE, RETENTION, RULES, fmtDate, inr } from '../lib/data'
import { warrantyPdf } from '../lib/pdf'
import { canActivate, openClaim, useStore, warrantyChecks } from '../lib/store'

export function useQr(text: string) {
  const [u, setU] = useState('')
  useEffect(() => { QRCode.toDataURL(text, { margin: 0, width: 160, color: { dark: '#22113f' } }).then(setU).catch(() => {}) }, [text])
  return u
}

export default function Warranty() {
  const { s, d } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const qr = useQr(`DEMO-VERIFY:${JOB.id}`)
  const [cov, setCov] = useState(false)
  const [rel, setRel] = useState(false)
  const [paying, setPaying] = useState(false)
  const checks = warrantyChecks(s)
  const active = s.warranty.active
  const oc = openClaim(s)

  const retStatus = s.retention.status === 'released'
    ? { t: 'Released by you', tone: 'green' as const }
    : s.retention.status === 'release_due' ? { t: 'Review passed · release due', tone: 'green' as const }
    : s.monsoon.status === 'on_hold' ? { t: 'On hold · held by you', tone: 'red' as const }
    : active ? { t: 'Pending monsoon review', tone: 'orange' as const } : { t: 'Not started', tone: 'gray' as const }

  return (
    <div className="pb-6">
      <ScreenHeader title="Assurance & Warranty" sub="Your work is protected with our service and product warranty." />

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cx('relative overflow-hidden rounded-3xl p-5 shadow-lift', active ? 'bg-gradient-to-br from-[#fffaf5] via-white to-plum-50' : 'bg-white')}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-saffron-100/70 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="font-display text-[22px] font-bold leading-none"><span className="text-plum-800">SmartCare</span> <span className="text-saffron-500">Dry360</span></div>
            <div className="mt-1 text-[11px] font-semibold tracking-[.22em] text-slate-500">WARRANTY CARD</div>
          </div>
          <div className={cx('grid h-12 w-11 place-items-center rounded-b-2xl rounded-t-md', active ? 'bg-gradient-to-b from-plum-600 to-plum-800 text-saffron-300' : 'bg-slate-200 text-slate-400')}>{active ? <ShieldCheck /> : <Lock size={18} />}</div>
        </div>
        <div className="relative mt-4 space-y-0.5 text-[13px]">
          <Line i={<Hash size={14} />} k="Job ID" v={JOB.id} />
          <Line i={<UserRound size={14} />} k="Customer" v={CUSTOMER.name} />
          <Line i={<Home size={14} />} k="Property" v="BTM 2nd Stage, Bengaluru" />
          <Line i={<Layers size={14} />} k="Surface" v="Terrace" />
          <Line i={<CheckCircle2 size={14} />} k="Completed" v={s.completion.paid90 ? fmtDate(DATES.completion) : '—'} />
          <Line i={<ShieldCheck size={14} />} k="Work warranty" v={active ? `2 years · to ${fmtDate(DATES.warrantyEnd)}` : '2 years (not active)'} />
          <Line i={<Package size={14} />} k="Product warranty" v="As per system" />
          <Line i={<Wallet size={14} />} k={`${RULES.retentionPct}% retained by you`} v={inr(RETENTION)} sub="until after first monsoon" />
          <Line i={<CalendarDays size={14} />} k="Review date" v={fmtDate(DATES.monsoonReview)} />
          <Line i={<Clock size={14} />} k="Status" v={<Badge tone={retStatus.tone}>{retStatus.t}</Badge>} />
        </div>
        <div className="relative mt-4 flex items-center gap-3 border-t border-dashed border-plum-200 pt-4">
          {qr ? <img src={qr} alt="Verification QR (demo)" className={cx('h-16 w-16 rounded-md', !active && 'opacity-30')} /> : <div className="h-16 w-16 rounded-md bg-slate-100" />}
          <div className="text-[12px] text-slate-500"><b className="text-plum-900">Scan to verify</b><br />Sample code for the prototype; not an AP-issued certificate.</div>
        </div>
        {!active && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent pt-10" />}
      </motion.div>

      {/* Activation */}
      {!active && (
        <Card className="mt-4 p-4">
          <div className="text-[15px] font-bold text-plum-900">Warranty switches on when…</div>
          <div className="mt-2 space-y-2">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-2.5 text-[13.5px]">
                {c.ok ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Circle size={18} className="text-slate-300" />}
                <span className={c.ok ? 'text-ink' : 'text-slate-500'}>{c.label}</span>
              </div>
            ))}
          </div>
          {!checks[1].ok ? (
            <Button variant="outline" className="mt-4 w-full" onClick={() => nav(s.booking.status === 'confirmed' ? '/job' : '/')}>{s.booking.status === 'confirmed' ? 'Track remaining stages' : 'Start your journey'}</Button>
          ) : !s.completion.paid90 ? (
            <div className="mt-4 rounded-xl bg-plum-50 p-3">
              <div className="flex justify-between text-[13px]"><span className="text-slate-600">90% of job value</span><b className="text-plum-900">{inr(NINETY)}</b></div>
              <div className="flex justify-between text-[13px]"><span className="text-slate-600">Diagnosis fee credited</span><span>− {inr(RULES.diagnosisFee)}</span></div>
              <div className="mt-1 flex justify-between border-t border-plum-100 pt-1 text-[14px]"><span className="font-semibold">Pay now</span><b className="text-plum-900">{inr(NINETY - RULES.diagnosisFee)}</b></div>
              <div className="flex justify-between text-[13px]"><span className="text-slate-600">You keep (10%)</span><b className="text-saffron-600">{inr(RETENTION)}</b></div>
              <Button className="mt-3 w-full" disabled={paying} onClick={() => { setPaying(true); setTimeout(() => { d({ type: 'payCompletion' }); setPaying(false); toast('Payment recorded (demo — no real transaction)') }, 800) }}>{paying ? 'Processing…' : `Pay ${inr(NINETY - RULES.diagnosisFee)} (demo)`}</Button>
            </div>
          ) : (
            <Button className="mt-4 w-full" disabled={!canActivate(s)} onClick={() => { d({ type: 'activateWarranty' }); toast('Work warranty activated by AP Warranty Desk') }}>Activate warranty <ShieldCheck size={17} /></Button>
          )}
        </Card>
      )}

      {/* Retention */}
      <SectionLabel>Your 10% retention</SectionLabel>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-saffron-50 text-saffron-600"><Wallet size={20} /></span>
          <div>
            <div className="text-[14.5px] font-bold text-plum-900">{inr(RETENTION)} stays with you</div>
            <p className="text-[12.5px] text-slate-600">It is <b>not</b> held in an AP wallet or escrow. You pay it after the first-monsoon review. AP pays the applicator separately at each verified stage.</p>
          </div>
        </div>
        <MonsoonTrack s={s} />
        {s.monsoon.note && <div className={cx('mt-3 rounded-xl px-3 py-2 text-[12.5px]', s.monsoon.status === 'on_hold' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800')}>{s.monsoon.note}</div>}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="soft" className="py-2.5 text-[13px]" onClick={() => setRel(true)}>Release milestone</Button>
          {s.retention.status === 'release_due'
            ? <Button className="py-2.5 text-[13px]" onClick={() => setRel(true)}>Release {inr(RETENTION)}</Button>
            : <Button variant="outline" className="py-2.5 text-[13px]" onClick={() => setCov(true)}>View coverage</Button>}
        </div>
      </Card>

      {/* Coverage */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="p-3.5">
          <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-emerald-700"><CheckCircle2 size={16} /> What is covered</div>
          <ul className="mt-2 space-y-1.5 text-[12.5px] text-slate-600">
            {['Waterproofing workmanship', 'Approved system application', 'Rectification up to job value'].map((x) => <li key={x} className="flex gap-1.5"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />{x}</li>)}
          </ul>
        </Card>
        <Card className="p-3.5">
          <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-red-600"><X size={16} /> Not covered</div>
          <ul className="mt-2 space-y-1.5 text-[12.5px] text-slate-600">
            {['Plumbing', 'Drainage', 'Structural defects'].map((x) => <li key={x} className="flex gap-1.5"><X size={14} className="mt-0.5 shrink-0 text-red-500" />{x}</li>)}
          </ul>
        </Card>
      </div>

      <div className="mt-4 space-y-2">
        <Button variant="plum" className="w-full" disabled={!active} icon={<FileWarning size={17} />} onClick={() => nav(oc ? `/claims/${oc.id}` : '/claims/new')}>{oc ? `View open claim ${oc.id}` : 'Raise a claim'}</Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="text-[13.5px]" icon={<Download size={16} />} onClick={async () => { await warrantyPdf(s); toast('Warranty downloaded') }}>Download</Button>
          <Button variant="outline" className="text-[13.5px]" onClick={() => nav('/claims')}>Claims history</Button>
        </div>
      </div>
      <Footnote icon={<ShieldCheck size={13} />}>Measure moved: trust in long-term assurance</Footnote>

      <MeasureStrip items={[
        { icon: <UserRound size={18} />, k: 'Customer action', v: 'View warranty & release date' },
        { icon: <Settings2 size={18} />, k: 'AP action', v: 'Manage claims + 10% release' },
        { icon: <BarChart3 size={18} />, k: 'Measure moved', v: 'Repeat leaks; on-time release' },
      ]} />

      <Sheet open={cov} onClose={() => setCov(false)} title="Coverage in full">
        <div className="space-y-3 text-[13.5px] text-slate-700">
          <p><b>Work warranty, {RULES.workWarrantyYears} years.</b> Eligible workmanship defects get a free repair or redo, up to the original job value ({inr(JOB.value)}).</p>
          <p><b>Product warranty.</b> {JOB.systemWarranty}. Batch {JOB.batch}.</p>
          <p><b>Exclusions.</b> Structural defects, drainage, and plumbing (the pipes themselves), or issues not attributable to covered waterproofing workmanship.</p>
          <p><b>How claims are decided.</b> An independent AP inspector checks the site against your Water Health Record. The original applicator does not decide your claim.</p>
          <p className="text-[12px] text-slate-500">Prototype wording for discussion; not binding legal terms.</p>
        </div>
      </Sheet>

      <Sheet open={rel} onClose={() => setRel(false)} title="Release milestone">
        <div className="space-y-3 text-[13.5px] text-slate-700">
          <div className="rounded-xl bg-plum-50 p-3">
            <div className="flex justify-between"><span>Paid on completion (90%)</span><b>{inr(NINETY)}</b></div>
            <div className="flex justify-between"><span>Retained by you (10%)</span><b className="text-saffron-600">{inr(RETENTION)}</b></div>
          </div>
          <p>After the first monsoon, AP inspects the terrace and ceiling below (review due <b>{fmtDate(DATES.monsoonReview)}</b>). If the area stays dry, the release becomes due and <b>you</b> pay the {inr(RETENTION)} under the service terms.</p>
          <p>If there's a leak, the review is put on hold. A claim being closed does not release the money by itself; the area must pass review.</p>
          {s.retention.status === 'release_due' && <Button className="w-full" onClick={() => { d({ type: 'releaseRetention' }); setRel(false); toast(`${inr(RETENTION)} released. Thank you!`) }}>Release {inr(RETENTION)} now (demo)</Button>}
          {s.retention.status === 'released' && <div className="rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-700">Released on {fmtDate(s.retention.releasedAt)}</div>}
        </div>
      </Sheet>
    </div>
  )
}

function Line({ i, k, v, sub }: { i: React.ReactNode; k: string; v: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <span className="text-plum-500">{i}</span>
      <span className="w-[38%] shrink-0 text-slate-500">{k}</span>
      <span className="font-bold text-ink">{v}{sub && <div className="text-[11px] font-normal text-slate-500">{sub}</div>}</span>
    </div>
  )
}

function MonsoonTrack({ s }: { s: ReturnType<typeof useStore>['s'] }) {
  const steps = [
    { t: 'Completed & paid 90%', ok: s.completion.paid90 },
    { t: 'Monsoon (Jun–Sep)', ok: s.monsoon.status === 'review_passed' || s.monsoon.status === 'on_hold' || s.retention.status === 'released', icon: CloudRain },
    { t: 'Review ' + fmtDate(DATES.monsoonReview), ok: s.monsoon.status === 'review_passed' || s.retention.status === 'released', hold: s.monsoon.status === 'on_hold' },
    { t: 'You release 10%', ok: s.retention.status === 'released' },
  ]
  return (
    <div className="mt-4 flex items-start">
      {steps.map((x, i) => (
        <div key={i} className="relative flex flex-1 flex-col items-center text-center">
          {i > 0 && <div className={cx('absolute right-1/2 top-3 h-0.5 w-full', x.ok ? 'bg-saffron-500' : 'bg-slate-200')} />}
          <div className={cx('relative z-10 grid h-6 w-6 place-items-center rounded-full text-white', x.hold ? 'bg-red-500' : x.ok ? 'bg-saffron-500' : 'bg-slate-200')}>{x.ok ? <Check size={13} strokeWidth={3} /> : x.hold ? <X size={13} /> : <Building size={11} className="text-slate-400" />}</div>
          <div className="mt-1 px-0.5 text-[10.5px] leading-tight text-slate-600">{x.t}</div>
        </div>
      ))}
    </div>
  )
}

