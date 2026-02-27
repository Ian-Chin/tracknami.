import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const dbId = 'f99006c2-a091-4d0c-9b47-e662860bfba9'
const dataSourceId = '224ca352-1f9e-4089-9a7a-e8fcc0083ad0'

async function setup() {
  // Add properties (skip Title since it already exists as default)
  console.log('Adding properties...')
  await notion.dataSources.update({
    data_source_id: dataSourceId,
    properties: {
      'Team Member': { name: 'Team Member', rich_text: {} },
      Type: {
        name: 'Type',
        select: {
          options: [
            { name: 'Annual Leave', color: 'yellow' },
            { name: 'MC', color: 'red' },
            { name: 'Remote', color: 'blue' },
            { name: 'Emergency Leave', color: 'orange' },
            { name: 'Half Day', color: 'purple' },
          ],
        },
      },
      'Start Date': { name: 'Start Date', date: {} },
      'End Date': { name: 'End Date', date: {} },
    },
  })
  console.log('Properties added.')

  // Add sample leave records
  console.log('Adding sample leave records...')

  const records = [
    { title: 'Annual Leave - Emily Rodriguez', member: 'Emily Rodriguez', type: 'Annual Leave', start: '2026-02-23', end: '2026-02-27' },
    { title: 'MC - Lisa Nakamura', member: 'Lisa Nakamura', type: 'MC', start: '2026-02-26', end: '2026-02-27' },
    { title: 'Remote - James Wilson', member: 'James Wilson', type: 'Remote', start: '2026-02-25', end: '2026-02-27' },
    { title: 'Remote - Priya Sharma', member: 'Priya Sharma', type: 'Remote', start: '2026-02-24', end: '2026-02-28' },
    { title: 'Half Day - Sarah Chen', member: 'Sarah Chen', type: 'Half Day', start: '2026-02-27', end: '2026-02-27' },
    { title: 'Annual Leave - David Kim', member: 'David Kim', type: 'Annual Leave', start: '2026-03-02', end: '2026-03-06' },
    { title: 'MC - Marcus Lee', member: 'Marcus Lee', type: 'MC', start: '2026-03-03', end: '2026-03-04' },
    { title: 'Emergency Leave - Tom Baker', member: 'Tom Baker', type: 'Emergency Leave', start: '2026-03-05', end: '2026-03-05' },
    { title: 'Remote - Alex Johnson', member: 'Alex Johnson', type: 'Remote', start: '2026-03-09', end: '2026-03-13' },
    { title: 'Annual Leave - Sarah Chen', member: 'Sarah Chen', type: 'Annual Leave', start: '2026-03-10', end: '2026-03-12' },
    { title: 'Half Day - James Wilson', member: 'James Wilson', type: 'Half Day', start: '2026-03-06', end: '2026-03-06' },
    { title: 'MC - Aisha Patel', member: 'Aisha Patel', type: 'MC', start: '2026-03-11', end: '2026-03-12' },
    { title: 'Remote - Marcus Lee', member: 'Marcus Lee', type: 'Remote', start: '2026-03-16', end: '2026-03-20' },
    { title: 'Annual Leave - Priya Sharma', member: 'Priya Sharma', type: 'Annual Leave', start: '2026-03-18', end: '2026-03-20' },
  ]

  for (const r of records) {
    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: r.title } }] },
        'Team Member': { rich_text: [{ text: { content: r.member } }] },
        Type: { select: { name: r.type } },
        'Start Date': { date: { start: r.start } },
        'End Date': { date: { start: r.end } },
      },
    })
    console.log(`  Added: ${r.title}`)
  }

  console.log('\nDone! Add these to your .env:')
  console.log(`NOTION_LEAVE_DATABASE_ID=${dbId}`)
  console.log(`NOTION_LEAVE_DATA_SOURCE_ID=${dataSourceId}`)
}

setup().catch(console.error)
