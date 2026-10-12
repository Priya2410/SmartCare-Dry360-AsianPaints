import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Bath, Building2, Check, CheckCircle2, Clock, Container, Info, Plus, RefreshCw, Sparkles, UserRound, X, Home } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Footnote, MeasureStrip, Pill, ScreenHeader, Segments, Thumb, cx, useToast } from '../components/ui'
import { DATES, fmtDateTime } from '../lib/data'
import { SAMPLE_UPLOADS, compressImage, photo } from '../lib/photos'
import { useStore } from '../lib/store'
import { Clock3, BarChart3 } from 'lucide-react'

const AREAS = [
  { k: 'Terrace', i: Home },
  { k: 'Bathroom', i: Bath },
  { k: 'Interior wall', i: Building2 },
  { k: 'Tank', i: Container },
]
const SYMPTOMS = ['Damp patch', 'Peeling paint', 'Crack', 'Water drip']

export default function PhotoCheck() {
  const { s, d } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const pc = s.photoCheck
  const input = useRef<HTMLInputElement>(null)
  const replaceIdx = useRef<number | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const locked = pc.status !== 'none'

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return
    setErr(null)
    const out: string[] = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) { setErr(`${f.name} is not an image. Use JPG or PNG.`); continue }
      if (f.size > 15 * 1024 * 1024) { setErr(`${f.name} is over 15 MB.`); continue }
      try { out.push(await compressImage(f)) } catch { setErr(`Couldn't read ${f.name}.`) }
    }
    if (replaceIdx.current !== null && out[0]) {
      const arr = [...pc.photos]; arr[replaceIdx.current] = out[0]
      d({ type: 'photoForm', patch: { photos: arr } })
    } else {
      const arr = [...pc.photos, ...out].slice(0, 8)
      if (pc.photos.length + out.length > 8) setErr('Up to 8 photos. Extra photos were left out.')
      d({ type: 'photoForm', patch: { photos: arr } })
    }
    replaceIdx.current = null
    if (input.current) input.current.value = ''
  }

  const toggle = (sym: string) => d({ type: 'photoForm', patch: { symptoms: pc.symptoms.includes(sym) ? pc.symptoms.filter((x) => x !== sym) : [...pc.symptoms, sym] } })

  function submit() {
    if (!pc.photos.length) { setErr('Add at least one photo of the affected area.'); return }
    setBusy(true)
    setTimeout(() => { d({ type: 'submitPhotoCheck' }); setBusy(false); nav('/check/submitted') }, 900)
  }

  const step = pc.photos.length === 0 ? 1 : pc.symptoms.length === 0 ? 2 : 3

  if (locked) {
    return (
      <div>
        <ScreenHeader title="Upload issue photos" />
        <Card className="p-5 text-center">
          <CheckCircle2 className="mx-auto text-emerald-600" size={36} />
          <div className="mt-2 font-display text-lg font-bold text-plum-900">Photo check already sent</div>
          <p className="mt-1 text-sm text-slate-500">Request {pc.requestId}. Reset the demo to try the upload again.</p>
          <Button className="mt-4 w-full" onClick={() => nav('/check/submitted')}>View request</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Upload issue photos" sub="Add clear photos of the affected area from different angles." />
      <Pill icon={<Clock size={15} />}>Free expert photo check · Response within 24 hours</Pill>
      <div className="mb-1 flex items-center justify-between text-[12.5px] font-semibold text-slate-500"><span>Step {step} of 4</span><span>{pc.photos.length}/5 recommended</span></div>
      <Segments total={4} done={step} />

      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {pc.photos.map((p, i) => (
          <motion.div key={i + p.slice(-12)} layout initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-[4/3]">
            <Thumb k={p} all={pc.photos} i={i} className="h-full w-full" caption="Your upload" />
            <button aria-label="Remove photo" onClick={() => d({ type: 'photoForm', patch: { photos: pc.photos.filter((_, j) => j !== i) } })} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-slate-700 shadow"><X size={15} /></button>
            <button onClick={() => { replaceIdx.current = i; input.current?.click() }} className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white"><RefreshCw size={11} /> Replace</button>
          </motion.div>
        ))}
        <button onClick={() => { replaceIdx.current = null; input.current?.click() }} className={cx('flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-plum-200 bg-plum-50/50 text-plum-700 transition hover:bg-plum-50', pc.photos.length === 0 && 'col-span-2 aspect-[2/1]')}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-plum-600 shadow-card"><Plus /></span>
          <span className="mt-2 text-[13.5px] font-semibold">{pc.photos.length ? 'Add more photos' : 'Add photos from your phone'}</span>
          <span className="text-[11.5px] text-slate-500">3–5 recommended · JPG or PNG</span>
        </button>
      </div>
      {pc.photos.length === 0 && (
        <button onClick={() => d({ type: 'photoForm', patch: { photos: SAMPLE_UPLOADS } })} className="mt-2 flex w-full items-center justify-center gap-1.5 text-[12.5px] font-semibold text-plum-600"><Sparkles size={14} /> Use Jayadevi's sample photos (demo)</button>
      )}
      {pc.photos.length > 0 && pc.photos.length < 3 && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-saffron-50 px-3 py-2 text-[12.5px] text-saffron-700"><Info size={15} /> One photo is enough to start. 3–5 from different angles help the expert.</div>
      )}
      {err && <div className="mt-2 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[12.5px] text-red-700"><AlertCircle size={15} />{err}</div>}

      <div className="mt-5 text-[14px] font-bold text-plum-900">Select area <span className="font-normal text-slate-400">(optional)</span></div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {AREAS.map((a) => (
          <button key={a.k} onClick={() => d({ type: 'photoForm', patch: { area: a.k } })} className={cx('flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-medium transition', pc.area === a.k ? 'border-saffron-500 bg-saffron-50 text-saffron-700' : 'border-slate-200 bg-white text-slate-600')}>
            <a.i size={16} />{a.k}
          </button>
        ))}
      </div>

      <Card className="mt-4 p-4">
        <div className="text-[14px] font-bold text-plum-900">Tell us where you see the problem</div>
        <div className="text-[12px] text-slate-500">Select all that apply</div>
        <div className="mt-3 grid grid-cols-2 gap-y-3">
          {SYMPTOMS.map((sym) => {
            const on = pc.symptoms.includes(sym)
            return (
              <button key={sym} onClick={() => toggle(sym)} className="flex items-center gap-2.5 text-left text-[13.5px] text-slate-700">
                <span className={cx('grid h-5 w-5 place-items-center rounded-md border transition', on ? 'border-saffron-500 bg-saffron-500 text-white' : 'border-slate-300')}>{on && <Check size={14} strokeWidth={3} />}</span>{sym}
              </button>
            )
          })}
        </div>
        <textarea value={pc.description} onChange={(e) => d({ type: 'photoForm', patch: { description: e.target.value } })} placeholder="Anything else? e.g. worse after rain, earlier repairs (optional)" rows={2} className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13.5px] outline-none focus:border-plum-300 focus:bg-white" />
      </Card>

      <Button className="mt-5 w-full" onClick={submit} disabled={busy}>{busy ? 'Uploading…' : <>Submit for expert review <ArrowRight size={17} /></>}</Button>
      <Footnote icon={<Info size={13} />}>Customer action: upload 3–5 photos. Nothing is diagnosed from photos alone.</Footnote>

      <MeasureStrip items={[
        { icon: <UserRound size={18} />, k: 'Customer action', v: 'Upload 3–5 leak photos' },
        { icon: <Clock3 size={18} />, k: 'AP action', v: 'Expert review in 24 hrs' },
        { icon: <BarChart3 size={18} />, k: 'Measure moved', v: 'Lead-to-diagnosis' },
      ]} />
      <button onClick={() => toast('Calling AP helpline (demo)')} className="mx-auto mt-4 block text-[12.5px] font-semibold text-plum-600">Prefer to talk? Request a call back</button>
    </div>
  )
}

