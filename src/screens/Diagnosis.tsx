import { AlertTriangle, ArrowRight, Ban, BarChart3, CalendarCheck, CheckCircle2, ChevronDown, Download, FileText, Gauge, Info, Layers, Lightbulb, MapPin, ScanSearch, Settings2, Target, UserRound, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Card, Empty, Footnote, KV, MeasureStrip, ScreenHeader, Sheet, Thumb, cx, useToast } from '../components/ui'
import { CUSTOMER, DATES, JOB, NINETY, PEOPLE, PROPERTY, RETENTION, RULES, fmtDate, fmtDateTime, inr } from '../lib/data'
import { diagnosisPdf } from '../lib/pdf'
import { useStore } from '../lib/store'

export default function Diagnosis() {
  const { s, d } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [reject, setReject] = useState(false)
  const [reason, setReason] = useState('Getting another quote')
  const [booking, setBooking] = useState(false)

  if (s.photoCheck.status === 'none') {
    return (<div><ScreenHeader title="Diagnosis report" /><Empty icon={<ScanSearch />} title="No diagnosis yet" body="Start with a free photo check. An expert decides if a site visit is needed." action={<Button onClick={() => nav('/check')}>Start photo check</Button>} /></div>)
  }
  if (s.photoCheck.status === 'submitted') {
    return (<div><ScreenHeader title="Diagnosis report" /><Empty icon={<ScanSearch />} title="Expert review in progress" body={`Request ${s.photoCheck.requestId}. You'll hear back within 24 hours.`} action={<Button variant="outline" onClick={() => nav('/check/submitted')}>View request</Button>} /></div>)
  }

  const Diagnostician = (
    <Card className="mt-4 p-4">
      <div className="flex items-center gap-3">
        <Avatar name={PEOPLE.diagnostician.name} tone="teal" />
        <div className="flex-1">
          <div className="text-[15px] font-bold text-plum-900">{PEOPLE.diagnostician.name}</div>
          <div className="text-[12.5px] text-slate-500">{PEOPLE.diagnostician.role} · {PEOPLE.diagnostician.id}</div>
        </div>
        <Badge tone="green">Independent</Badge>
      </div>
      <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-800">{PEOPLE.diagnostician.note}</div>
    </Card>
  )

  if (s.diagnosis.status === 'none' || s.diagnosis.status === 'visit_booked') {
    const booked = s.diagnosis.status === 'visit_booked'
    return (
      <div className="pb-6">
        <ScreenHeader title={booked ? 'Diagnosis visit booked' : 'Book a diagnosis visit'} sub={booked ? 'Your expert will explain the cause on site.' : 'Confirm the source before anyone quotes.'} />
        <Card className="border-l-4 border-saffron-500 p-4">
          <div className="text-[12px] font-semibold text-saffron-600">Expert reply to your photos</div>
          <p className="mt-1 text-[13.5px] text-slate-700">{s.photoCheck.expertNote}</p>
        </Card>
        {Diagnostician}
        <Card className="mt-4 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-bold text-plum-900">Site diagnosis visit</div>
            <div className="font-display text-xl font-bold text-plum-900">{inr(RULES.diagnosisFee)}</div>
          </div>
          <ul className="mt-2 space-y-1.5 text-[13px] text-slate-600">
            {['45–60 min on site: terrace, parapet, drains and ceiling below', 'Moisture meter readings; thermal scan if needed', 'Cause explained to you on site; written report follows', 'Fee credited against the job if you go ahead'].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />{x}</li>)}
          </ul>
          {booked ? (
            <div className="mt-4 rounded-xl bg-plum-50 p-3">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-plum-900"><CalendarCheck size={17} /> {fmtDateTime(s.diagnosis.visitAt)}</div>
              <div className="mt-1 flex items-center gap-2 text-[12.5px] text-slate-600"><MapPin size={14} /> {PROPERTY.address}</div>
              <div className="mt-1 text-[12px] text-emerald-700">₹999 paid · credited if you hire</div>
            </div>
          ) : (
            <Button className="mt-4 w-full" disabled={booking} onClick={() => { setBooking(true); setTimeout(() => { d({ type: 'bookVisit' }); setBooking(false); toast('Visit booked for 8 Apr, 11:00 am') }, 700) }}>{booking ? 'Booking…' : <>Pay ₹999 & book visit <ArrowRight size={17} /></>}</Button>
          )}
        </Card>
        {booked && (
          <div className="mt-4 rounded-xl border border-dashed border-plum-200 p-3 text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-plum-500">Demo transition</div>
            <button onClick={() => d({ type: 'completeVisit' })} className="mt-1 text-[13px] font-semibold text-plum-700 hover:underline">Simulate site visit completed → report issued</button>
          </div>
        )}
        {!booked && <Footnote>Not ready? The free photo reply is yours to keep. <button className="font-semibold text-plum-600" onClick={() => nav('/how')}>Guided level</button></Footnote>}
      </div>
    )
  }

  // report ready
  const q = s.quote.status
  return (
    <div className="pb-6">
      <ScreenHeader title="Diagnosis Report" sub={<span className="flex items-center gap-1.5"><UserRound size={14} /> {CUSTOMER.name} · {CUSTOMER.city}</span>} />
      <div className="-mt-2 mb-3 flex flex-wrap gap-2">
        <Badge tone="green"><CheckCircle2 size={13} /> Expert diagnosis ready</Badge>
        <Badge tone="plum">Usable with any contractor</Badge>
      </div>

      <Card className="flex gap-3 p-3">
        <Thumb k={s.photoCheck.photos[0] || 'ceilingDamp'} all={s.photoCheck.photos} className="h-[76px] w-[96px] shrink-0" caption="Customer photo" />
        <div className="py-1">
          <div className="text-[12px] text-slate-500">Main issue</div>
          <div className="text-[15px] font-bold leading-snug text-plum-900">{PROPERTY.issue}</div>
          <div className="mt-0.5 text-[11.5px] text-slate-500">Report {fmtDateTime(s.diagnosis.reportAt)}</div>
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <div className="mb-1 flex items-center gap-2 text-[14px] font-bold text-plum-900"><FileText size={17} className="text-plum-500" /> Diagnosis details</div>
        <KV icon={<Target size={15} />} k="Probable source" v="Parapet joint + drain collar" />
        <KV icon={<Layers size={15} />} k="Surface" v="Terrace · approx. 1,000 sq ft" />
        <KV icon={<Gauge size={15} />} k="Confidence" v={<Badge tone="green">High</Badge>} />
        <KV icon={<Settings2 size={15} />} k="Cause category" v="Waterproofing + detailing" />
        <KV icon={<MapPin size={15} />} k="Affected area" v={PROPERTY.affected} />
        <details className="group mt-2 rounded-xl bg-slate-50 px-3 py-2">
          <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold text-plum-800">Expert findings <ChevronDown size={16} className="transition group-open:rotate-180" /></summary>
          <ul className="mt-2 space-y-1.5 pb-1 text-[12.5px] text-slate-600">
            <li>• Highest moisture readings under the north-east parapet junction and around the drain collar (demo readings).</li>
            <li>• Earlier coating has debonded at the coving; water tracks along the slab edge.</li>
            <li>• No wet zone follows a pipe chase, so plumbing is unlikely.</li>
            <li>• Hairline slab cracks are secondary and are treated in scope.</li>
          </ul>
        </details>
      </Card>

      <Card className="mt-3 bg-gradient-to-br from-plum-50 to-white p-4">
        <div className="flex items-center gap-2 text-[14px] font-bold text-plum-900"><Lightbulb size={17} className="text-saffron-500" /> Recommended solution</div>
        <p className="mt-1 text-[13.5px] text-slate-700">Crack cutting, parapet joint and drain-collar detailing, then the {JOB.system} in two coats.</p>
        <div className="mt-2 text-[12.5px] text-slate-500">Scope: full terrace 1,000 sq ft · 7 documented stages · on-site pre-cover audit and water test</div>
      </Card>

      <Card className="mt-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] font-bold text-plum-900"><Wallet size={17} className="text-plum-500" /> Fixed quote</div>
          <div className="font-display text-[24px] font-bold text-saffron-600">{inr(JOB.value)}</div>
        </div>
        <div className="text-[12px] text-slate-500">{JOB.area.toLocaleString('en-IN')} sq ft × ₹{RULES.pricePerSqFt}/sq ft · Assure level · proposed pilot price</div>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-saffron-50 px-3 py-2 text-[12.5px] text-saffron-700"><Info size={14} /> ₹999 diagnosis fee credited in the final bill</div>
        <button onClick={() => setQuoteOpen(true)} className="mt-2 text-[13px] font-semibold text-plum-600">View itemised quote →</button>
      </Card>

      <Card className="mt-3 border border-red-100 p-4">
        <div className="flex items-center gap-2 text-[14px] font-bold text-red-700"><Ban size={16} /> Exclusions</div>
        <p className="mt-1 text-[13px] text-slate-600">Not covered: plumbing (the pipes themselves), drainage systems, structural issues.</p>
      </Card>

      {Diagnostician}

      <div className="mt-5 space-y-2">
        {q === 'pending' && (<>
          <Button className="w-full" onClick={() => { d({ type: 'acceptQuote' }); toast('Quote accepted'); nav('/booking') }}>Approve quote <ArrowRight size={17} /></Button>
          <Button variant="outline" className="w-full" onClick={() => setReject(true)}>Not now</Button>
        </>)}
        {q === 'accepted' && (<>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-[13.5px] font-semibold text-emerald-700"><CheckCircle2 size={17} /> Quote accepted {fmtDate(s.quote.decidedAt)}</div>
          <Button variant="plum" className="w-full" onClick={() => nav(s.booking.status === 'confirmed' ? '/job' : '/booking')}>{s.booking.status === 'confirmed' ? 'Track job' : 'Proceed to scheduling'} <ArrowRight size={17} /></Button>
        </>)}
        {q === 'rejected' && (<>
          <div className="rounded-xl bg-slate-100 p-3 text-center text-[13px] text-slate-600">You declined this quote ({s.quote.rejectReason}). The report is still yours to use with any contractor.</div>
          <Button variant="outline" className="w-full" onClick={() => d({ type: 'reopenQuote' })}>Reconsider quote</Button>
        </>)}
        <Button variant="ghost" className="w-full" icon={<Download size={17} />} onClick={async () => { await diagnosisPdf(s); toast('Diagnosis report downloaded') }}>Download report (PDF)</Button>
      </div>
      <Footnote>AP action: objective diagnosis with written proof</Footnote>

      <MeasureStrip items={[
        { icon: <UserRound size={18} />, k: 'Customer action', v: 'Review diagnosis & quote' },
        { icon: <Settings2 size={18} />, k: 'AP action', v: 'Independent cause found' },
        { icon: <BarChart3 size={18} />, k: 'Measure moved', v: 'Diagnosis-to-job' },
      ]} />

      <Sheet open={quoteOpen} onClose={() => setQuoteOpen(false)} title="Itemised quote">
        <div className="divide-y divide-slate-100">
          {JOB.quote.map((l) => (
            <div key={l.label} className="flex gap-3 py-3">
              <div className="flex-1"><div className="text-[13.5px] font-medium text-ink">{l.label}</div><div className="text-[12px] text-slate-500">{l.sub}</div></div>
              <div className="text-[14px] font-bold text-plum-900">{inr(l.amount)}</div>
            </div>
          ))}
          <div className="flex justify-between py-3 text-[15px] font-bold text-plum-900"><span>Job value</span><span>{inr(JOB.value)}</span></div>
        </div>
        <div className="mt-1 space-y-2 rounded-xl bg-plum-50 p-3 text-[13px]">
          <Row k="Diagnosis fee already paid" v={'− ' + inr(RULES.diagnosisFee)} />
          <Row k="Due on verified completion (90%)" v={inr(NINETY - RULES.diagnosisFee)} b />
          <Row k="Kept by you until after first monsoon (10%)" v={inr(RETENTION)} b />
        </div>
        <p className="mt-3 text-[12px] text-slate-500">Material is billed by your local AP dealer. Breakdown follows the team's cost model for a 1,000 sq ft terrace (proposed pilot pricing; demo values).</p>
      </Sheet>

      <Sheet open={reject} onClose={() => setReject(false)} title="Not going ahead?">
        <p className="text-[13.5px] text-slate-600">That's fine. Your report stays with you and works with any contractor.</p>
        <div className="mt-3 space-y-2">
          {['Getting another quote', 'Price is higher than expected', 'Doing it later', 'Other'].map((r) => (
            <button key={r} onClick={() => setReason(r)} className={cx('w-full rounded-xl border px-3 py-2.5 text-left text-[13.5px]', reason === r ? 'border-saffron-500 bg-saffron-50 text-saffron-700' : 'border-slate-200')}>{r}</button>
          ))}
        </div>
        <Button variant="plum" className="mt-4 w-full" onClick={() => { d({ type: 'rejectQuote', reason }); setReject(false); toast('Quote declined. Report saved to your record.') }}>Decline quote</Button>
        <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-500"><AlertTriangle size={14} /> You can reopen this quote later.</div>
      </Sheet>
    </div>
  )
}

const Row = ({ k, v, b }: { k: string; v: string; b?: boolean }) => <div className="flex justify-between gap-3"><span className="text-slate-600">{k}</span><span className={b ? 'font-bold text-plum-900' : 'text-slate-700'}>{v}</span></div>
