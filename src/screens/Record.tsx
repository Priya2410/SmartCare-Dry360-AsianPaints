import { motion } from 'framer-motion'
import { ArrowRightLeft, Award, Box, Building2, CalendarDays, Camera, CheckCircle2, ClipboardCheck, Download, Droplets, Eye, FileText, Home, Lock, MapPin, Share2, ShieldCheck, Store, Target, UserRound, Wrench } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Empty, KV, SectionLabel, ScreenHeader, Sheet, Thumb, cx, useToast } from '../components/ui'
import { CUSTOMER, DATES, JOB, PEOPLE, PROPERTY, fmtDate, fmtDateTime, inr } from '../lib/data'
import { recordPdf } from '../lib/pdf'
import { allApproved, approvedCount, useStore } from '../lib/store'
import type { DemoState } from '../lib/types'
import { claimTone } from './Claims'
import { useQr } from './Warranty'

function history(s: DemoState) {
  const ev: { at: string; t: string; d: string; icon: typeof Home; tone: string }[] = []
  ev.push({ at: '2009-06-01', t: 'Property added', d: `${PROPERTY.type}, built ${PROPERTY.built}`, icon: Home, tone: 'bg-slate-400' })
  if (s.photoCheck.submittedAt) ev.push({ at: s.photoCheck.submittedAt, t: 'Leak reported (photo check)', d: `${s.photoCheck.photos.length} photos · ${s.photoCheck.symptoms.join(', ')}`, icon: Camera, tone: 'bg-saffron-500' })
  if (s.diagnosis.reportAt) ev.push({ at: s.diagnosis.reportAt, t: 'Expert diagnosis issued', d: 'Parapet joint + drain collar · confidence high', icon: Target, tone: 'bg-plum-600' })
  if (s.quote.status === 'accepted') ev.push({ at: s.quote.decidedAt!, t: 'Quote accepted', d: `${inr(JOB.value)} · Assure level`, icon: FileText, tone: 'bg-plum-600' })
  s.stages.filter((x) => x.approvedAt).forEach((x) => ev.push({ at: x.approvedAt!, t: `Stage ${x.n} verified: ${x.short}`, d: x.onsite ? `On-site audit by ${PEOPLE.auditor.name}` : 'Photo evidence approved', icon: x.onsite ? ClipboardCheck : CheckCircle2, tone: x.onsite ? 'bg-emerald-600' : 'bg-emerald-500' }))
  if (s.warranty.activatedAt) ev.push({ at: s.warranty.activatedAt + ':01', t: 'Completion certificate & work warranty', d: `2 years to ${fmtDate(DATES.warrantyEnd)}`, icon: ShieldCheck, tone: 'bg-saffron-500' })
  ;[...s.claims].reverse().forEach((c) => {
    ev.push({ at: c.raisedAt, t: `Claim ${c.id} raised`, d: c.description, icon: Wrench, tone: 'bg-red-400' })
    if (c.closedAt) ev.push({ at: c.closedAt, t: `Claim ${c.id} closed`, d: c.outcome === 'eligible' ? 'Free rectification verified' : 'Not covered: plumbing; referred on', icon: Wrench, tone: c.outcome === 'eligible' ? 'bg-emerald-500' : 'bg-slate-400' })
  })
  if (s.monsoon.reviewedAt) ev.push({ at: s.monsoon.reviewedAt, t: s.monsoon.status === 'review_passed' ? 'Monsoon review passed' : 'Monsoon review on hold', d: s.monsoon.note || '', icon: Droplets, tone: s.monsoon.status === 'review_passed' ? 'bg-sky-500' : 'bg-red-400' })
  if (s.retention.releasedAt) ev.push({ at: s.retention.releasedAt, t: '10% retention released', d: 'Paid by owner after review', icon: CheckCircle2, tone: 'bg-emerald-600' })
  return ev.sort((a, b) => b.at.localeCompare(a.at))
}

