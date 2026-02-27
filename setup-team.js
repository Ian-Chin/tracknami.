import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PARENT_PAGE_ID = '3145b5ed-ebc3-80c3-9664-e38c4df1fd17'

async function setup() {
  console.log('Creating Team database...')

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'Team' } }],
  })

  const dbId = db.id
  const dataSourceId = db.data_sources?.[0]?.id
  console.log(`Database created: ${dbId}`)
  console.log(`Data source: ${dataSourceId}`)

  // Add properties
  if (dataSourceId) {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: {
        Name: { name: 'Name', title: {} },
        Role: { name: 'Role', rich_text: {} },
        Status: {
          name: 'Status',
          select: {
            options: [
              { name: 'Available', color: 'green' },
              { name: 'On Leave', color: 'yellow' },
              { name: 'MC', color: 'red' },
              { name: 'Remote', color: 'blue' },
              { name: 'In Meeting', color: 'purple' },
            ],
          },
        },
        Email: { name: 'Email', email: {} },
        Department: {
          name: 'Department',
          select: {
            options: [
              { name: 'Engineering', color: 'blue' },
              { name: 'Design', color: 'pink' },
              { name: 'Marketing', color: 'orange' },
              { name: 'Operations', color: 'gray' },
              { name: 'HR', color: 'green' },
            ],
          },
        },
      },
    })
    console.log('Properties added.')
  }

  // Add sample team members
  console.log('Adding team members...')

  const members = [
    { name: 'Sarah Chen', role: 'Frontend Developer', status: 'Available', email: 'sarah@company.com', dept: 'Engineering' },
    { name: 'James Wilson', role: 'Backend Developer', status: 'Remote', email: 'james@company.com', dept: 'Engineering' },
    { name: 'Aisha Patel', role: 'UI/UX Designer', status: 'In Meeting', email: 'aisha@company.com', dept: 'Design' },
    { name: 'Marcus Lee', role: 'DevOps Engineer', status: 'Available', email: 'marcus@company.com', dept: 'Engineering' },
    { name: 'Emily Rodriguez', role: 'Product Manager', status: 'On Leave', email: 'emily@company.com', dept: 'Operations' },
    { name: 'David Kim', role: 'Marketing Lead', status: 'Available', email: 'david@company.com', dept: 'Marketing' },
    { name: 'Lisa Nakamura', role: 'QA Engineer', status: 'MC', email: 'lisa@company.com', dept: 'Engineering' },
    { name: 'Tom Baker', role: 'HR Manager', status: 'Available', email: 'tom@company.com', dept: 'HR' },
    { name: 'Priya Sharma', role: 'Full Stack Developer', status: 'Remote', email: 'priya@company.com', dept: 'Engineering' },
    { name: 'Alex Johnson', role: 'Graphic Designer', status: 'Available', email: 'alex@company.com', dept: 'Design' },
  ]

  for (const m of members) {
    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: m.name } }] },
        Role: { rich_text: [{ text: { content: m.role } }] },
        Status: { select: { name: m.status } },
        Email: { email: m.email },
        Department: { select: { name: m.dept } },
      },
    })
    console.log(`  Added: ${m.name}`)
  }

  console.log('\nDone! Add these to your .env:')
  console.log(`NOTION_TEAM_DATABASE_ID=${dbId}`)
  console.log(`NOTION_TEAM_DATA_SOURCE_ID=${dataSourceId}`)
}

setup().catch(console.error)
