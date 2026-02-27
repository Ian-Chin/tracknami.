import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const TEAM_DB_ID = process.env.NOTION_TEAM_DATABASE_ID
const LEAVE_DB_ID = process.env.NOTION_LEAVE_DATABASE_ID

async function setup() {
  // ── Additional team members ──
  console.log('Adding extra team members...')

  const newMembers = [
    { name: 'Rachel Tan', role: 'Data Analyst', status: 'Available', email: 'rachel@company.com', dept: 'Engineering' },
    { name: 'Kevin Okonkwo', role: 'Content Strategist', status: 'Available', email: 'kevin@company.com', dept: 'Marketing' },
    { name: 'Mei Lin', role: 'UX Researcher', status: 'Remote', email: 'mei@company.com', dept: 'Design' },
    { name: 'Carlos Reyes', role: 'Security Engineer', status: 'Available', email: 'carlos@company.com', dept: 'Engineering' },
    { name: 'Fatima Al-Hassan', role: 'HR Coordinator', status: 'Available', email: 'fatima@company.com', dept: 'HR' },
    { name: 'Ryan Murphy', role: 'Operations Analyst', status: 'On Leave', email: 'ryan@company.com', dept: 'Operations' },
  ]

  for (const m of newMembers) {
    await notion.pages.create({
      parent: { database_id: TEAM_DB_ID },
      properties: {
        Name: { title: [{ text: { content: m.name } }] },
        Role: { rich_text: [{ text: { content: m.role } }] },
        Status: { select: { name: m.status } },
        Email: { email: m.email },
        Department: { select: { name: m.dept } },
      },
    })
    console.log(`  Added team member: ${m.name}`)
  }

  // ── Additional leave records (Jan–March 2026) ──
  console.log('\nAdding extra leave records (Jan–Mar 2026)...')

  const newLeave = [
    // January
    { title: 'Annual Leave - Sarah Chen', member: 'Sarah Chen', type: 'Annual Leave', start: '2026-01-05', end: '2026-01-09' },
    { title: 'MC - Marcus Lee', member: 'Marcus Lee', type: 'MC', start: '2026-01-07', end: '2026-01-08' },
    { title: 'Remote - Priya Sharma', member: 'Priya Sharma', type: 'Remote', start: '2026-01-12', end: '2026-01-16' },
    { title: 'Half Day - Aisha Patel', member: 'Aisha Patel', type: 'Half Day', start: '2026-01-14', end: '2026-01-14' },
    { title: 'Annual Leave - Tom Baker', member: 'Tom Baker', type: 'Annual Leave', start: '2026-01-19', end: '2026-01-23' },
    { title: 'Emergency Leave - David Kim', member: 'David Kim', type: 'Emergency Leave', start: '2026-01-21', end: '2026-01-22' },
    { title: 'Remote - Alex Johnson', member: 'Alex Johnson', type: 'Remote', start: '2026-01-26', end: '2026-01-30' },
    { title: 'MC - Emily Rodriguez', member: 'Emily Rodriguez', type: 'MC', start: '2026-01-28', end: '2026-01-29' },
    { title: 'Half Day - James Wilson', member: 'James Wilson', type: 'Half Day', start: '2026-01-30', end: '2026-01-30' },

    // February (supplement existing)
    { title: 'Annual Leave - Rachel Tan', member: 'Rachel Tan', type: 'Annual Leave', start: '2026-02-02', end: '2026-02-06' },
    { title: 'Remote - Carlos Reyes', member: 'Carlos Reyes', type: 'Remote', start: '2026-02-09', end: '2026-02-13' },
    { title: 'MC - Kevin Okonkwo', member: 'Kevin Okonkwo', type: 'MC', start: '2026-02-11', end: '2026-02-12' },
    { title: 'Half Day - Mei Lin', member: 'Mei Lin', type: 'Half Day', start: '2026-02-16', end: '2026-02-16' },
    { title: 'Emergency Leave - Fatima Al-Hassan', member: 'Fatima Al-Hassan', type: 'Emergency Leave', start: '2026-02-18', end: '2026-02-19' },
    { title: 'Annual Leave - Ryan Murphy', member: 'Ryan Murphy', type: 'Annual Leave', start: '2026-02-23', end: '2026-02-27' },
    { title: 'Annual Leave - Marcus Lee', member: 'Marcus Lee', type: 'Annual Leave', start: '2026-02-25', end: '2026-02-27' },
    { title: 'Remote - Tom Baker', member: 'Tom Baker', type: 'Remote', start: '2026-02-25', end: '2026-02-27' },

    // March (supplement existing)
    { title: 'MC - Rachel Tan', member: 'Rachel Tan', type: 'MC', start: '2026-03-02', end: '2026-03-03' },
    { title: 'Annual Leave - Carlos Reyes', member: 'Carlos Reyes', type: 'Annual Leave', start: '2026-03-09', end: '2026-03-13' },
    { title: 'Remote - Fatima Al-Hassan', member: 'Fatima Al-Hassan', type: 'Remote', start: '2026-03-11', end: '2026-03-13' },
    { title: 'Half Day - Kevin Okonkwo', member: 'Kevin Okonkwo', type: 'Half Day', start: '2026-03-17', end: '2026-03-17' },
    { title: 'Emergency Leave - Mei Lin', member: 'Mei Lin', type: 'Emergency Leave', start: '2026-03-19', end: '2026-03-20' },
    { title: 'Annual Leave - Lisa Nakamura', member: 'Lisa Nakamura', type: 'Annual Leave', start: '2026-03-23', end: '2026-03-27' },
    { title: 'Remote - Ryan Murphy', member: 'Ryan Murphy', type: 'Remote', start: '2026-03-24', end: '2026-03-27' },
    { title: 'MC - James Wilson', member: 'James Wilson', type: 'MC', start: '2026-03-25', end: '2026-03-26' },
    { title: 'Half Day - Emily Rodriguez', member: 'Emily Rodriguez', type: 'Half Day', start: '2026-03-30', end: '2026-03-30' },
    { title: 'Annual Leave - Alex Johnson', member: 'Alex Johnson', type: 'Annual Leave', start: '2026-03-30', end: '2026-03-31' },
  ]

  for (const r of newLeave) {
    await notion.pages.create({
      parent: { database_id: LEAVE_DB_ID },
      properties: {
        Name: { title: [{ text: { content: r.title } }] },
        'Team Member': { rich_text: [{ text: { content: r.member } }] },
        Type: { select: { name: r.type } },
        'Start Date': { date: { start: r.start } },
        'End Date': { date: { start: r.end } },
      },
    })
    console.log(`  Added leave: ${r.title}`)
  }

  console.log('\nDone! Extra team members and leave records added.')
}

setup().catch(console.error)
