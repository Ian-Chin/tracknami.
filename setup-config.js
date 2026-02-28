import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PARENT_PAGE_ID = '3145b5ed-ebc3-80c3-9664-e38c4df1fd17'

async function setup() {
  console.log('Creating Config database...')

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'Config' } }],
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

  // Seed GROQ_API_KEY entry
  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: 'GROQ_API_KEY' } }] },
      Value: { rich_text: [{ text: { content: 'YOUR_GROQ_API_KEY_HERE' } }] },
    },
  })
  console.log('Seeded GROQ_API_KEY config entry (update the value in Notion).')

  console.log('\nDone! Add these to your .env:')
  console.log(`NOTION_CONFIG_DATABASE_ID=${dbId}`)
  console.log(`NOTION_CONFIG_DATA_SOURCE_ID=${dataSourceId}`)
}

setup().catch(console.error)
