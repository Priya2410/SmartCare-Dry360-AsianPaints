/* Prototype pilot dataset for the Asian Paints console.
   Every figure here is a PILOT TARGET or PROTOTYPE VALUE, not an actual result. */

export type Risk = 'green' | 'amber' | 'red'
export type Gate = 'diagnosis' | 'quote' | 'in_progress' | 'photo_review' | 'onsite_due' | 'rework' | 'verified' | 'warranty' | 'monsoon_passed' | 'claim'

export interface SeedJob {
  id: string; customer: string; city: string; surface: string; sqft: number
  stage: number; gate: Gate; applicator: string; auditor: string; risk: Risk; sla: string; dealer: string
}

export const CITIES = [
  { city: 'Bengaluru', jobs: 112, evidence: 97, repeat: 2.7, rft: 92, conv: 61 },
  { city: 'Hyderabad', jobs: 78, evidence: 95, repeat: 3.4, rft: 90, conv: 56 },
  { city: 'Visakhapatnam', jobs: 46, evidence: 96, repeat: 3.6, rft: 89, conv: 54 },
]

export const KPIS = [
  { k: 'Evidence completeness', v: '96%', gate: 'Gate ≥ 95%', ok: true, note: 'Jobs with all 7 stage photo sets' },
  { k: 'First-monsoon repeat leaks', v: '3.1%', gate: 'Gate < 5%', ok: true, note: 'Specialist benchmark: 2–3% callbacks' },
  { k: 'Right first time', v: '91%', gate: 'Gate ≥ 90%', ok: true, note: 'Stages approved without rework' },
  { k: 'Diagnosis → job', v: '58%', gate: 'Gate ≥ 50%', ok: true, note: 'Survey: 60% pay ₹1,000+ if credited' },
  { k: 'Claim decision time', v: '4.2 d', gate: 'Gate ≤ 7 d', ok: true, note: 'Raise → written decision' },
  { k: 'Retention released on time', v: '88%', gate: 'Gate ≥ 90%', ok: false, note: '14 reviews pending past due date' },
]

export const FUNNEL = [
  { k: 'Photo checks', v: 1240 },
  { k: 'Diagnosis visits', v: 410 },
  { k: 'Jobs started', v: 236 },
  { k: 'Warranties issued', v: 221 },
  { k: 'Monsoon passed', v: 198 },
]

export const SEED_JOBS: SeedJob[] = [
  { id: 'SCA-270402', customer: 'R. Prakash', city: 'Bengaluru', surface: 'Terrace', sqft: 1200, stage: 7, gate: 'monsoon_passed', applicator: 'Manjunath K.', auditor: 'Suresh Iyer', risk: 'green', sla: 'Closed', dealer: 'Sri Lakshmi Paints' },
  { id: 'SCA-270388', customer: 'Lakshmi Reddy', city: 'Hyderabad', surface: 'Bathroom', sqft: 120, stage: 5, gate: 'photo_review', applicator: 'Imran S.', auditor: 'Farah Qureshi', risk: 'green', sla: '0.4 d open', dealer: 'Deccan Colour House' },
  { id: 'SCA-270391', customer: 'Sai Residency (B2B)', city: 'Hyderabad', surface: 'Podium slab', sqft: 4800, stage: 3, gate: 'rework', applicator: 'Ravi T.', auditor: 'Farah Qureshi', risk: 'amber', sla: '1.6 d open', dealer: 'Deccan Colour House' },
  { id: 'SCA-270377', customer: 'P. Varma', city: 'Visakhapatnam', surface: 'Terrace', sqft: 900, stage: 6, gate: 'onsite_due', applicator: 'Appala Naidu', auditor: 'K. Srinivas', risk: 'green', sla: 'Visit tomorrow', dealer: 'Vizag Paint Centre' },
  { id: 'SCA-270365', customer: 'M. Fernandes', city: 'Bengaluru', surface: 'Interior wall', sqft: 300, stage: 0, gate: 'quote', applicator: '—', auditor: '—', risk: 'amber', sla: 'Quote 3 d old', dealer: 'BTM Hardware & Paints' },
  { id: 'SCA-270359', customer: 'Harbour View Apts (B2B)', city: 'Visakhapatnam', surface: 'Basement', sqft: 2600, stage: 2, gate: 'in_progress', applicator: 'Appala Naidu', auditor: 'K. Srinivas', risk: 'red', sla: 'Specialist review', dealer: 'Vizag Paint Centre' },
  { id: 'SCA-270344', customer: 'A. Khan', city: 'Hyderabad', surface: 'Terrace', sqft: 1100, stage: 7, gate: 'claim', applicator: 'Ravi T.', auditor: 'Farah Qureshi', risk: 'red', sla: 'Claim 2.1 d', dealer: 'Deccan Colour House' },
  { id: 'SCA-270331', customer: 'Divya Rao', city: 'Bengaluru', surface: 'Tank', sqft: 180, stage: 7, gate: 'warranty', applicator: 'Shivakumar B.', auditor: 'Suresh Iyer', risk: 'green', sla: 'Review 30 Sep', dealer: 'Jayanagar Paints' },
  { id: 'SCA-270318', customer: 'N. Kulkarni', city: 'Bengaluru', surface: 'Terrace', sqft: 1500, stage: 7, gate: 'verified', applicator: 'Shivakumar B.', auditor: 'Suresh Iyer', risk: 'green', sla: '90% invoice sent', dealer: 'Jayanagar Paints' },
]

