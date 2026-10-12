import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import type { DemoState } from './types'
import { CUSTOMER, DATES, JOB, NINETY, PEOPLE, PROPERTY, RETENTION, RULES, fmtDate, fmtDateTime } from './data'

const PLUM: [number, number, number] = [69, 35, 127]
const ORANGE: [number, number, number] = [244, 123, 32]
const INK: [number, number, number] = [29, 21, 48]
const GREY: [number, number, number] = [110, 105, 125]
// jsPDF's built-in fonts lack the rupee glyph
const rs = (n: number) => 'Rs ' + n.toLocaleString('en-IN')

class Doc {
  d = new jsPDF({ unit: 'mm', format: 'a4' })
  y = 0
  W = 210
  M = 16
  constructor(title: string, sub: string) {
    const { d } = this
    d.setFillColor(...PLUM); d.rect(0, 0, this.W, 34, 'F')
    d.setFillColor(...ORANGE); d.rect(0, 34, this.W, 1.6, 'F')
    d.setTextColor(255, 255, 255); d.setFont('helvetica', 'bold'); d.setFontSize(11)
    d.text('SmartCare', this.M, 12); d.setTextColor(...ORANGE); d.text("Dry360", this.M + 21, 12)
    d.setTextColor(255, 255, 255); d.setFontSize(19); d.text(title, this.M, 24)
    d.setFont('helvetica', 'normal'); d.setFontSize(9); d.text(sub, this.M, 30)
    this.y = 46
    this.footer()
  }
  footer() {
    const { d } = this
    d.setFontSize(7.5); d.setTextColor(...GREY)
    d.text('Concept prototype developed for Asian Paints CANVAS 2026 by Team The Syndicate, XLRI Jamshedpur. Not an official Asian Paints document.', this.M, 289)
    d.text('Demo values only. QR codes and sign-offs are illustrative and do not represent real AP-issued certification.', this.M, 293)
  }
  need(h: number) { if (this.y + h > 280) { this.d.addPage(); this.y = 20; this.footer() } }
  h(t: string) {
    this.need(14); const { d } = this
    d.setFont('helvetica', 'bold'); d.setFontSize(11.5); d.setTextColor(...PLUM); d.text(t.toUpperCase(), this.M, this.y)
    d.setDrawColor(230, 224, 242); d.line(this.M, this.y + 2, this.W - this.M, this.y + 2); this.y += 8
  }
  kv(k: string, v: string) {
    const { d } = this
    const lines = d.splitTextToSize(v, this.W - this.M * 2 - 55)
    this.need(lines.length * 5 + 2)
    d.setFont('helvetica', 'normal'); d.setFontSize(9.5); d.setTextColor(...GREY); d.text(k, this.M, this.y)
    d.setTextColor(...INK); d.setFont('helvetica', 'bold'); d.text(lines, this.M + 55, this.y)
    this.y += lines.length * 5 + 1.5
  }
  p(t: string, color = INK) {
    const { d } = this
    const lines = d.splitTextToSize(t, this.W - this.M * 2)
    this.need(lines.length * 4.8 + 2)
    d.setFont('helvetica', 'normal'); d.setFontSize(9.5); d.setTextColor(...color); d.text(lines, this.M, this.y)
    this.y += lines.length * 4.8 + 2
  }
  row(cols: string[], widths: number[], bold = false, fill?: [number, number, number]) {
    const { d } = this
    const wrapped = cols.map((c, i) => d.splitTextToSize(c, widths[i] - 3))
    const h = Math.max(...wrapped.map((w) => w.length)) * 4.6 + 3
    this.need(h)
    if (fill) { d.setFillColor(...fill); d.rect(this.M, this.y - 4, this.W - this.M * 2, h, 'F') }
    let x = this.M
    d.setFont('helvetica', bold ? 'bold' : 'normal'); d.setFontSize(9); d.setTextColor(...INK)
    wrapped.forEach((w, i) => { d.text(w, x + 1.5, this.y); x += widths[i] })
    this.y += h
  }
  gap(n = 4) { this.y += n }
  async qr(text: string, x: number, y: number, size = 28) {
    const url = await QRCode.toDataURL(text, { margin: 0, color: { dark: '#22113f' } })
    this.d.addImage(url, 'PNG', x, y, size, size)
  }
  save(name: string) { this.d.save(name) }
}

