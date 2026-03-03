import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PARENT_PAGE_ID = '3145b5ed-ebc3-80c3-9664-e38c4df1fd17'

async function setup() {
  console.log('Creating EnvConfig database...')

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'EnvConfig' } }],
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
        Value: { name: 'Value', rich_text: {} },
      },
    })
    console.log('Properties added.')
  }

  // Seed all current env values
  const entries = {
    NOTION_PROJECTS_DATABASE_ID: process.env.NOTION_PROJECTS_DATABASE_ID,
    NOTION_PROJECTS_DATA_SOURCE_ID: process.env.NOTION_PROJECTS_DATA_SOURCE_ID,
    NOTION_TASKS_DATABASE_ID: process.env.NOTION_TASKS_DATABASE_ID,
    NOTION_TASKS_DATA_SOURCE_ID: process.env.NOTION_TASKS_DATA_SOURCE_ID,
    NOTION_TIMELOG_DATABASE_ID: process.env.NOTION_TIMELOG_DATABASE_ID,
    NOTION_TIMELOG_DATA_SOURCE_ID: process.env.NOTION_TIMELOG_DATA_SOURCE_ID,
    NOTION_USERS_DATABASE_ID: process.env.NOTION_USERS_DATABASE_ID,
    NOTION_USERS_DATA_SOURCE_ID: process.env.NOTION_USERS_DATA_SOURCE_ID,
  }

  for (const [key, value] of Object.entries(entries)) {
    if (!value) {
      console.log(`Skipping ${key} (not set in .env)`)
      continue
    }
    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: key } }] },
        Value: { rich_text: [{ text: { content: value } }] },
      },
    })
    console.log(`Seeded ${key}`)
  }

  console.log('\nDone! Replace your .env with just these two lines:')
  console.log(`NOTION_TOKEN=${process.env.NOTION_TOKEN}`)
  console.log(`NOTION_CONFIG_DATA_SOURCE_ID=${dataSourceId}`)
}

setup().catch(console.error)
