import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const TIMELOG_DATABASE_ID = process.env.NOTION_TIMELOG_DATABASE_ID

if (!TIMELOG_DATABASE_ID) {
  console.error('Error: NOTION_TIMELOG_DATABASE_ID must be set in .env')
  process.exit(1)
}

// Real entry and team member IDs from the database
const entries = {
  'Fix Login Bug':           '3145b5ed-ebc3-811e-b379-f38a4ecbee38',
  'Setup CI/CD Pipeline':    '3145b5ed-ebc3-8145-be3e-f2349a5a3822',
  'Security Audit':          '3145b5ed-ebc3-814d-acc4-ed4c05630e66',
  'Design Landing Page':     '3145b5ed-ebc3-8158-aeda-df953bf9d915',
  'Onboarding Flow Redesign':'3145b5ed-ebc3-8186-b20e-d71b1d754886',
  'Database Migration':      '3145b5ed-ebc3-81a4-94e6-c03e20ecc72e',
  'User Analytics Dashboard':'3145b5ed-ebc3-81c7-9052-c456d107e526',
  'Write API Documentation': '3145b5ed-ebc3-81f8-945e-fd6356ba53a3',
}

const members = {
  'Sarah Chen':      '3145b5ed-ebc3-812f-9b2e-f83a2629ae32',
  'James Wilson':    '3145b5ed-ebc3-8116-95c5-f244cc3dc7f8',
  'Aisha Patel':     '3145b5ed-ebc3-8168-bf90-d865cd915e4a',
  'David Kim':       '3145b5ed-ebc3-8128-b031-ffadad8e711b',
  'Carlos Reyes':    '3145b5ed-ebc3-8133-9684-cf09fb89fe83',
  'Alex Johnson':    '3145b5ed-ebc3-8166-ad88-fa21302e7159',
  'Priya Sharma':    '3145b5ed-ebc3-813e-a97c-ea57a7d626c5',
  'Marcus Lee':      '3145b5ed-ebc3-8164-9af1-e8b97f55a483',
  'Emily Rodriguez': '3145b5ed-ebc3-81cf-a428-cb3375eefc75',
}

const logs = [
  { entry: 'Fix Login Bug',           member: 'Sarah Chen',      hours: 3,   date: '2026-02-25', notes: 'Debugged auth token refresh logic' },
  { entry: 'Fix Login Bug',           member: 'James Wilson',    hours: 1.5, date: '2026-02-26', notes: 'Reviewed PR and tested edge cases' },
  { entry: 'Setup CI/CD Pipeline',    member: 'David Kim',       hours: 4,   date: '2026-02-24', notes: 'Configured GitHub Actions workflows' },
  { entry: 'Setup CI/CD Pipeline',    member: 'David Kim',       hours: 2,   date: '2026-02-25', notes: 'Added staging deploy step' },
  { entry: 'Security Audit',          member: 'Carlos Reyes',    hours: 5,   date: '2026-02-26', notes: 'OWASP Top 10 vulnerability scan' },
  { entry: 'Security Audit',          member: 'Priya Sharma',    hours: 3,   date: '2026-02-27', notes: 'Reviewed dependency audit results' },
  { entry: 'Design Landing Page',     member: 'Aisha Patel',     hours: 6,   date: '2026-02-23', notes: 'Created high-fidelity mockups' },
  { entry: 'Design Landing Page',     member: 'Aisha Patel',     hours: 2.5, date: '2026-02-24', notes: 'Responsive breakpoint adjustments' },
  { entry: 'Database Migration',      member: 'Alex Johnson',    hours: 4,   date: '2026-02-20', notes: 'Schema migration scripts' },
  { entry: 'Database Migration',      member: 'Sarah Chen',      hours: 2,   date: '2026-02-21', notes: 'Data validation after migration' },
  { entry: 'User Analytics Dashboard',member: 'Marcus Lee',      hours: 3.5, date: '2026-02-27', notes: 'Chart component prototyping' },
  { entry: 'Write API Documentation', member: 'Emily Rodriguez', hours: 2,   date: '2026-02-28', notes: 'Documented REST endpoints' },
  { entry: 'Onboarding Flow Redesign',member: 'Aisha Patel',     hours: 3,   date: '2026-02-26', notes: 'User flow wireframes' },
  { entry: 'Onboarding Flow Redesign',member: 'Priya Sharma',    hours: 1.5, date: '2026-02-27', notes: 'UX copy review' },
  { entry: 'Setup CI/CD Pipeline',    member: 'James Wilson',    hours: 1,   date: '2026-02-26', notes: 'Tested rollback procedures' },
]

async function seed() {
  console.log(`Seeding ${logs.length} time logs...`)

  for (const l of logs) {
    const entryId = entries[l.entry]
    const memberId = members[l.member]

    await notion.pages.create({
      parent: { database_id: TIMELOG_DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: `${l.member} — ${l.entry}` } }] },
        Entry: { relation: [{ id: entryId }] },
        Member: { relation: [{ id: memberId }] },
        Hours: { number: l.hours },
        Date: { date: { start: l.date } },
        Notes: { rich_text: [{ text: { content: l.notes } }] },
      },
    })
    console.log(`  Added: ${l.member} — ${l.entry} (${l.hours}h)`)
  }

  console.log('\nDone! Seeded sample time logs.')
}

seed().catch(console.error)