export async function diagnosisPdf(s: DemoState) {
  const doc = new Doc('Diagnosis Report', `Request ${JOB.requestId} · Report issued ${fmtDateTime(DATES.report)} · Valid with any contractor`)
  doc.h('Customer & property')
  doc.kv('Customer', CUSTOMER.name); doc.kv('Property', `${PROPERTY.type}, ${PROPERTY.address}`); doc.kv('Property record ID', PROPERTY.id)
  doc.h('Findings')
  doc.kv('Main issue', PROPERTY.issue); doc.kv('Affected area', PROPERTY.affected); doc.kv('Surface', 'Terrace, approx. 1,000 sq ft')
  doc.kv('Probable source', 'Parapet joint + drain collar'); doc.kv('Confidence', 'High (moisture meter + visual; demo)')
  doc.kv('Cause category', 'Waterproofing + detailing (not plumbing)')
  doc.p('Expert notes: Moisture readings are highest under the north-east parapet junction and around the drain collar. The earlier coating has debonded at the coving. No wet zone follows a pipe chase. Hairline cracks across the slab are secondary.', GREY)
  doc.h('Recommended solution')
  doc.p(`Crack cutting and filling; parapet joint and drain-collar detailing; ${JOB.system} applied in two coats; 7-stage photo record with on-site pre-cover audit and water test.`)
  doc.h('Fixed quotation (Assure level)')
  const w = [120, 58]
  doc.row(['Item', 'Amount'], w, true, [245, 242, 251])
  JOB.quote.forEach((q) => doc.row([`${q.label}  (${q.sub})`, rs(q.amount)], w))
  doc.row([`Total for ${JOB.area.toLocaleString('en-IN')} sq ft at Rs ${RULES.pricePerSqFt}/sq ft`, rs(JOB.value)], w, true, [255, 245, 236])
  doc.row([`Diagnosis visit fee already paid (credited if you proceed)`, '- ' + rs(RULES.diagnosisFee)], w)
  doc.row([`Payable: 90% on completion (after credit)`, rs(NINETY - RULES.diagnosisFee)], w)
  doc.row([`Retained by you until after first monsoon (10%)`, rs(RETENTION)], w)
  doc.h('Exclusions')
  doc.p('Structural defects, drainage systems, and the pipes themselves (plumbing) are not covered. Leaks traced to these are referred on with a written finding.')
  doc.h('Diagnostician')
  doc.kv('Name', `${PEOPLE.diagnostician.name} (${PEOPLE.diagnostician.id})`); doc.kv('Credentials', PEOPLE.diagnostician.cred)
  doc.p(PEOPLE.diagnostician.note + ' This report is yours to use with any contractor.', GREY)
  doc.p(`Quote status: ${s.quote.status === 'accepted' ? 'Accepted on ' + fmtDate(s.quote.decidedAt) : s.quote.status === 'rejected' ? 'Declined' : 'Awaiting your decision'}`)
  await doc.qr(`DEMO-VERIFY:${JOB.requestId}`, 166, 46, 26)
  doc.save(`Dry360-Diagnosis-${JOB.requestId}.pdf`)
}