export const APPLICATORS = [
  { name: 'Manjunath K.', firm: 'MK Waterproofing Works', city: 'Bengaluru', level: 'Master', jobs: 38, rft: 95, repeat: 1, active: 1, leadRank: 1 },
  { name: 'Shivakumar B.', firm: 'SB Constructions', city: 'Bengaluru', level: 'Certified', jobs: 21, rft: 93, repeat: 0, active: 2, leadRank: 2 },
  { name: 'Imran S.', firm: 'Royal Waterproofing', city: 'Hyderabad', level: 'Certified', jobs: 17, rft: 92, repeat: 0, active: 1, leadRank: 3 },
  { name: 'Appala Naidu', firm: 'Naidu & Sons', city: 'Visakhapatnam', level: 'Certified', jobs: 14, rft: 90, repeat: 1, active: 2, leadRank: 4 },
  { name: 'Ravi T.', firm: 'RT Building Care', city: 'Hyderabad', level: 'Certified', jobs: 19, rft: 81, repeat: 2, active: 2, leadRank: 0 },
  { name: 'Gopal M.', firm: 'Independent', city: 'Bengaluru', level: 'Trained', jobs: 2, rft: 88, repeat: 0, active: 0, leadRank: 0 },
]

export const DEALERS = [
  { name: 'Sri Lakshmi Paints & Hardware', city: 'Bengaluru', leads: 46, jobs: 29, billing: 1174000 },
  { name: 'Jayanagar Paints', city: 'Bengaluru', leads: 38, jobs: 22, billing: 891000 },
  { name: 'Deccan Colour House', city: 'Hyderabad', leads: 41, jobs: 21, billing: 850000 },
  { name: 'Vizag Paint Centre', city: 'Visakhapatnam', leads: 27, jobs: 14, billing: 567000 },
  { name: 'BTM Hardware & Paints', city: 'Bengaluru', leads: 19, jobs: 8, billing: 324000 },
]

export const SEED_CLAIMS = [
  { id: 'CLM-2651', job: 'SCA-270344', city: 'Hyderabad', raised: '2027-07-02', status: 'Inspection booked', outcome: '—', days: 2.1 },
  { id: 'CLM-2644', job: 'SCA-270219', city: 'Bengaluru', raised: '2027-06-28', status: 'Rectified & closed', outcome: 'Covered', days: 3.4 },
  { id: 'CLM-2637', job: 'SCA-270187', city: 'Visakhapatnam', raised: '2027-06-24', status: 'Closed with next steps', outcome: 'Excluded · plumbing', days: 4.0 },
  { id: 'CLM-2630', job: 'SCA-270152', city: 'Hyderabad', raised: '2027-06-19', status: 'Rectification in progress', outcome: 'Covered', days: 5.1 },
]

export const MONSOON = [
  { m: 'Jul', due: 9, released: 9 },
  { m: 'Aug', due: 18, released: 17 },
  { m: 'Sep', due: 41, released: 36 },
  { m: 'Oct', due: 63, released: 0 },
  { m: 'Nov', due: 22, released: 0 },
]
