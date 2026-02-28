import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID

if (!DATA_SOURCE_ID) {
  console.error('Error: NOTION_DATA_SOURCE_ID must be set in .env')
  process.exit(1)
}

async function setup() {
  console.log('Adding "Due Date" property to Entries database...')

  await notion.dataSources.update({
    data_source_id: DATA_SOURCE_ID,
    properties: {
      'Due Date': { name: 'Due Date', date: {} },
    },
  })

  console.log('Done! "Due Date" date property added to Entries database.')
}

setup().catch(console.error)
