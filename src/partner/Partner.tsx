import { ArrowLeft, Award, Bot, Camera, Check, ClipboardCheck, IndianRupee, MapPin, Package, ScanLine, Store, Upload, UserCheck, Wrench, X } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Card, Empty, Progress, SectionLabel, StageBadge, Thumb, cx, useToast } from '../components/ui'
import { APPLICATOR_TRANCHES, JOB, LABOUR, PEOPLE, PROPERTY, fmtDate, fmtDateTime, inr } from '../lib/data'
import { compressImage } from '../lib/photos'
import { activeStage, approvedCount, useStore } from '../lib/store'
import type { Role } from '../lib/types'

function PartnerShell({ role, title, who, children }: { role: Role; title: string; who: ReactNode; children: ReactNode }) {
  const { d } = useStore()
  const nav = useNavigate()
  const tint = { applicator: 'from-saffron-600 to-saffron-500', auditor: 'from-emerald-700 to-emerald-600', dealer: 'from-sky-700 to-sky-600', homeowner: '', ap: '' }[role]
  return (
    <div className="pb-8">
      <div className={cx('-mx-4 -mt-1 mb-4 bg-gradient-to-br px-4 pb-5 pt-4 text-white', tint)}>
        <div className="flex items-center justify-between">
          <button onClick={() => { d({ type: 'role', role: 'homeowner' }); nav('/') }} className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold"><ArrowLeft size={14} /> Homeowner app</button>
          <span className="rounded-full bg-black/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">Partner view · demo</span>
        </div>
        <div className="mt-4 font-display text-[22px] font-bold">{title}</div>
        <div className="mt-1 text-[13px] text-white/85">{who}</div>
      </div>
      {children}
    </div>
  )
}

