# SmartCare Dry360 — Interactive App Prototype

Concept prototype for **Asian Paints CANVAS 2026** by Team The Syndicate, XLRI Jamshedpur.
*Not an official Asian Paints application. All names, IDs, dates, readings, QR codes and sign-offs are demo values.*

> Sell a dry house, not just waterproofing chemicals. — Har baarish, sookha ghar.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build to dist/
npm run build:single # one self-contained dist-single/index.html (works offline / from a file)
```

Node 18+ required.

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → import the repo**.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`. Deploy.

Routing uses hash URLs (`#/warranty`), so no rewrite rules are needed. Or drop `dist-single/index.html` on any static host.

## Demo mode

- **Desktop:** presenter panel on the left, phone on the right.
- **Mobile:** tap the **Demo** chip (bottom right).
- **Guided jury demo:** 13 steps, ~3 minutes, auto-plays (pause / next / back).
- **Next actions:** only the actions valid in the current state are shown.
- **Jump to stage:** fresh start → photos → diagnosis → booked → mid-job → verified → warranty → covered claim → excluded claim → monsoon passed.
- **Switch demo role:** Homeowner, Applicator, Auditor, Dealer — all share one state.
- **Reset entire demo.** Progress is saved in `localStorage` and survives reloads.

## Architecture

```
src/
  lib/types.ts     DemoState, Stage, Claim types
  lib/data.ts      Business constants, seeded persona, people, dates, stage defs
  lib/store.tsx    Reducer state machine + localStorage persistence + milestone jumps
  lib/photos.ts    Representative site imagery (SVG) + upload compression
  lib/pdf.ts       Diagnosis, warranty and Water Health Record PDF export (jsPDF)
  components/ui.tsx    Cards, badges, sheets, lightbox, toasts
  components/Demo.tsx  Demo controls + guided jury walkthrough
  screens/         Home, PhotoCheck, Diagnosis, Booking, Job, Warranty, Claims, Record, Misc
  partner/         Applicator, Auditor, Dealer views
```

### State machine (single source of truth)

```
photoCheck: none → submitted → reviewed            (expert review simulated, labelled as demo)
diagnosis:  none → visit_booked (₹999 paid) → report_ready
quote:      pending → accepted | rejected (reopenable)
booking:    none → proposed → confirmed
stage n:    pending → in_progress → submitted → approved | rework → submitted …
            stage n+1 can only start after stage n is approved
            stages 6 (pre-cover) and 7 (water test) are on-site audits
warranty:   active only if products scanned + 7 stages approved + 2 on-site audits + 90% paid
monsoon:    scheduled → review_passed | on_hold (open covered claim holds it)
retention:  held (by customer) → release_due → released (customer action)
claim:      raised → record retrieved → inspection → decision (eligible | excluded) → resolution → closed
            closing a claim never releases retention
applicator: paid by AP in 3 tranches after stages 2, 5, 7 are approved (demo split 30/40/30)
```

### Key numbers (₹75,000 job, 1,000 sq ft at ₹75/sq ft)

| Item | Amount |
|---|---|
| Labour (certified applicator) | ₹31,688 |
| Material billed at dealer (incl. ~₹4,050 dealer margin) | ₹40,499 |
| AP service fee (audits, record, warranty) | ₹2,813 |
| 90% on completion | ₹67,500 (₹66,501 after ₹999 diagnosis credit) |
| 10% retained by customer until after first monsoon | ₹7,500 |

AI pre-screen only checks photo completeness. It never decides the cause of a leak, certifies work, or approves warranties.
