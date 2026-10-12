import { ArrowRight, Award, CalendarDays, CheckCircle2, ClipboardCheck, GraduationCap, Package, ShieldCheck, Store } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Card, Empty, KV, ScreenHeader, SectionLabel, Sheet, useToast } from '../components/ui'
import { DATES, JOB, PEOPLE, RULES, fmtDate, inr } from '../lib/data'
import { useStore } from '../lib/store'

const SCHEDULE = [
  { d: '19 Apr', t: 'Stages 1–2', b: 'Clean, crack cutting' },
  { d: '20 Apr', t: 'Stage 3', b: 'Slope & drain detailing' },
  { d: '21–22 Apr', t: 'Stages 4–5', b: 'Mixing, two coats, thickness' },
  { d: '23 Apr', t: 'Stage 6', b: 'Pre-cover audit (on site)' },
  { d: '23–24 Apr', t: 'Stage 7', b: 'Water test (on site)' },
]

export default function Booking() {
  const { s, d } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const [prof, setProf] = useState(false)
  const a = PEOPLE.applicator

  if (s.quote.status !== 'accepted') {
    return (<div><ScreenHeader title="Job booking" /><Empty icon={<CalendarDays />} title="Nothing to schedule yet" body="Approve your diagnosis quote to see the assigned applicator and dates." action={<Button onClick={() => nav('/diagnosis')}>Go to diagnosis</Button>} /></div>)
  }
  const confirmed = s.booking.status === 'confirmed'

  return (
    <div className="pb-6">
      <ScreenHeader title={confirmed ? 'Job confirmed' : 'Confirm your job'} sub={`Job ${JOB.id} · Assure level`} />

      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[12px] text-slate-500">Selected solution</div>
            <div className="text-[15.5px] font-bold text-plum-900">{JOB.system}</div>
          </div>
          <Badge tone={confirmed ? 'green' : 'orange'}>{confirmed ? 'Confirmed' : 'Awaiting you'}</Badge>
        </div>
        <div className="mt-2 divide-y divide-slate-100">
          <KV k="Job area" v="Terrace · 1,000 sq ft" />
          <KV k="Job value" v={inr(JOB.value)} strong />
          <KV k="Proposed dates" v={`${fmtDate(DATES.jobStart)} – ${fmtDate(DATES.jobEnd)}`} />
          <KV k="Start window" v={`Within ${RULES.applicatorStartDays} days of booking, even in monsoon`} />
        </div>
      </Card>

      <SectionLabel>Your certified applicator</SectionLabel>
      <Card className="p-4" onClick={() => setProf(true)}>
        <div className="flex items-center gap-3">
          <Avatar name={a.name} size={54} tone="orange" />
          <div className="flex-1">
            <div className="text-[16px] font-bold text-plum-900">{a.name}</div>
            <div className="text-[12.5px] text-slate-500">{a.firm}</div>
            <div className="mt-1 flex gap-1.5"><Badge tone="orange"><Award size={12} /> {a.level}</Badge><Badge tone="plum">{a.surface}</Badge></div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat v={String(a.jobs)} k="Jobs done" /><Stat v={String(a.audited)} k="Audited" /><Stat v="2.6%" k="Repeat leaks" />
        </div>
        <div className="mt-2 text-center text-[12px] font-semibold text-plum-600">View full profile →</div>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card className="p-3.5">
          <ClipboardCheck className="text-plum-600" size={20} />
          <div className="mt-1.5 text-[12px] text-slate-500">Quality auditor</div>
          <div className="text-[13.5px] font-bold text-plum-900">{PEOPLE.auditor.name}</div>
          <div className="text-[11.5px] text-slate-500">{PEOPLE.auditor.note}</div>
        </Card>
        <Card className="p-3.5">
          <Store className="text-saffron-600" size={20} />
          <div className="mt-1.5 text-[12px] text-slate-500">Material from</div>
          <div className="text-[13.5px] font-bold text-plum-900">{PEOPLE.dealer.name}</div>
          <div className="text-[11.5px] text-slate-500">{PEOPLE.dealer.area}</div>
        </Card>
      </div>

      <SectionLabel>Proposed schedule</SectionLabel>
      <Card className="p-4">
        {SCHEDULE.map((x, i) => (
          <div key={i} className="flex gap-3 py-1.5">
            <div className="w-[68px] shrink-0 text-[12.5px] font-bold text-saffron-600">{x.d}</div>
            <div><div className="text-[13.5px] font-semibold text-ink">{x.t}</div><div className="text-[12px] text-slate-500">{x.b}</div></div>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-plum-50 px-3 py-2 text-[12px] text-plum-800"><Package size={14} /> AP products are scanned at the dealer counter before use.</div>
      </Card>

      {confirmed ? (
        <>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-[13.5px] font-semibold text-emerald-700"><CheckCircle2 size={17} /> Schedule confirmed</div>
          <Button variant="plum" className="mt-2 w-full" onClick={() => nav('/job')}>Track job progress <ArrowRight size={17} /></Button>
        </>
      ) : (
        <Button className="mt-5 w-full" onClick={() => { d({ type: 'confirmBooking' }); toast('Job confirmed. Applicator notified.'); nav('/job') }}>Confirm schedule <ArrowRight size={17} /></Button>
      )}

      <Sheet open={prof} onClose={() => setProf(false)} title="Applicator profile">
        <div className="flex items-center gap-3">
          <Avatar name={a.name} size={64} tone="orange" />
          <div><div className="text-lg font-bold text-plum-900">{a.name}</div><div className="text-[13px] text-slate-500">{a.firm} · {a.id}</div></div>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          <KV icon={<Award size={15} />} k="Certification" v={`${a.level}, ${a.surface} (since ${a.since})`} />
          <KV icon={<GraduationCap size={15} />} k="Training" v={a.training} />
          <KV icon={<ShieldCheck size={15} />} k="Quality record" v={`Repeat leaks: ${a.repeat}`} />
          <KV icon={<ClipboardCheck size={15} />} k="Audited jobs" v={`${a.audited} passed`} />
        </div>
        <div className="mt-3 rounded-xl bg-plum-50 p-3 text-[12.5px] text-plum-800"><b>Certification ladder:</b> Trained (5-day module) → Certified (3 audited jobs pass) → Master (&lt;3% repeats, gets leads first, trains others). High repeats trigger review; workmanship faults lead to suspension and retraining.</div>
        <p className="mt-2 text-[11.5px] text-slate-500">Representative profile and figures for the demo.</p>
      </Sheet>
    </div>
  )
}

const Stat = ({ v, k }: { v: string; k: string }) => <div className="rounded-xl bg-slate-50 py-2"><div className="text-[16px] font-bold text-plum-900">{v}</div><div className="text-[11px] text-slate-500">{k}</div></div>
