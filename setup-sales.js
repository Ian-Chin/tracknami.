import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PARENT_PAGE_ID = '3145b5ed-ebc3-80c3-9664-e38c4df1fd17'

async function setup() {
  console.log('Creating Sales database...')

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'Sales' } }],
  })

  const dbId = db.id
  const dataSourceId = db.data_sources?.[0]?.id
  console.log(`Database created: ${dbId}`)
  console.log(`Data source: ${dataSourceId}`)

  if (dataSourceId) {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: {
        Name: { name: 'Name', title: {} },
        Client: { name: 'Client', rich_text: {} },
        Amount: { name: 'Amount', number: { format: 'dollar' } },
        Stage: {
          name: 'Stage',
          select: {
            options: [
              { name: 'Lead', color: 'gray' },
              { name: 'Proposal', color: 'blue' },
              { name: 'Negotiation', color: 'yellow' },
              { name: 'Closed Won', color: 'green' },
              { name: 'Closed Lost', color: 'red' },
            ],
          },
        },
        'Sales Rep': { name: 'Sales Rep', rich_text: {} },
        'Close Date': { name: 'Close Date', date: {} },
      },
    })
    console.log('Properties added.')
  }

  // Seed sample data
  const deals = [
    { name: 'Enterprise CRM License', client: 'Acme Corp', amount: 85000, stage: 'Closed Won', rep: 'Sarah Chen', closeDate: '2026-01-15' },
    { name: 'Cloud Migration Package', client: 'TechStart Inc', amount: 120000, stage: 'Closed Won', rep: 'James Wilson', closeDate: '2026-01-22' },
    { name: 'Security Audit Suite', client: 'FinanceHub', amount: 45000, stage: 'Closed Won', rep: 'Sarah Chen', closeDate: '2026-02-03' },
    { name: 'Data Analytics Platform', client: 'RetailMax', amount: 95000, stage: 'Negotiation', rep: 'Maria Garcia', closeDate: '2026-03-10' },
    { name: 'DevOps Toolchain', client: 'BuildRight', amount: 67000, stage: 'Proposal', rep: 'James Wilson', closeDate: '2026-03-15' },
    { name: 'AI Chatbot Integration', client: 'ServiceNow Pro', amount: 150000, stage: 'Negotiation', rep: 'Sarah Chen', closeDate: '2026-03-20' },
    { name: 'Mobile App Redesign', client: 'FoodDash', amount: 78000, stage: 'Closed Won', rep: 'Maria Garcia', closeDate: '2026-02-10' },
    { name: 'API Gateway Setup', client: 'CloudNine', amount: 35000, stage: 'Lead', rep: 'Alex Kim', closeDate: '2026-04-01' },
    { name: 'Compliance Dashboard', client: 'MedTech Solutions', amount: 110000, stage: 'Proposal', rep: 'Sarah Chen', closeDate: '2026-03-28' },
    { name: 'E-commerce Platform', client: 'ShopWell', amount: 200000, stage: 'Negotiation', rep: 'James Wilson', closeDate: '2026-04-15' },
    { name: 'HR Management System', client: 'PeopleFirst', amount: 55000, stage: 'Closed Lost', rep: 'Alex Kim', closeDate: '2026-01-30' },
    { name: 'Infrastructure Monitoring', client: 'UpTime Corp', amount: 42000, stage: 'Closed Won', rep: 'Maria Garcia', closeDate: '2026-02-18' },
    { name: 'Payment Gateway', client: 'PayEasy', amount: 88000, stage: 'Lead', rep: 'James Wilson', closeDate: '2026-04-20' },
    { name: 'Supply Chain Analytics', client: 'LogiTrack', amount: 130000, stage: 'Proposal', rep: 'Alex Kim', closeDate: '2026-04-05' },
    { name: 'Customer Portal', client: 'Acme Corp', amount: 72000, stage: 'Closed Won', rep: 'Sarah Chen', closeDate: '2026-02-25' },
    { name: 'Inventory System', client: 'RetailMax', amount: 60000, stage: 'Lead', rep: 'Maria Garcia', closeDate: '2026-05-01' },
    { name: 'SSO Integration', client: 'TechStart Inc', amount: 28000, stage: 'Closed Won', rep: 'Alex Kim', closeDate: '2026-01-10' },
    { name: 'Reporting Dashboard', client: 'FinanceHub', amount: 95000, stage: 'Negotiation', rep: 'James Wilson', closeDate: '2026-03-30' },
  ]

  console.log(`Seeding ${deals.length} sample deals...`)

  for (const deal of deals) {
    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: deal.name } }] },
        Client: { rich_text: [{ text: { content: deal.client } }] },
        Amount: { number: deal.amount },
        Stage: { select: { name: deal.stage } },
        'Sales Rep': { rich_text: [{ text: { content: deal.rep } }] },
        'Close Date': { date: { start: deal.closeDate } },
      },
    })
  }

  console.log('Sample deals seeded.')
  console.log('\nDone! Add these to your .env:')
  console.log(`NOTION_SALES_DATABASE_ID=${dbId}`)
  console.log(`NOTION_SALES_DATA_SOURCE_ID=${dataSourceId}`)
}

setup().catch(console.error)
