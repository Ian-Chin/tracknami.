import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PARENT_PAGE_ID = '3145b5ed-ebc3-80c3-9664-e38c4df1fd17'

async function setup() {
  console.log('Creating database under dashboard page...')

  // Step 1: Create the database
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'Dashboard_Main' } }],
  })

  const dbId = db.id
  console.log(`Database created: ${dbId}`)

  // Step 2: Add properties via data source
  const dataSourceId = db.data_sources?.[0]?.id
  if (dataSourceId) {
    console.log(`Updating data source ${dataSourceId} with properties...`)
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: {
        Name: { name: 'Name', title: {} },
        Status: {
          name: 'Status',
          select: {
            options: [
              { name: 'Not Started', color: 'gray' },
              { name: 'In Progress', color: 'blue' },
              { name: 'Done', color: 'green' },
            ],
          },
        },
        Priority: {
          name: 'Priority',
          select: {
            options: [
              { name: 'Low', color: 'gray' },
              { name: 'Medium', color: 'yellow' },
              { name: 'High', color: 'red' },
              { name: 'Urgent', color: 'purple' },
            ],
          },
        },
        Date: { name: 'Date', date: {} },
      },
    })
    console.log('Properties added.')
  } else {
    console.log('No data_sources found, trying databases.update fallback...')
    // Fallback: try direct REST call
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties: {
          Name: { title: {} },
          Status: {
            select: {
              options: [
                { name: 'Not Started', color: 'gray' },
                { name: 'In Progress', color: 'blue' },
                { name: 'Done', color: 'green' },
              ],
            },
          },
          Priority: {
            select: {
              options: [
                { name: 'Low', color: 'gray' },
                { name: 'Medium', color: 'yellow' },
                { name: 'High', color: 'red' },
                { name: 'Urgent', color: 'purple' },
              ],
            },
          },
          Date: { date: {} },
        },
      }),
    })
    const result = await res.json()
    if (!res.ok) {
      console.error('Fallback failed:', result)
    } else {
      console.log('Properties added via fallback.')
    }
  }

  // Step 3: Add sample data
  console.log('Adding sample entries...')

  const entries = [
    { name: 'Setup CI/CD Pipeline', status: 'In Progress', priority: 'High', date: '2026-02-27' },
    { name: 'Design Landing Page', status: 'Done', priority: 'Medium', date: '2026-02-20' },
    { name: 'Fix Login Bug', status: 'In Progress', priority: 'Urgent', date: '2026-02-26' },
    { name: 'Write API Documentation', status: 'Not Started', priority: 'Low', date: '2026-03-01' },
    { name: 'Database Migration', status: 'Done', priority: 'High', date: '2026-02-18' },
    { name: 'User Analytics Dashboard', status: 'Not Started', priority: 'Medium', date: '2026-03-05' },
    { name: 'Security Audit', status: 'In Progress', priority: 'Urgent', date: '2026-02-25' },
    { name: 'Onboarding Flow Redesign', status: 'Not Started', priority: 'High', date: '2026-03-10' },
  ]

  for (const entry of entries) {
    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: entry.name } }] },
        Status: { select: { name: entry.status } },
        Priority: { select: { name: entry.priority } },
        Date: { date: { start: entry.date } },
      },
    })
    console.log(`  Added: ${entry.name}`)
  }

  console.log('\nDone! Set this in your .env:')
  console.log(`NOTION_DATABASE_ID=${dbId}`)
}

setup().catch(console.error)