export function PhotoSubmitted() {
  const { s, d } = useStore()
  const nav = useNavigate()
  const pc = s.photoCheck
  if (pc.status === 'none') {
    return (<div><ScreenHeader title="Photo check" /><Card className="p-6 text-center text-sm text-slate-500">No request yet.<Button className="mt-4 w-full" onClick={() => nav('/check')}>Start a photo check</Button></Card></div>)
  }
  const reviewed = pc.status === 'reviewed'
  return (
    <div className="pb-6">
      <ScreenHeader title={reviewed ? 'Expert has replied' : 'Photo check submitted'} />
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center bg-gradient-to-b from-emerald-50 to-white px-5 pb-5 pt-6 text-center">
          <motion.div initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg"><Check size={34} strokeWidth={3} /></motion.div>
          <div className="mt-3 font-display text-xl font-bold text-plum-900">Photo Check Submitted</div>
          <div className="mt-1 text-sm text-slate-500">Request ID <b className="text-plum-800">{pc.requestId}</b> · {fmtDateTime(pc.submittedAt)}</div>
          <Badge tone={reviewed ? 'green' : 'orange'} className="mt-3">{reviewed ? 'Reviewed by expert' : 'Expert review within 24 hours'}</Badge>
        </div>
        <div className="grid grid-cols-4 gap-2 px-4 pb-4">
          {pc.photos.slice(0, 4).map((p, i) => <Thumb key={i} k={p} all={pc.photos} i={i} className="aspect-square" />)}
        </div>
        <div className="border-t border-slate-100 px-4 py-3 text-[13px] text-slate-600">{pc.area} · {pc.symptoms.join(', ') || 'No symptoms selected'}</div>
      </Card>

      <Card className="mt-4 p-4">
        <div className="text-[13px] font-bold text-plum-900">What happens next</div>
        {[
          { t: 'Expert looks at your photos', d: 'An AP technical expert, not a salesperson.', done: reviewed },
          { t: 'You get a written reply', d: 'Likely cause area and whether a site visit is needed.', done: reviewed },
          { t: 'Optional ₹999 diagnosis visit', d: 'Credited to the job if you go ahead.', done: false },
        ].map((x, i) => (
          <div key={i} className="mt-3 flex gap-3">
            <span className={cx('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold', x.done ? 'bg-emerald-500 text-white' : 'bg-plum-50 text-plum-700')}>{x.done ? <Check size={14} /> : i + 1}</span>
            <div><div className="text-[13.5px] font-semibold text-ink">{x.t}</div><div className="text-[12.5px] text-slate-500">{x.d}</div></div>
          </div>
        ))}
      </Card>

      {reviewed ? (
        <Card className="mt-4 border-l-4 border-saffron-500 p-4">
          <div className="text-[12px] font-semibold text-saffron-600">Expert reply · {fmtDateTime(DATES.expertReview)}</div>
          <p className="mt-1 text-[13.5px] text-slate-700">{pc.expertNote}</p>
          <Button className="mt-3 w-full" onClick={() => nav('/diagnosis')}>View diagnosis journey <ArrowRight size={17} /></Button>
        </Card>
      ) : (
        <>
          <Button variant="outline" className="mt-4 w-full" onClick={() => nav('/diagnosis')}>View diagnosis journey</Button>
          <div className="mt-3 rounded-xl border border-dashed border-plum-200 p-3 text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-plum-500">Demo transition</div>
            <button onClick={() => d({ type: 'expertReview' })} className="mt-1 text-[13px] font-semibold text-plum-700 underline-offset-2 hover:underline">Simulate expert review (normally within 24 hours)</button>
          </div>
        </>
      )}
      <Button variant="ghost" className="mt-2 w-full" onClick={() => nav('/')}>Back to home</Button>
    </div>
  )
}