export async function warrantyPdf(s: DemoState) {
  const doc = new Doc('Assurance & Warranty Card', `Job ${JOB.id} · ${s.warranty.active ? 'Active from ' + fmtDate(s.warranty.activatedAt) : 'Not yet active'}`)
  doc.h('Cover')
  doc.kv('Customer', CUSTOMER.name); doc.kv('Job ID', JOB.id); doc.kv('Property', PROPERTY.address); doc.kv('Surface', 'Terrace (1,000 sq ft)')
  doc.kv('Service completed', fmtDate(DATES.completion))
  doc.kv('Work warranty', `${RULES.workWarrantyYears} years, to ${fmtDate(DATES.warrantyEnd)}`)
  doc.kv('Product warranty', JOB.systemWarranty); doc.kv('Product batch', JOB.batch)
  doc.kv('Applicator', `${PEOPLE.applicator.name}, ${PEOPLE.applicator.firm} (${PEOPLE.applicator.id})`)
  doc.h('What is covered')
  doc.p('Waterproofing workmanship and approved system application. Eligible workmanship defects: free repair or redo, up to the original job value of ' + rs(JOB.value) + '.')
  doc.h('Not covered')
  doc.p('Structural defects, drainage, and plumbing (the pipes themselves), or issues not attributable to covered waterproofing workmanship.')
  doc.h('10% retention')
  doc.kv('Retained by you', rs(RETENTION) + ' (not held by Asian Paints; no wallet or escrow)')
  doc.kv('Paid on completion', rs(NINETY))
  doc.kv('First-monsoon review', fmtDate(DATES.monsoonReview))
  doc.kv('Status', s.retention.status === 'released' ? 'Released by you on ' + fmtDate(s.retention.releasedAt) : s.retention.status === 'release_due' ? 'Review passed; release due' : 'Held by you, pending review')
  doc.p('Release follows the post-monsoon review under the agreed service terms. It is not automatic, and closing a claim does not by itself release it.', GREY)
  await doc.qr(`DEMO-VERIFY:${JOB.id}`, 166, 46, 26)
  doc.save(`Dry360-Warranty-${JOB.id}.pdf`)
}

export async function recordPdf(s: DemoState) {
  const doc = new Doc('Water Health Record', `${PROPERTY.id} · One property. One record. Proof that stays with your home.`)
  doc.h('Property')
  doc.kv('Owner', CUSTOMER.name); doc.kv('Address', PROPERTY.address); doc.kv('Type', `${PROPERTY.type}, built ${PROPERTY.built}`)
  doc.h('Diagnosis')
  doc.kv('Issue', PROPERTY.issue); doc.kv('Root cause', 'Parapet joint + drain collar'); doc.kv('By', `${PEOPLE.diagnostician.name}, ${fmtDate(s.diagnosis.reportAt)}`)
  doc.h('Work')
  doc.kv('Job', `${JOB.id} · ${JOB.system}`); doc.kv('Batch', JOB.batch); doc.kv('Dealer', `${PEOPLE.dealer.name} (${PEOPLE.dealer.code})`)
  doc.kv('Applicator', `${PEOPLE.applicator.name} · Certified, terrace systems`)
  doc.h('Stage evidence (7 stages)')
  const w = [10, 62, 30, 76]
  doc.row(['#', 'Stage', 'Status', 'Verification'], w, true, [245, 242, 251])
  s.stages.forEach((st) => {
    const a = st.audits[st.audits.length - 1]
    doc.row([String(st.n), st.title, st.status.replace('_', ' '), a ? `${a.mode === 'onsite' ? 'On-site' : 'Photo'} audit, ${a.by}, ${fmtDateTime(a.at)}` : st.onsite ? 'On-site audit required' : '—'], w)
  })
  doc.h('Assurance')
  doc.kv('Work warranty', s.warranty.active ? `Active, ${fmtDate(s.warranty.activatedAt)} to ${fmtDate(DATES.warrantyEnd)}` : 'Not active')
  doc.kv('Monsoon review', s.monsoon.status === 'review_passed' ? 'Passed ' + fmtDate(s.monsoon.reviewedAt) : s.monsoon.status === 'on_hold' ? 'On hold' : 'Due ' + fmtDate(DATES.monsoonReview))
  doc.kv('10% retention', s.retention.status.replace('_', ' '))
  doc.h('Claims & rectification')
  if (!s.claims.length) doc.p('No claims raised.', GREY)
  s.claims.forEach((c) => {
    doc.kv(c.id, `${fmtDate(c.raisedAt)} · ${c.outcome ? (c.outcome === 'eligible' ? 'Covered (workmanship)' : 'Not covered (plumbing)') : 'Under review'}${c.closedAt ? ' · closed ' + fmtDate(c.closedAt) : ''}`)
  })
  doc.gap(2)
  doc.p('Transfer: this record can be shared with a future owner with the current owner\'s consent. Shared copies are read-only.', GREY)
  await doc.qr(`DEMO-VERIFY:${PROPERTY.id}`, 166, 46, 26)
  doc.save(`Dry360-Water-Health-Record-${PROPERTY.id}.pdf`)
}