/* ---------------- Applicator ---------------- */
export function ApplicatorView() {
  const { s, d } = useStore()
  const toast = useToast()
  const inp = useRef<HTMLInputElement>(null)
  const [up, setUp] = useState<string[]>([])
  const a = PEOPLE.applicator
  const cur = activeStage(s)
  const earned = s.applicatorPay.reduce((x, p) => x + p.amount, 0)
  const checklist: Record<string, string[]> = {
    clean: ['Remove loose screed & moss', 'Pressure wash', 'Surface dry before next stage'],
    cracks: ['V-cut all cracks > 0.5 mm', 'Open parapet joint', 'Fill with system filler'],
    slope: ['Rebuild drain collar', 'Coving at parapet', 'Level check to outlet'],
    mix: ['Photograph batch label', 'Mix per data sheet', 'Scan product at counter'],
    thick: ['Two coats, cross-wise', 'Gauge at 5 points', 'Log readings'],
    precover: ['Request auditor visit', 'Cure membrane', 'Do not cover before sign-off'],
    water: ['Pond at 50 mm for 48 hrs', 'Ceiling photo at start & end', 'Auditor on site'],
  }

  return (
    <PartnerShell role="applicator" title="Applicator app" who={<>{a.name} · {a.firm}</>}>
      <Card className="flex items-center gap-3 p-4">
        <Avatar name={a.name} tone="orange" size={50} />
        <div className="flex-1"><div className="font-bold text-plum-900">{a.name}</div><div className="flex gap-1.5"><Badge tone="orange"><Award size={11} /> {a.level}</Badge><Badge tone="plum">{a.surface}</Badge></div></div>
        <div className="text-right"><div className="text-[11px] text-slate-500">Repeat leaks</div><div className="font-bold text-emerald-700">2.6%</div></div>
      </Card>

      <SectionLabel>Assigned jobs</SectionLabel>
      {s.booking.status !== 'confirmed' ? (
        <Empty icon={<Wrench />} title="No jobs assigned" body="Leads arrive once a homeowner confirms a schedule. Top applicators by repeat-leak rate get offered leads first." />
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between"><div className="font-bold text-plum-900">{JOB.id} · Terrace 1,000 sq ft</div><Badge tone="blue">{approvedCount(s)}/7</Badge></div>
          <div className="mt-1 flex items-center gap-1 text-[12.5px] text-slate-500"><MapPin size={13} /> {PROPERTY.address}</div>
          <Progress value={(approvedCount(s) / 7) * 100} className="mt-3" />

          {cur ? (
            <div className="mt-4 rounded-xl bg-saffron-50/70 p-3">
              <div className="flex items-center justify-between"><div className="text-[14px] font-bold text-plum-900">Stage {cur.n}: {cur.title}</div><StageBadge s={cur.status} /></div>
              <ul className="mt-2 space-y-1">
                {checklist[cur.key].map((c) => <li key={c} className="flex items-center gap-2 text-[12.5px] text-slate-700"><span className={cx('grid h-4 w-4 place-items-center rounded border', cur.status !== 'pending' ? 'border-saffron-500 bg-saffron-500 text-white' : 'border-slate-300')}>{cur.status !== 'pending' && <Check size={11} />}</span>{c}</li>)}
              </ul>
              {cur.status === 'rework' && <div className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-[12px] text-red-700"><b>Auditor feedback:</b> {cur.audits[cur.audits.length - 1]?.note}</div>}
              <input ref={inp} type="file" accept="image/*" multiple className="hidden" onChange={async (e) => { const o: string[] = []; for (const f of Array.from(e.target.files || [])) { try { o.push(await compressImage(f)) } catch { /* skip */ } } setUp((u) => [...u, ...o]); e.target.value = '' }} />
              {(cur.status === 'in_progress' || cur.status === 'rework') && (
                <>
                  {up.length > 0 && <div className="mt-2 flex gap-2">{up.map((p, i) => <Thumb key={i} k={p} all={up} i={i} className="h-14 w-16" />)}</div>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="outline" className="py-2.5 text-[13px]" icon={<Camera size={15} />} onClick={() => inp.current?.click()}>Add photos</Button>
                    <Button className="py-2.5 text-[13px]" icon={<Upload size={15} />} onClick={() => { d({ type: 'stageSubmit', n: cur.n, photos: up.length ? up : undefined }); setUp([]); toast(up.length ? 'Your photos submitted' : 'Sample stage photos submitted') }}>Submit stage</Button>
                  </div>
                  <div className="mt-1.5 text-center text-[11px] text-slate-500">No photos added? Sample site photos are used for the demo.</div>
                </>
              )}
              {cur.status === 'pending' && <Button className="mt-3 w-full py-2.5 text-[13px]" onClick={() => d({ type: 'stageStart', n: cur.n })}>Start stage {cur.n}</Button>}
              {cur.status === 'submitted' && <div className="mt-3 rounded-lg bg-white px-3 py-2 text-center text-[12.5px] text-slate-600">Waiting for {cur.onsite ? 'on-site audit' : 'auditor review'}</div>}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-[13px] font-semibold text-emerald-700">All stages approved. Job complete.</div>
          )}
        </Card>
      )}

      <SectionLabel>Stage-wise payment from AP</SectionLabel>
      <Card className="p-4">
        <div className="flex items-end justify-between"><div><div className="text-[12px] text-slate-500">Paid so far</div><div className="font-display text-2xl font-bold text-plum-900">{inr(earned)}</div></div><div className="text-right text-[12px] text-slate-500">of {inr(LABOUR)} labour</div></div>
        <div className="mt-3 space-y-2">
          {APPLICATOR_TRANCHES.map((t) => {
            const p = s.applicatorPay.find((x) => x.tranche === t.tranche)
            return (
              <div key={t.tranche} className="flex items-center gap-2.5 text-[13px]">
                <span className={cx('grid h-6 w-6 place-items-center rounded-full', p ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400')}><IndianRupee size={12} /></span>
                <div className="flex-1"><div className="font-medium text-ink">{t.pct}% · {t.label}</div><div className="text-[11.5px] text-slate-500">{p ? `Paid ${fmtDate(p.paidAt)}` : 'After auditor approval'}</div></div>
                <b className={p ? 'text-emerald-700' : 'text-slate-400'}>{inr(Math.round((LABOUR * t.pct) / 100))}</b>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[11.5px] text-slate-500">Paid by AP at verified stages, independent of the homeowner's 10% retention. Split is a demo assumption.</p>
      </Card>

      <SectionLabel>Audit feedback</SectionLabel>
      <Card className="divide-y divide-slate-100 px-4">
        {s.stages.flatMap((st) => st.audits.map((a, i) => ({ st, a, i }))).reverse().slice(0, 5).map(({ st, a, i }) => (
          <div key={st.n + '-' + i} className="py-2.5"><div className="flex items-center justify-between text-[13px] font-semibold"><span>Stage {st.n}</span><Badge tone={a.decision === 'approved' ? 'green' : 'red'}>{a.decision === 'approved' ? 'Approved' : 'Rework'}</Badge></div><div className="text-[12px] text-slate-600">{a.note}</div></div>
        ))}
        {!s.stages.some((x) => x.audits.length) && <div className="py-4 text-center text-[12.5px] text-slate-500">No audits yet.</div>}
      </Card>
    </PartnerShell>
  )
}

/* ---------------- Auditor ---------------- */
export function AuditorView() {
  const { s, d } = useStore()
  const toast = useToast()
  const [note, setNote] = useState('')
  const queue = s.stages.filter((x) => x.status === 'submitted')
  const decided = s.stages.flatMap((st) => st.audits.map((a) => ({ st, a }))).reverse()

  return (
    <PartnerShell role="auditor" title="Auditor console" who={<>{PEOPLE.auditor.name} · {PEOPLE.auditor.id} · reports to AP Quality</>}>
      <div className="grid grid-cols-3 gap-2">
        <Mini v={queue.length} k="Pending" /><Mini v={decided.filter((x) => x.a.decision === 'approved').length} k="Approved" /><Mini v={decided.filter((x) => x.a.decision === 'rework').length} k="Rework" />
      </div>

      <SectionLabel>Pending inspection queue</SectionLabel>
      {queue.length === 0 ? (
        <Empty icon={<ClipboardCheck />} title="Queue clear" body={s.booking.status === 'confirmed' ? 'Nothing submitted right now. New stage uploads appear here.' : 'No active jobs yet.'} />
      ) : queue.map((st) => (
        <Card key={st.n} className="mb-3 p-4">
          <div className="flex items-center justify-between">
            <div><div className="text-[14.5px] font-bold text-plum-900">{JOB.id} · Stage {st.n}</div><div className="text-[12.5px] text-slate-500">{st.title}</div></div>
            {st.onsite ? <Badge tone="plum"><MapPin size={11} /> On-site required</Badge> : <Badge tone="gray">Photo review</Badge>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">{st.photos.map((p, i) => <Thumb key={i} k={p} all={st.photos} i={i} className="aspect-[4/3]" />)}</div>
          {st.aiCheck && <div className="mt-2 flex gap-2 rounded-lg bg-sky-50 px-2.5 py-2 text-[12px] text-sky-800"><Bot size={15} className="shrink-0" /><span><b>Pre-screen ({st.aiCheck.result}):</b> {st.aiCheck.note} Final decision is yours.</span></div>}
          <div className="mt-2 text-[12px] text-slate-600"><b>Applicator note:</b> {st.applicatorNote}</div>
          {st.onsite && (
            <label className="mt-3 flex items-center gap-2 rounded-lg bg-plum-50 px-3 py-2 text-[12.5px] text-plum-800"><MapPin size={14} /> Checked in at site · {fmtDateTime(st.submittedAt)} (demo geotag)</label>
          )}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Audit note (optional)" className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px]" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="danger" className="py-2.5 text-[13px]" icon={<X size={15} />} onClick={() => { d({ type: 'stageAudit', n: st.n, decision: 'rework', note: note || undefined }); setNote(''); toast(`Rework requested on stage ${st.n}`) }}>Request rework</Button>
            <Button className="!bg-emerald-600 py-2.5 text-[13px]" icon={<UserCheck size={15} />} onClick={() => { d({ type: 'stageAudit', n: st.n, decision: 'approved', note: note || undefined }); setNote(''); toast(`Stage ${st.n} approved`) }}>Approve</Button>
          </div>
        </Card>
      ))}

      <SectionLabel>Recorded decisions</SectionLabel>
      <Card className="divide-y divide-slate-100 px-4">
        {decided.length === 0 && <div className="py-4 text-center text-[12.5px] text-slate-500">No decisions yet.</div>}
        {decided.map(({ st, a }, i) => (
          <div key={i} className="py-2.5">
            <div className="flex items-center justify-between text-[13px] font-semibold"><span>Stage {st.n} · {st.short}</span><Badge tone={a.decision === 'approved' ? 'green' : 'red'}>{a.mode === 'onsite' ? 'On-site · ' : ''}{a.decision}</Badge></div>
            <div className="text-[12px] text-slate-600">{a.note}</div><div className="text-[11px] text-slate-400">{fmtDateTime(a.at)}</div>
          </div>
        ))}
      </Card>
    </PartnerShell>
  )
}

/* ---------------- Dealer ---------------- */
export function DealerView() {
  const { s, d } = useStore()
  const toast = useToast()
  const dl = PEOPLE.dealer
  const material = JOB.quote[1].amount
  const margin = 4050
  const hasJob = s.quote.status === 'accepted'
  const leads = [
    { id: JOB.requestId, who: 'Jayadevi S. · BTM 2nd Stage', st: s.quote.status === 'accepted' ? ['green', 'Converted'] : s.diagnosis.status !== 'none' ? ['blue', 'Diagnosis'] : s.photoCheck.status !== 'none' ? ['orange', 'Photo check'] : ['gray', 'Not yet'] },
    { id: 'PC-270402-087', who: 'R. Prakash · Jayanagar', st: ['blue', 'Diagnosis'] },
    { id: 'PC-270329-061', who: 'M. Fernandes · Koramangala', st: ['gray', 'Guided advice'] },
  ] as const

  return (
    <PartnerShell role="dealer" title="Dealer counter" who={<>{dl.name} · {dl.code}</>}>
      <div className="grid grid-cols-3 gap-2">
        <Mini v={3} k="Leads (Apr)" /><Mini v={hasJob ? 1 : 0} k="Converted" /><Mini v={hasJob ? inr(margin) : '₹0'} k="Margin" />
      </div>

      <SectionLabel>Referred leads</SectionLabel>
      <Card className="divide-y divide-slate-100 px-4">
        {leads.map((l) => (
          <div key={l.id} className="flex items-center justify-between py-3">
            <div><div className="text-[13.5px] font-semibold text-ink">{l.id}</div><div className="text-[12px] text-slate-500">{l.who}</div></div>
            <Badge tone={l.st[0] as any}>{l.st[1]}</Badge>
          </div>
        ))}
      </Card>
      <p className="mt-1 text-[11.5px] text-slate-500">Two leads besides Jayadevi are sample rows.</p>

      <SectionLabel>Job-linked material order</SectionLabel>
      {!hasJob ? (
        <Empty icon={<Package />} title="No orders yet" body="When a homeowner accepts a quote, stock is allocated and billed at your counter." />
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between"><div className="font-bold text-plum-900">{JOB.id}</div><Badge tone={s.productsScanned ? 'green' : 'orange'}>{s.productsScanned ? 'Scanned & billed' : 'Allocated'}</Badge></div>
          <div className="mt-2 space-y-1.5 text-[13px]">
            <Row k={JOB.system} v="Terrace kit · 1,000 sq ft" />
            <Row k="Batch" v={JOB.batch} />
            <Row k="Billed at your counter" v={inr(material)} />
            <Row k="Your margin (≈10%)" v={inr(margin)} b />
          </div>
          {!s.productsScanned ? (
            <Button className="mt-3 w-full" icon={<ScanLine size={16} />} onClick={() => { d({ type: 'scanProducts' }); toast('Products scanned. Warranty condition met.') }}>Scan products at counter</Button>
          ) : <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2 text-[12.5px] font-semibold text-emerald-700"><Check size={15} /> Scanned: links batch to the warranty</div>}
        </Card>
      )}

      <SectionLabel>Earnings summary</SectionLabel>
      <Card className="p-4">
        <Row k="Material margin (this job)" v={hasJob ? inr(margin) : '₹0'} />
        <Row k="Paid" v={s.productsScanned ? 'At billing, at your counter' : '—'} />
        <p className="mt-2 text-[11.5px] text-slate-500">Material always flows company → dealer → applicator. The dealer is never bypassed.</p>
      </Card>
      <Card className="mt-3 flex items-center gap-3 bg-sky-50/60 p-3.5"><Store className="text-sky-700" size={20} /><div className="text-[12.5px] text-sky-900">Offer the free damp check to walk-ins. Leads you refer are tracked to your code.</div></Card>
    </PartnerShell>
  )
}

const Mini = ({ v, k }: { v: ReactNode; k: string }) => <Card className="p-3 text-center"><div className="font-display text-lg font-bold text-plum-900">{v}</div><div className="text-[11px] text-slate-500">{k}</div></Card>
const Row = ({ k, v, b }: { k: string; v: string; b?: boolean }) => <div className="flex justify-between gap-3 py-0.5 text-[13px]"><span className="text-slate-500">{k}</span><span className={b ? 'font-bold text-emerald-700' : 'font-medium text-ink'}>{v}</span></div>
