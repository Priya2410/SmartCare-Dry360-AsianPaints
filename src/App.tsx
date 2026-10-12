import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Hammer, Home as HomeIcon, Building2, ShieldCheck, SlidersHorizontal, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { DemoControls, GuideProvider } from './components/Demo'
import { LightboxProvider, ToastProvider, cx } from './components/ui'
import { StoreProvider, useStore } from './lib/store'
import { ApplicatorView, AuditorView, DealerView } from './partner/Partner'
import Booking from './screens/Booking'
import { ClaimDetail, ClaimsList, NewClaim } from './screens/Claims'
import Diagnosis from './screens/Diagnosis'
import Home from './screens/Home'
import Job from './screens/Job'
import { HowItWorks, Jobs, Profile, Property } from './screens/Misc'
import PhotoCheck, { PhotoSubmitted } from './screens/PhotoCheck'
import Record, { SharedRecord } from './screens/Record'
import Warranty from './screens/Warranty'
import Console from './ap/Console'

const NAV = [
  { to: '/', label: 'Home', icon: HomeIcon, match: (p: string) => p === '/' || p.startsWith('/check') || p.startsWith('/how') },
  { to: '/property', label: 'Property', icon: Building2, match: (p: string) => p.startsWith('/property') },
  { to: '/jobs', label: 'Jobs', icon: Hammer, match: (p: string) => ['/jobs', '/job', '/diagnosis', '/booking'].some((x) => p === x) },
  { to: '/record', label: 'Record', icon: FileText, match: (p: string) => p.startsWith('/record') || p.startsWith('/share') },
  { to: '/warranty', label: 'Warranty', icon: ShieldCheck, match: (p: string) => p.startsWith('/warranty') || p.startsWith('/claims') },
  { to: '/profile', label: 'Profile', icon: UserRound, match: (p: string) => p.startsWith('/profile') },
]

function Screens() {
  const loc = useLocation()
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [loc.pathname])
  const partner = loc.pathname.startsWith('/partner')
  return (
    <div className="relative flex h-full flex-col bg-[#f7f5fb]">
      <div ref={scroller} className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-4 pt-1">
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <Routes location={loc}>
              <Route path="/" element={<Home />} />
              <Route path="/check" element={<PhotoCheck />} />
              <Route path="/check/submitted" element={<PhotoSubmitted />} />
              <Route path="/diagnosis" element={<Diagnosis />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/job" element={<Job />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/property" element={<Property />} />
              <Route path="/record" element={<Record />} />
              <Route path="/share/record" element={<SharedRecord />} />
              <Route path="/warranty" element={<Warranty />} />
              <Route path="/claims" element={<ClaimsList />} />
              <Route path="/claims/new" element={<NewClaim />} />
              <Route path="/claims/:id" element={<ClaimDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/how" element={<HowItWorks />} />
              <Route path="/partner/applicator" element={<ApplicatorView />} />
              <Route path="/partner/auditor" element={<AuditorView />} />
              <Route path="/partner/dealer" element={<DealerView />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
        <div className="h-6" />
      </div>
      {!partner && (
        <nav className="z-30 grid grid-cols-6 border-t border-plum-100 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur">
          {NAV.map((n) => {
            const on = n.match(loc.pathname)
            return (
              <NavLink key={n.to} to={n.to} className="flex flex-col items-center gap-0.5 py-1">
                <span className={cx('grid h-7 w-11 place-items-center rounded-full transition', on ? 'bg-saffron-50 text-saffron-600' : 'text-slate-400')}><n.icon size={19} strokeWidth={on ? 2.4 : 2} /></span>
                <span className={cx('text-[10.5px] font-semibold', on ? 'text-plum-900' : 'text-slate-400')}>{n.label}</span>
              </NavLink>
            )
          })}
        </nav>
      )}
    </div>
  )
}

function StatusBar() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between bg-[#f7f5fb] px-7 text-[13px] font-semibold text-ink">
      <span>9:41</span>
      <span className="absolute left-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" /><rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" /><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" /></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x=".5" y=".5" width="21" height="10" rx="3" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="7" rx="1.5" fill="currentColor" /></svg>
      </span>
    </div>
  )
}

function useDesktop() {
  const q = '(min-width: 1024px)'
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => { const mq = window.matchMedia(q); const f = () => setM(mq.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f) }, [])
  return m
}