export function RecordView({ readOnly = false }: { readOnly?: boolean }) {
  const { s } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const qr = useQr(`DEMO-VERIFY:${PROPERTY.id}`)
  const [share, setShare] = useState(false)
  const [transfer, setTransfer] = useState(false)
  const allPhotos = s.stages.flatMap((x) => x.photos)
  const hasJob = s.booking.status === 'confirmed'
  const status = s.warranty.active ? (s.monsoon.status === 'review_passed' ? 'Active · monsoon review passed' : s.monsoon.status === 'on_hold' ? 'Active · review on hold' : 'Active · awaiting monsoon review') : hasJob ? 'Work in progress' : s.photoCheck.status !== 'none' ? 'Issue under diagnosis' : 'No issues on record'

  return (
    <div className="pb-6">
      {/* Hero record card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-plum-800 via-plum-700 to-plum-600 p-5 text-white shadow-lift">
        <svg className="absolute -right-6 -top-4 h-44 w-44 opacity-10" viewBox="0 0 100 100"><path d="M50 5 C65 30 85 45 85 65 a35 35 0 0 1 -70 0 C15 45 35 30 50 5z" fill="#fff" /></svg>
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-[.2em] text-saffron-300">WATER HEALTH RECORD</div>
            <div className="mt-1 font-display text-[19px] font-bold leading-tight">{PROPERTY.type}</div>
            <div className="text-[12.5px] text-white/75">{CUSTOMER.name} · Bengaluru</div>
          </div>
          {qr && <img src={qr} alt="Record QR (demo)" className="h-[60px] w-[60px] rounded-lg bg-white p-1" />}
        </div>
        <div className="relative mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-semibold">{PROPERTY.id}</span>
          <span className="rounded-full bg-saffron-500 px-2.5 py-1 text-[11.5px] font-semibold">{status}</span>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
          <HeroStat v={`${approvedCount(s)}/7`} k="Stages verified" />
          <HeroStat v={`${s.stages.filter((x) => x.onsite && x.status === 'approved').length}/2`} k="On-site audits" />
          <HeroStat v={String(s.claims.length)} k="Claims" />
        </div>
        <div className="relative mt-4 rounded-xl bg-white/10 px-3 py-2.5 text-center text-[13px] font-semibold">One property. One record. Proof that stays with your home.</div>
      </motion.div>

      {readOnly && <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-[12.5px] text-sky-800"><Eye size={15} /> Read-only shared copy (demo). Owner contact details hidden.</div>}

      {!readOnly && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { i: Download, t: 'PDF', f: async () => { await recordPdf(s); toast('Water Health Record downloaded') } },
            { i: Share2, t: 'Share', f: () => setShare(true) },
            { i: ShieldCheck, t: 'Warranty', f: () => nav('/warranty') },
            { i: Camera, t: 'Evidence', f: () => nav('/job') },
          ].map((x) => (
            <button key={x.t} onClick={x.f} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-[12px] font-semibold text-plum-800 shadow-card active:scale-95">
              <x.i size={19} className="text-saffron-500" />{x.t}
            </button>
          ))}
        </div>
      )}

      {/* Diagnosis */}
      <SectionLabel>Property & diagnosis</SectionLabel>
      <Card className="divide-y divide-slate-100 px-4 py-1">
        <KV icon={<MapPin size={15} />} k="Address" v={readOnly ? 'BTM 2nd Stage, Bengaluru 560076' : PROPERTY.address} />
        <KV icon={<Layers2 />} k="Surface" v="Terrace · 1,000 sq ft" />
        <KV icon={<Droplets size={15} />} k="Diagnosed issue" v={s.diagnosis.reportAt ? PROPERTY.issue : '—'} />
        <KV icon={<Target size={15} />} k="Root cause" v={s.diagnosis.reportAt ? 'Parapet joint + drain collar' : '—'} />
        <KV icon={<UserRound size={15} />} k="Diagnosed by" v={s.diagnosis.reportAt ? `${PEOPLE.diagnostician.name} (independent) · ${fmtDate(s.diagnosis.reportAt)}` : '—'} />
        <KV icon={<FileText size={15} />} k="Recommended" v={s.diagnosis.reportAt ? JOB.system : '—'} />
      </Card>

      {!hasJob && !readOnly && s.photoCheck.status === 'none' && (
        <div className="mt-3"><Empty icon={<Building2 />} title="Your record starts here" body="Every check, diagnosis, stage photo and audit gets added to this record automatically." action={<Button onClick={() => nav('/check')}>Check a water leakage</Button>} /></div>
      )}

      {hasJob && (<>
        <SectionLabel>Work & materials</SectionLabel>
        <Card className="divide-y divide-slate-100 px-4 py-1">
          <KV icon={<Award size={15} />} k="Certified applicator" v={`${PEOPLE.applicator.name}, ${PEOPLE.applicator.firm} · terrace systems`} />
          <KV icon={<Box size={15} />} k="Product / batch" v={<>{JOB.system}<div className="text-[12px] font-normal text-slate-500">Batch {JOB.batch}{s.productsScanned ? ' · scanned at counter' : ' · not yet scanned'}</div></>} />
          <KV icon={<Store size={15} />} k="Dealer" v={`${PEOPLE.dealer.name} (${PEOPLE.dealer.code})`} />
          <KV icon={<CalendarDays size={15} />} k="Work dates" v={`${fmtDate(DATES.jobStart)} – ${allApproved(s) ? fmtDate(DATES.jobEnd) : 'in progress'}`} />
        </Card>

        <SectionLabel right={<span className="text-[12px] text-slate-500">{allPhotos.length} photos</span>}>Stage-wise proof</SectionLabel>
        <Card className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {s.stages.map((st) => (
              <div key={st.n} className="relative overflow-hidden rounded-xl">
                {st.photos[0] ? <Thumb k={st.photos[0]} all={allPhotos} i={allPhotos.indexOf(st.photos[0])} className="aspect-[4/3] w-full" caption={`${st.n}. ${st.title}`} /> : <div className="grid aspect-[4/3] place-items-center bg-slate-100 text-slate-300"><Camera /></div>}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-5 text-[11px] font-semibold text-white">
                  <span>{st.n}. {st.short}</span>{st.status === 'approved' && <CheckCircle2 size={14} className="text-emerald-300" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <SectionLabel>Independent audits</SectionLabel>
        <Card className="divide-y divide-slate-100 px-4">
          {s.stages.filter((x) => x.onsite).map((st) => {
            const a = st.audits.find((x) => x.decision === 'approved')
            return (
              <div key={st.n} className="flex items-start gap-3 py-3">
                <span className={cx('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full', a ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400')}>{a ? <ClipboardCheck size={16} /> : <Lock size={14} />}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between"><span className="text-[14px] font-bold text-plum-900">{st.title}</span><Badge tone={a ? 'green' : 'gray'}>{a ? 'Signed' : 'Pending'}</Badge></div>
                  <div className="text-[12.5px] text-slate-600">{a ? a.note : 'Auditor inspects this stage in person.'}</div>
                  {a && <div className="text-[11px] text-slate-400">{a.by} · {fmtDateTime(a.at)}</div>}
                  {st.n === 7 && st.reading && a && <div className="mt-1 text-[12px] font-semibold text-sky-700">Water test result: {st.reading}</div>}
                </div>
              </div>
            )
          })}
        </Card>
      </>)}

      {s.warranty.active && (
        <>
          <SectionLabel>Completion & warranties</SectionLabel>
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 bg-gradient-to-r from-saffron-50 to-white p-4">
              <Award className="shrink-0 text-saffron-500" size={30} />
              <div><div className="text-[14.5px] font-bold text-plum-900">Completion certificate</div><div className="text-[12px] text-slate-500">Job {JOB.id} · completed {fmtDate(DATES.completion)} · sample certificate</div></div>
            </div>
            <div className="divide-y divide-slate-100 px-4 py-1">
              <KV k="Work warranty" v={`2 years, to ${fmtDate(DATES.warrantyEnd)}`} strong />
              <KV k="Product warranty" v={JOB.systemWarranty} />
              <KV k="10% retention" v={s.retention.status === 'released' ? `Released ${fmtDate(s.retention.releasedAt)}` : s.retention.status === 'release_due' ? 'Release due (review passed)' : `Held by owner to ${fmtDate(DATES.monsoonReview)} review`} />
            </div>
          </Card>
        </>
      )}

      {s.claims.length > 0 && (<>
        <SectionLabel>Claims & rectification</SectionLabel>
        <div className="space-y-2">
          {s.claims.map((c) => { const t = claimTone(c); return (
            <Card key={c.id} className="flex items-center justify-between p-3.5" onClick={readOnly ? undefined : () => nav(`/claims/${c.id}`)}>
              <div><div className="text-[14px] font-bold text-plum-900">{c.id}</div><div className="text-[12px] text-slate-500">{fmtDate(c.raisedAt)} · {c.area}</div></div>
              <Badge tone={t.tone}>{t.t}</Badge>
            </Card>
          ) })}
        </div>
      </>)}

      <SectionLabel>Property history</SectionLabel>
      <Card className="p-4">
        {history(s).map((e, i, arr) => (
          <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
            {i < arr.length - 1 && <div className="absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 bg-plum-100" />}
            <span className={cx('relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-white', e.tone)}><e.icon size={14} /></span>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-ink">{e.t}</div>
              <div className="line-clamp-2 text-[12px] text-slate-500">{e.d}</div>
              <div className="text-[11px] text-slate-400">{e.at.startsWith('2009') ? '2009' : fmtDateTime(e.at)}</div>
            </div>
          </div>
        ))}
      </Card>

      {!readOnly && (
        <Card className="mt-4 flex items-center gap-3 p-4" onClick={() => setTransfer(true)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-plum-50 text-plum-700"><ArrowRightLeft size={19} /></span>
          <div className="flex-1"><div className="text-[14px] font-bold text-plum-900">Selling the house?</div><div className="text-[12px] text-slate-500">Transfer this record to the next owner, with your consent.</div></div>
        </Card>
      )}
      <p className="mt-4 text-center text-[11px] text-slate-400">Representative images, sample codes and sign-offs for the prototype. Not real AP-issued certification.</p>

      <Sheet open={share} onClose={() => setShare(false)} title="Share read-only record">
        <p className="text-[13.5px] text-slate-600">Anyone with the link sees the work history and proof, not your phone or full address. You can revoke it anytime.</p>
        <div className="mt-3 rounded-xl bg-slate-50 p-3 font-mono text-[12px] text-plum-800 break-all">{location.href.split('#')[0]}#/share/record</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(location.href.split('#')[0] + '#/share/record').catch(() => {}); toast('Link copied') }}>Copy link</Button>
          <Button onClick={() => { setShare(false); nav('/share/record') }}>Preview</Button>
        </div>
      </Sheet>
      <Sheet open={transfer} onClose={() => setTransfer(false)} title="Transfer to new owner">
        <ol className="space-y-2 text-[13.5px] text-slate-700">
          <li>1. You invite the buyer by phone number.</li>
          <li>2. Buyer verifies ownership documents with AP.</li>
          <li>3. You approve; the record and remaining work warranty move with the house.</li>
        </ol>
        <p className="mt-3 text-[12px] text-slate-500">Concept flow. Access rules and warranty transfer terms are demo assumptions.</p>
        <Button className="mt-4 w-full" onClick={() => { setTransfer(false); toast('Transfer invite drafted (demo)') }}>Start transfer (demo)</Button>
      </Sheet>
    </div>
  )
}

const Layers2 = () => <Home size={15} />
const HeroStat = ({ v, k }: { v: string; k: string }) => <div className="rounded-xl bg-white/10 py-2"><div className="font-display text-lg font-bold">{v}</div><div className="text-[10.5px] text-white/70">{k}</div></div>

export default function Record() {
  return (<div><ScreenHeader title="My Water Health Record" sub="Complete history. Verified quality. Lasting peace of mind." /><RecordView /></div>)
}

export function SharedRecord() {
  const nav = useNavigate()
  return (<div><ScreenHeader title="Shared Water Health Record" sub="Read-only view" right={<button onClick={() => nav('/record')} className="text-[12.5px] font-semibold text-plum-600">Exit</button>} /><RecordView readOnly /></div>)
}
