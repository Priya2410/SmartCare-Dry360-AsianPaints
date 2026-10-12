import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, CircleHelp, X } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { photo } from '../lib/photos'
import type { StageStatus } from '../lib/types'

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cx('rounded-2xl bg-white shadow-card ring-1 ring-plum-900/[.04]', onClick && 'cursor-pointer active:scale-[.99] transition', className)}>
      {children}
    </div>
  )
}

type BtnVariant = 'primary' | 'plum' | 'ghost' | 'outline' | 'soft' | 'danger'
export function Button({ children, variant = 'primary', className, disabled, onClick, type = 'button', icon }: {
  children: ReactNode; variant?: BtnVariant; className?: string; disabled?: boolean; onClick?: () => void; type?: 'button' | 'submit'; icon?: ReactNode
}) {
  const v: Record<BtnVariant, string> = {
    primary: 'bg-saffron-500 text-white shadow-[0_8px_20px_-8px_rgba(244,123,32,.8)] hover:bg-saffron-600',
    plum: 'bg-plum-700 text-white hover:bg-plum-800 shadow-[0_8px_20px_-10px_rgba(69,35,127,.9)]',
    ghost: 'text-plum-700 hover:bg-plum-50',
    outline: 'border border-plum-200 text-plum-800 bg-white hover:bg-plum-50',
    soft: 'bg-plum-50 text-plum-800 hover:bg-plum-100',
    danger: 'border border-red-200 text-red-700 bg-white hover:bg-red-50',
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={cx('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold transition active:scale-[.98] disabled:opacity-40 disabled:pointer-events-none', v[variant], className)}>
      {icon}{children}
    </button>
  )
}

type Tone = 'green' | 'orange' | 'plum' | 'gray' | 'red' | 'blue'
export function Badge({ children, tone = 'plum', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  const t: Record<Tone, string> = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    orange: 'bg-saffron-50 text-saffron-700 ring-saffron-500/20',
    plum: 'bg-plum-50 text-plum-700 ring-plum-600/15',
    gray: 'bg-slate-100 text-slate-600 ring-slate-500/10',
    red: 'bg-red-50 text-red-700 ring-red-600/15',
    blue: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  }
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1', t[tone], className)}>{children}</span>
}

export const STAGE_TONE: Record<StageStatus, [Tone, string]> = {
  pending: ['gray', 'Pending'],
  in_progress: ['blue', 'In progress'],
  submitted: ['orange', 'Submitted'],
  approved: ['green', 'Approved'],
  rework: ['red', 'Rework required'],
}
export const StageBadge = ({ s }: { s: StageStatus }) => <Badge tone={STAGE_TONE[s][0]}>{STAGE_TONE[s][1]}</Badge>

export function ScreenHeader({ title, sub, back = true, right }: { title: string; sub?: ReactNode; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-4 bg-[#f7f5fb]/90 px-4 pb-3 pt-3 backdrop-blur">
      <div className="flex items-center justify-between">
        {back ? (
          <button aria-label="Back" onClick={() => nav(-1)} className="grid h-9 w-9 place-items-center rounded-full text-plum-900 hover:bg-plum-100"><ArrowLeft size={20} /></button>
        ) : <span className="w-9" />}
        <div className="font-display text-[17px] font-bold tracking-tight">
          <span className="text-plum-800">SmartCare</span> <span className="text-saffron-500">Dry360</span>
        </div>
        {right ?? <button aria-label="Help" onClick={() => nav('/how')} className="grid h-9 w-9 place-items-center rounded-full text-plum-900 hover:bg-plum-100"><CircleHelp size={20} /></button>}
      </div>
      <h1 className="mt-3 font-display text-[24px] font-bold leading-tight text-plum-900">{title}</h1>
      {sub && <div className="mt-1 text-[13.5px] text-slate-500">{sub}</div>}
    </div>
  )
}

export function Pill({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-plum-50 px-3 py-2 text-[12.5px] font-medium text-plum-800">{icon}{children}</div>
}

export function KV({ k, v, icon, strong }: { k: ReactNode; v: ReactNode; icon?: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <span className="mt-0.5 text-plum-500">{icon}</span>}
      <span className="w-[42%] shrink-0 text-[13px] text-slate-500">{k}</span>
      <span className={cx('flex-1 text-[13.5px] text-ink', strong ? 'font-bold' : 'font-medium')}>{v}</span>
    </div>
  )
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between">
      <h2 className="text-[13px] font-bold uppercase tracking-[.08em] text-plum-700/80">{children}</h2>
      {right}
    </div>
  )
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cx('h-2 overflow-hidden rounded-full bg-plum-100', className)}>
      <motion.div className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-saffron-300" initial={false} animate={{ width: `${Math.max(0, Math.min(100, value))}%` }} transition={{ duration: 0.6 }} />
    </div>
  )
}