function Shell() {
  const [sheet, setSheet] = useState(false)
  const desktop = useDesktop()
  const loc = useLocation()
  const { s } = useStore()
  if (loc.pathname.startsWith('/ap')) return <Console />
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,#efe8fb,transparent_55%),radial-gradient(ellipse_at_bottom_right,#ffeede,transparent_50%)] bg-[#f4f1f9]">
      {/* Desktop: presenter rail + phone */}
      {desktop ? <div className="flex min-h-screen items-center justify-center gap-10 px-8 py-8">
        <aside className="w-[340px] shrink-0">
          <div className="font-display text-[30px] font-bold leading-none"><span className="text-plum-800">SmartCare</span> <span className="text-saffron-500">Dry360</span></div>
          <p className="mt-2 text-[14px] text-slate-600">Sell a dry house, not just waterproofing chemicals. Interactive prototype of the homeowner app.</p>
          <a href="#/ap/overview" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-plum-800 px-3.5 py-2 text-[13px] font-semibold text-white shadow-card hover:bg-plum-900">Open Asian Paints Command Centre →</a>
          <div className="mt-2 text-[12px] text-slate-400">Asian Paints CANVAS 2026 · Team The Syndicate, XLRI Jamshedpur</div>
          <div className="mt-6 max-h-[calc(100vh-200px)] overflow-y-auto rounded-3xl bg-white/80 p-5 shadow-card ring-1 ring-plum-900/5 backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-plum-700"><SlidersHorizontal size={15} /> Demo mode</div>
            <DemoControls />
          </div>
        </aside>
        <div className="relative h-[860px] max-h-[calc(100vh-40px)] w-[400px] shrink-0 overflow-hidden rounded-[56px] border-[10px] border-[#1d1530] bg-[#f7f5fb] shadow-[0_40px_80px_-30px_rgba(34,17,63,.6)]">
          <div className="flex h-full flex-col">
            <StatusBar />
            <div className="relative min-h-0 flex-1"><Screens /></div>
          </div>
        </div>
        <div className="w-[200px] shrink-0 text-[12px] text-slate-500 xl:block hidden">
          <div className="font-bold text-plum-800">Current view</div>
          <div className="mt-1 capitalize">{s.role === 'homeowner' ? 'Homeowner app' : `${s.role} partner view`}</div>
          <div className="mt-4 font-bold text-plum-800">Tip</div>
          <div className="mt-1">Tap any stage photo for fullscreen. Every action updates all screens and roles, and survives a reload.</div>
        </div>
      </div> : (
      <div className="flex h-[100dvh] flex-col">
        <div className="relative min-h-0 flex-1"><Screens /></div>
        <button aria-label="Demo mode" onClick={() => setSheet(true)} className="fixed bottom-[84px] right-3 z-40 flex items-center gap-1 rounded-full bg-plum-900/85 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur">
          <SlidersHorizontal size={13} /> Demo
        </button>
        <AnimatePresence>
          {sheet && (
            <motion.div className="fixed inset-0 z-[70] flex items-end bg-plum-900/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
              <motion.div className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-10" initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 font-bold text-plum-900"><SlidersHorizontal size={16} /> Demo mode</div><button onClick={() => setSheet(false)} className="rounded-full p-1.5 hover:bg-slate-100"><X size={18} /></button></div>
                <DemoControls compact onDone={() => setSheet(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>)}
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ToastProvider>
          <LightboxProvider>
            <GuideProvider>
              <Shell />
            </GuideProvider>
          </LightboxProvider>
        </ToastProvider>
      </HashRouter>
    </StoreProvider>
  )
}
