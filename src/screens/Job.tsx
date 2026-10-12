import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BarChart3, Bot, Camera, Check, ChevronDown, ClipboardCheck, FastForward, Hammer, MapPin, ShieldCheck, UserCheck, UserRound, Wrench, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Empty, Footnote, MeasureStrip, ScreenHeader, Segments, StageBadge, Thumb, cx, useToast } from '../components/ui'
import { JOB, PEOPLE, fmtDate, fmtDateTime } from '../lib/data'
import { activeStage, allApproved, approvedCount, useStore } from '../lib/store'
import type { Stage } from '../lib/types'

export default function Job() {
  const { s, d } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const cur = activeStage(s)
  const [open, setOpen] = useState<number | null>(null)
  const openN = open ?? cur?.n ?? 7

  if (s.booking.status !== 'confirmed') {
    return (<div><ScreenHeader title="Job progress" /><Empty icon={<Hammer />} title="No active job" body="Once you approve a quote and confirm the schedule, every stage shows up here with photos." action={<Button onClick={() => nav(s.quote.status === 'accepted' ? '/booking' : '/diagnosis')}>{s.quote.status === 'accepted' ? 'Confirm schedule' : 'View diagnosis'}</Button>} /></div>)
  }
  const done = approvedCount(s)

  return (
    <div className="pb-6">
      <ScreenHeader title="Job Progress" sub={`Stage photo tracker · Job ${JOB.id}`} />
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-[14px] font-bold text-plum-900">{done} of 7 stages completed</div>
          {done === 7 ? <Badge tone="green">Verified complete</Badge> : <Badge tone="blue">On site</Badge>}
        </div>
        <div className="mt-2"><Segments total={7} done={done} /></div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11.5px] text-slate-500">
          <span className="flex items-center gap-1"><Camera size={13} className="text-saffron-500" /> Applicator evidence</span>
          <span className="flex items-center gap-1"><Bot size={13} className="text-sky-600" /> Automated pre-screen</span>
          <span className="flex items-center gap-1"><UserCheck size={13} className="text-emerald-600" /> Human auditor</span>
        </div>
      </Card>

      <div className="relative mt-4">
        {s.stages.map((st, i) => (
          <StageRow key={st.n} st={st} last={i === 6} open={openN === st.n} onToggle={() => setOpen(openN === st.n ? 0 : st.n)} />
        ))}
      </div>

      <Card className="mt-2 flex items-center gap-3 p-3.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-plum-50 text-plum-700"><ShieldCheck size={20} /></span>
        <div className="flex-1"><div className="text-[13.5px] font-bold text-plum-900">Applicator: certified for terrace systems</div><div className="text-[12px] text-slate-500">{PEOPLE.applicator.name} · trained & approved</div></div>
        <button onClick={() => nav('/booking')} className="text-plum-500"><ArrowRight size={18} /></button>
      </Card>

      <AnimatePresence>
        {allApproved(s) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mt-4 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
                <div className="flex items-center gap-2 font-display text-lg font-bold"><Check /> Work verified complete</div>
                <div className="text-[13px] text-white/85">All 7 stages approved; both on-site audits signed by {PEOPLE.auditor.name}.</div>
              </div>
              <div className="p-4">
                <Button className="w-full" onClick={() => nav('/warranty')}>{s.warranty.active ? 'View warranty' : 'Pay 90% & activate warranty'} <ArrowRight size={17} /></Button>
                <Button variant="ghost" className="mt-1 w-full" onClick={() => nav('/record')}>View full job record</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!allApproved(s) && (
        <Card className="mt-4 p-4">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">Completion rule</div>
          <p className="mt-1 text-[13px] text-slate-600">The job can't be marked complete until the <b>pre-cover audit</b> and <b>water test</b> are approved on site by the AP auditor.</p>
        </Card>
      )}

      <Footnote>AP action: stage-wise proof and independent checks</Footnote>

      {!allApproved(s) && cur && (
        <div className="mt-4 rounded-2xl border border-dashed border-plum-200 bg-white/60 p-3">
          <div className="text-center text-[11px] font-bold uppercase tracking-wider text-plum-500">Presenter controls (demo)</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="soft" className="py-2.5 text-[13px]" icon={<FastForward size={15} />} onClick={() => { d({ type: 'advance' }); setOpen(null) }}>
              {cur.status === 'pending' ? `Start stage ${cur.n}` : cur.status === 'submitted' ? 'Auditor approves' : 'Upload photos'}
            </Button>
            <Button variant="danger" className="py-2.5 text-[13px]" icon={<X size={15} />} disabled={cur.status !== 'submitted'} onClick={() => { d({ type: 'stageAudit', n: cur.n, decision: 'rework' }); toast(`Stage ${cur.n}: rework requested`) }}>Request rework</Button>
          </div>
          <button onClick={() => nav('/partner/auditor')} className="mt-2 w-full text-center text-[12px] font-semibold text-plum-600">Open auditor view →</button>
        </div>
      )}

      <MeasureStrip items={[
        { icon: <UserRound size={18} />, k: 'Customer action', v: 'Track work progress' },
        { icon: <ClipboardCheck size={18} />, k: 'AP action', v: '7 photo stages + 2 site audits' },
        { icon: <BarChart3 size={18} />, k: 'Measure moved', v: 'Right-first-time' },
      ]} />
    </div>
  )
}