export function Segments({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={cx('h-1.5 flex-1 rounded-full transition-colors duration-500', i < done ? 'bg-saffron-500' : 'bg-plum-100')} />
      ))}
    </div>
  )
}

export function Avatar({ name, size = 44, tone = 'plum' }: { name: string; size?: number; tone?: 'plum' | 'orange' | 'teal' }) {
  const initials = name.replace(/^(Er\.|Dr\.)\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')
  const g = { plum: 'from-plum-500 to-plum-800', orange: 'from-saffron-300 to-saffron-600', teal: 'from-teal-400 to-teal-700' }[tone]
  return (
    <div style={{ width: size, height: size }} className={cx('relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br text-white ring-2 ring-white', g)}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full opacity-25"><circle cx="20" cy="15" r="7" fill="#fff" /><path d="M6 38c2-9 8-13 14-13s12 4 14 13" fill="#fff" /></svg>
      <span className="relative font-bold" style={{ fontSize: size * 0.34 }}>{initials}</span>
    </div>
  )
}

/* ---------- Lightbox ---------- */
const LbCtx = createContext<(imgs: string[], i?: number, caption?: string) => void>(() => {})
export const useLightbox = () => useContext(LbCtx)

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [st, set] = useState<{ imgs: string[]; i: number; caption?: string } | null>(null)
  const open = useCallback((imgs: string[], i = 0, caption?: string) => set({ imgs, i, caption }), [])
  return (
    <LbCtx.Provider value={open}>
      {children}
      <AnimatePresence>
        {st && (
          <motion.div className="fixed inset-0 z-[100] flex flex-col bg-black/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => set(null)}>
            <div className="flex items-center justify-between p-4 text-white/80">
              <span className="text-sm">{st.i + 1} / {st.imgs.length} · Representative image</span>
              <button aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><X /></button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
              <motion.img key={st.i} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} src={photo(st.imgs[st.i])} alt="" className="max-h-[75vh] max-w-full rounded-xl object-contain" />
              {st.imgs.length > 1 && (<>
                <button aria-label="Previous" onClick={() => set({ ...st, i: (st.i - 1 + st.imgs.length) % st.imgs.length })} className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white"><ChevronLeft /></button>
                <button aria-label="Next" onClick={() => set({ ...st, i: (st.i + 1) % st.imgs.length })} className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white"><ChevronRight /></button>
              </>)}
            </div>
            {st.caption && <div className="p-5 text-center text-sm text-white/80">{st.caption}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </LbCtx.Provider>
  )
}

export function Thumb({ k, all, i = 0, caption, className }: { k: string; all?: string[]; i?: number; caption?: string; className?: string }) {
  const open = useLightbox()
  return (
    <button onClick={() => open(all || [k], i, caption)} className={cx('group relative overflow-hidden rounded-xl bg-slate-200 ring-1 ring-black/5', className)}>
      <img src={photo(k)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
    </button>
  )
}

/* ---------- Toast ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msgs, setMsgs] = useState<{ id: number; msg: string }[]>([])
  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setMsgs((m) => [...m, { id, msg }])
    setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 2800)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {msgs.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-sm rounded-xl bg-plum-900 px-4 py-2.5 text-center text-[13.5px] font-medium text-white shadow-lift">{m.msg}</motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- Bottom sheet ---------- */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-50 flex items-end bg-plum-900/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="max-h-[85%] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-8" initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-plum-900">{title}</h3>
              <button aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-100"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Footnote({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-slate-500">{icon}{children}</div>
}

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-plum-50 text-plum-600">{icon}</div>
      <div className="font-display text-lg font-bold text-plum-900">{title}</div>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  )
}

export function MeasureStrip({ items }: { items: { icon: ReactNode; k: string; v: string }[] }) {
  return (
    <div className="mt-6 grid grid-cols-3 divide-x divide-plum-100 rounded-2xl bg-white p-3 shadow-card">
      {items.map((x) => (
        <div key={x.k} className="flex flex-col items-center px-1 text-center">
          <span className="mb-1 text-saffron-500">{x.icon}</span>
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-saffron-600">{x.k}</span>
          <span className="text-[11.5px] leading-tight text-plum-900">{x.v}</span>
        </div>
      ))}
    </div>
  )
}
