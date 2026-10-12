import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Check, CheckCircle2, FileSearch, FileWarning, FolderOpen, Gavel, Plus, Search, Sparkles, Wrench, X, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Empty, ScreenHeader, Thumb, cx, useToast } from '../components/ui'
import { JOB, PEOPLE, fmtDate, fmtDateTime } from '../lib/data'
import { compressImage } from '../lib/photos'
import { openClaim, useStore } from '../lib/store'
import type { Claim } from '../lib/types'

const STEPS = [
  { t: 'Raise claim', i: FileWarning },
  { t: 'Record fetched', i: FolderOpen },
  { t: 'Inspection', i: Search },
  { t: 'Decision', i: Gavel },
  { t: 'Resolution', i: Wrench },
]

export function claimTone(c: Claim) {
  if (c.closedAt) return c.outcome === 'eligible' ? { tone: 'green' as const, t: 'Rectified & closed' } : { tone: 'gray' as const, t: 'Closed · not covered' }
  if (c.outcome === 'eligible') return { tone: 'orange' as const, t: 'Covered · rectifying' }
  if (c.outcome === 'excluded') return { tone: 'red' as const, t: 'Not covered' }
  return { tone: 'blue' as const, t: 'Under inspection' }
}

export function ClaimsList() {
  const { s } = useStore()
  const nav = useNavigate()
  return (
    <div className="pb-6">
      <ScreenHeader title="Warranty claims" sub="Same record. Clear process. Fair resolution." />
      {!s.warranty.active ? (
        <Empty icon={<FileWarning />} title="No active warranty yet" body="Claims open once your work warranty is active after verified completion." action={<Button variant="outline" onClick={() => nav('/warranty')}>View warranty status</Button>} />
      ) : (
        <>
          <Button className="w-full" icon={<Plus size={18} />} disabled={!!openClaim(s)} onClick={() => nav('/claims/new')}>Raise a new claim</Button>
          {openClaim(s) && <div className="mt-2 text-center text-[12px] text-slate-500">One claim is open. Raise another once it closes.</div>}
          <div className="mt-4 space-y-3">
            {s.claims.length === 0 && <Empty icon={<CheckCircle2 />} title="No claims" body="Your terrace has had no warranty claims." />}
            {s.claims.map((c) => {
              const t = claimTone(c)
              return (
                <Card key={c.id} className="p-4" onClick={() => nav(`/claims/${c.id}`)}>
                  <div className="flex items-center justify-between"><div className="text-[15px] font-bold text-plum-900">{c.id}</div><Badge tone={t.tone}>{t.t}</Badge></div>
                  <div className="mt-1 line-clamp-2 text-[13px] text-slate-600">{c.description}</div>
                  <div className="mt-2 text-[12px] text-slate-500">Raised {fmtDate(c.raisedAt)} · {c.area}</div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export function NewClaim() {
  const { s, d } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const [desc, setDesc] = useState('')
  const [area, setArea] = useState('Terrace / ceiling below')
  const [photos, setPhotos] = useState<string[]>([])
  const [err, setErr] = useState('')
  const inp = useRef<HTMLInputElement>(null)

  if (!s.warranty.active) return <ClaimsList />
  const oc = openClaim(s)
  if (oc) return (<div><ScreenHeader title="Raise a claim" /><Empty icon={<FileWarning />} title="A claim is already open" body={`${oc.id} is in progress.`} action={<Button onClick={() => nav(`/claims/${oc.id}`)}>View claim</Button>} /></div>)

  function submit() {
    if (!photos.length) return setErr('Add at least one fresh photo of the leak.')
    if (desc.trim().length < 8) return setErr('Describe what you see in a few words.')
    d({ type: 'raiseClaim', area, description: desc.trim(), photos })
    toast('Claim raised. Your record is attached automatically.')
    nav('/claims')
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Raise a claim" sub={`Job ${JOB.id} · work warranty active`} />
      <Card className="p-4">
        <div className="text-[14px] font-bold text-plum-900">1. Fresh photos of the leak</div>
        <input ref={inp} type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
          const out: string[] = []
          for (const f of Array.from(e.target.files || [])) { try { out.push(await compressImage(f)) } catch { setErr('Could not read one of the files.') } }
          setPhotos((p) => [...p, ...out].slice(0, 5)); e.target.value = ''
        }} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative aspect-square">
              <Thumb k={p} all={photos} i={i} className="h-full w-full" />
              <button aria-label="Remove" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow"><X size={13} /></button>
            </div>
          ))}
          <button onClick={() => inp.current?.click()} className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-plum-200 text-plum-600"><Plus /></button>
        </div>
        <div className="mt-2 flex gap-3 text-[12px] font-semibold text-plum-600">
          <button className="flex items-center gap-1" onClick={() => { setPhotos(['claimLeak']); setDesc('Small damp spot back on the bedroom ceiling near the NE corner after heavy rain last week.') }}><Sparkles size={13} /> Sample: corner damp</button>
          <button className="flex items-center gap-1" onClick={() => { setPhotos(['claimPipe']); setDesc('Damp patch on the wall below, near the bathroom, after rain. Spreading slowly.') }}><Sparkles size={13} /> Sample: wall damp</button>
        </div>
      </Card>
      <Card className="mt-3 p-4">
        <div className="text-[14px] font-bold text-plum-900">2. Where and what</div>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13.5px]">
          {['Terrace / ceiling below', 'Parapet wall', 'Wall below terrace', 'Other'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="What do you see? When did it start?" className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13.5px] outline-none focus:border-plum-300" />
      </Card>
      {err && <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[12.5px] text-red-700"><AlertCircle size={15} />{err}</div>}
      <Card className="mt-3 bg-plum-50/60 p-3 text-[12.5px] text-plum-900">Your Water Health Record (diagnosis, 7 stage photo sets, audit sign-offs, product batch) is attached automatically. An independent AP inspector decides; the original applicator does not.</Card>
      <Button className="mt-4 w-full" onClick={submit}>Submit claim <ArrowRight size={17} /></Button>
    </div>
  )
}

export function ClaimDetail() {
  const { id } = useParams()
  const { s, d } = useStore()
  const nav = useNavigate()
  const c = s.claims.find((x) => x.id === id)
  if (!c) return (<div><ScreenHeader title="Claim" /><Empty icon={<FileSearch />} title="Claim not found" body="It may have been cleared when the demo was reset." action={<Button onClick={() => nav('/claims')}>All claims</Button>} /></div>)
  const t = claimTone(c)
  const stepIdx = c.closedAt ? 5 : c.step

  return (
    <div className="pb-6">
      <ScreenHeader title={`Claim ${c.id}`} sub={`Raised ${fmtDateTime(c.raisedAt)} · ${c.area}`} />
      <Badge tone={t.tone} className="-mt-2 mb-3">{t.t}</Badge>

      <Card className="p-4">
        <div className="flex items-start">
          {STEPS.map((x, i) => {
            const n = i + 1
            const ok = n < stepIdx || (n === 5 && !!c.closedAt)
            const now = n === stepIdx && !c.closedAt
            return (
              <div key={x.t} className="relative flex flex-1 flex-col items-center text-center">
                {i > 0 && <div className={cx('absolute right-1/2 top-4 h-0.5 w-full', n <= stepIdx ? 'bg-saffron-500' : 'bg-slate-200')} />}
                <div className={cx('relative z-10 grid h-8 w-8 place-items-center rounded-full', ok ? 'bg-saffron-500 text-white' : now ? 'bg-plum-700 text-white ring-4 ring-plum-100' : 'bg-slate-100 text-slate-400')}>{ok ? <Check size={15} strokeWidth={3} /> : <x.i size={15} />}</div>
                <div className="mt-1 text-[10.5px] font-medium leading-tight text-slate-600">{x.t}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <div className="text-[13px] text-slate-700">{c.description}</div>
        <div className="mt-2 flex gap-2">{c.photos.map((p, i) => <Thumb key={i} k={p} all={c.photos} i={i} className="h-16 w-20" />)}</div>
      </Card>

      {c.outcome && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={cx('mt-3 border-l-4 p-4', c.outcome === 'eligible' ? 'border-emerald-500' : 'border-red-400')}>
            <div className={cx('flex items-center gap-2 text-[15px] font-bold', c.outcome === 'eligible' ? 'text-emerald-700' : 'text-red-600')}>
              {c.outcome === 'eligible' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {c.outcome === 'eligible' ? 'Covered: workmanship defect' : 'Not covered: plumbing issue'}
            </div>
            <p className="mt-1 text-[13px] text-slate-700">{c.decisionNote}</p>
            <div className="mt-2 text-[11.5px] text-slate-500">Decided by AP Warranty Desk on {PEOPLE.auditor.name}'s inspection, with photos and readings on record.</div>
            {c.outcome === 'excluded' && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-[12.5px] text-slate-700">
                <b>Recommended next steps</b>
                <ul className="mt-1 space-y-1"><li>• Get the concealed bathroom line checked by a plumber (dealer can refer one).</li><li>• Once fixed, a free Guided check for the wall repaint.</li><li>• Your terrace warranty stays active and unchanged.</li></ul>
              </div>
            )}
            {c.outcome === 'eligible' && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-[12.5px] text-emerald-800">Free repair or redo, up to the original job value. No charge to you.</div>
            )}
          </Card>
        </motion.div>
      )}

      <Card className="mt-3 p-4">
        <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-plum-700/80">Claim log</div>
        {[...c.events].reverse().map((e, i) => (
          <div key={i} className="relative flex gap-3 pb-3 last:pb-0">
            <div className={cx('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', i === 0 ? 'bg-saffron-500' : 'bg-plum-200')} />
            <div><div className="text-[13.5px] font-semibold text-ink">{e.title}</div><div className="text-[12.5px] text-slate-600">{e.note}</div><div className="text-[11px] text-slate-400">{e.by} · {fmtDateTime(e.at)}</div></div>
          </div>
        ))}
      </Card>

      {c.closedAt && c.outcome === 'eligible' && (
        <Card className="mt-3 bg-saffron-50/60 p-3 text-[12.5px] text-saffron-800">Claim closure doesn't release your 10% retention. That still follows the post-monsoon review. <button className="font-semibold underline" onClick={() => nav('/warranty')}>View retention</button></Card>
      )}

      {!c.closedAt && (
        <div className="mt-4 rounded-2xl border border-dashed border-plum-200 bg-white/60 p-3">
          <div className="text-center text-[11px] font-bold uppercase tracking-wider text-plum-500">Presenter controls (demo)</div>
          <div className="mt-2 space-y-2">
            {c.step === 1 && <Button variant="soft" className="w-full py-2.5 text-[13px]" onClick={() => d({ type: 'claimRetrieve', id: c.id })}>Retrieve record & book inspection</Button>}
            {c.step === 3 && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="soft" className="py-2.5 text-[13px]" onClick={() => d({ type: 'claimDecide', id: c.id, outcome: 'eligible' })}>Inspector: workmanship</Button>
                <Button variant="soft" className="py-2.5 text-[13px]" onClick={() => d({ type: 'claimDecide', id: c.id, outcome: 'excluded' })}>Inspector: plumbing</Button>
              </div>
            )}
            {c.step >= 4 && <Button variant="soft" className="w-full py-2.5 text-[13px]" onClick={() => d({ type: 'claimProgress', id: c.id })}>
              {c.outcome === 'excluded' ? 'Close with next steps' : ({ undefined: 'Schedule free rectification', scheduled: 'Start rectification', in_progress: 'Auditor verifies repair', verified: 'Close claim' } as Record<string, string>)[String(c.resolution)]}
            </Button>}
          </div>
        </div>
      )}
      <Button variant="ghost" className="mt-2 w-full" onClick={() => nav('/record')}>View in Water Health Record</Button>
    </div>
  )
}