function StageRow({ st, last, open, onToggle }: { st: Stage; last: boolean; open: boolean; onToggle: () => void }) {
  const done = st.status === 'approved'
  const lastAudit = st.audits[st.audits.length - 1]
  return (
    <div className="relative flex gap-3 pb-3">
      <div className="flex flex-col items-center">
        <div className={cx('z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[12px] font-bold transition',
          done ? 'border-saffron-500 bg-saffron-500 text-white' : st.status === 'pending' ? 'border-slate-300 bg-white text-slate-400' : st.status === 'rework' ? 'border-red-500 bg-red-50 text-red-600' : 'border-saffron-500 bg-white text-saffron-600')}>
          {done ? <Check size={16} strokeWidth={3} /> : st.n}
        </div>
        {!last && <div className={cx('w-0.5 flex-1', done ? 'bg-saffron-400' : 'border-l-2 border-dashed border-slate-300 bg-transparent')} />}
      </div>
      <Card className="mb-1 min-w-0 flex-1">
        <button onClick={onToggle} className="flex w-full items-center gap-2 p-3 text-left">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[14.5px] font-bold text-plum-900">{st.n}. {st.short}</span>
              {st.onsite && <Badge tone="plum" className="!px-1.5"><MapPin size={11} /> On-site</Badge>}
            </div>
            <div className="mt-1"><StageBadge s={st.status} /></div>
            <div className="mt-0.5 text-[11.5px] text-slate-500">
              {done ? `Completed · ${fmtDate(st.approvedAt)}` : st.status === 'submitted' ? `Awaiting ${st.onsite ? 'on-site audit' : 'auditor review'}` : st.status === 'in_progress' ? `Started ${fmtDateTime(st.startedAt)}` : st.status === 'rework' ? 'Applicator redoing this stage' : st.n === 6 ? 'Auditor visit booked for pre-cover' : 'Upcoming'}
            </div>
          </div>
          {st.photos.length > 0 && !open && (
            <div className="flex -space-x-3">{st.photos.slice(0, 2).map((p) => <Thumb key={p} k={p} all={st.photos} className="h-10 w-12 ring-2 ring-white" />)}</div>
          )}
          <ChevronDown size={16} className={cx('shrink-0 text-slate-400 transition', open && 'rotate-180')} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-2.5 border-t border-slate-100 p-3">
                <div className="text-[13px] font-semibold text-ink">{st.title}</div>
                {st.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">{st.photos.map((p, i) => <Thumb key={p} k={p} all={st.photos} i={i} className="aspect-[4/3]" caption={`Stage ${st.n}: ${st.title} · uploaded ${fmtDateTime(st.submittedAt)}`} />)}</div>
                ) : (
                  <div className="rounded-xl bg-slate-50 py-4 text-center text-[12.5px] text-slate-500">Photos appear here when the applicator uploads them.</div>
                )}
                {st.status !== 'pending' && (
                  <Layer icon={<Camera size={14} />} tone="orange" title="Applicator evidence" by={`${PEOPLE.applicator.name}${st.submittedAt ? ' · ' + fmtDateTime(st.submittedAt) : ''}`}>
                    {st.applicatorNote}{st.reading && <div className="mt-1 font-semibold text-plum-800">{st.reading}</div>}
                  </Layer>
                )}
                {st.aiCheck && (
                  <Layer icon={<Bot size={14} />} tone="sky" title={`Automated pre-screen: ${st.aiCheck.result === 'clear' ? 'photos complete' : 'flagged'}`} by="Checks photo completeness only · does not approve work">
                    {st.aiCheck.note}
                  </Layer>
                )}
                {st.audits.map((a, i) => (
                  <Layer key={i} icon={a.decision === 'approved' ? <UserCheck size={14} /> : <Wrench size={14} />} tone={a.decision === 'approved' ? 'green' : 'red'} title={`${a.mode === 'onsite' ? 'On-site audit' : 'Auditor review'}: ${a.decision === 'approved' ? 'approved' : 'rework required'}`} by={`${a.by}, AP Quality · ${fmtDateTime(a.at)}`}>
                    {a.note}
                  </Layer>
                ))}
                {!lastAudit && st.onsite && st.status !== 'approved' && (
                  <div className="rounded-xl bg-plum-50 px-3 py-2 text-[12px] text-plum-800">Mandatory: an AP auditor must inspect this stage in person before work continues.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}

function Layer({ icon, tone, title, by, children }: { icon: React.ReactNode; tone: 'orange' | 'sky' | 'green' | 'red'; title: string; by: string; children: React.ReactNode }) {
  const t = { orange: 'border-saffron-300 bg-saffron-50/60 text-saffron-700', sky: 'border-sky-300 bg-sky-50/70 text-sky-700', green: 'border-emerald-300 bg-emerald-50/70 text-emerald-700', red: 'border-red-300 bg-red-50/70 text-red-700' }[tone]
  return (
    <div className={cx('rounded-xl border-l-[3px] px-3 py-2', t)}>
      <div className="flex items-center gap-1.5 text-[12.5px] font-bold">{icon}{title}</div>
      <div className="mt-0.5 text-[12.5px] text-slate-700">{children}</div>
      <div className="mt-1 text-[11px] text-slate-500">{by}</div>
    </div>
  )
}
