import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PARENT_PAGE_ID = '3145b5ed-ebc3-80c3-9664-e38c4df1fd17'
const TASKS_DATABASE_ID = process.env.NOTION_TASKS_DATABASE_ID
const PROJECTS_DATABASE_ID = process.env.NOTION_PROJECTS_DATABASE_ID

if (!TASKS_DATABASE_ID || !PROJECTS_DATABASE_ID) {
  console.error('Error: NOTION_TASKS_DATABASE_ID and NOTION_PROJECTS_DATABASE_ID must be set in .env')
  process.exit(1)
}

async function setup() {
  console.log('Creating Time Logs database...')

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'Time Logs' } }],
  })

  const dbId = db.id
  const dataSourceId = db.data_sources?.[0]?.id
  console.log(`Database created: ${dbId}`)
  console.log(`Data source: ${dataSourceId}`)

  // Step 1: Add basic properties via dataSources API
  if (dataSourceId) {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: {
        Name: { name: 'Name', title: {} },
        Hours: { name: 'Hours', number: { format: 'number' } },
        Date: { name: 'Date', date: {} },
        Notes: { name: 'Notes', rich_text: {} },
      },
    })
    console.log('Basic properties added.')
  }

  // Step 2: Add relation properties via REST API
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      properties: {
        Task: { relation: { database_id: TASKS_DATABASE_ID, type: 'single_property', single_property: {} } },
        Project: { relation: { database_id: PROJECTS_DATABASE_ID, type: 'single_property', single_property: {} } },
      },
    }),
  })
  const result = await res.json()
  if (!res.ok) {
    console.error('Failed to add relation properties:', result)
  } else {
    console.log('Relation properties added (Task → Tasks, Project → Projects).')
  }

  console.log('\nDone! Add these to your .env:')
  console.log(`NOTION_TIMELOG_DATABASE_ID=${dbId}`)
  console.log(`NOTION_TIMELOG_DATA_SOURCE_ID=${dataSourceId}`)
}

setup().catch(console.error)
