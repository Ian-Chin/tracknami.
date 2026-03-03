import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PARENT_PAGE_ID = '3145b5ed-ebc3-80c3-9664-e38c4df1fd17'

async function setup() {
  console.log('Creating Users database...')

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ type: 'text', text: { content: 'Users' } }],
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
        Email: { name: 'Email', email: {} },
        Password: { name: 'Password', rich_text: {} },
        Role: { name: 'Role', select: { options: [{ name: 'admin' }, { name: 'employee' }] } },
      },
    })
    console.log('Properties added.')
  }

  // Seed admin user
  console.log('Seeding admin user...')
  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: 'Admin' } }] },
      Email: { email: 'admin@iunami.com' },
      Password: { rich_text: [{ text: { content: 'iunamiontop2026' } }] },
      Role: { select: { name: 'admin' } },
    },
  })
  console.log('Admin user created.')

  console.log('\nDone! Add these to your .env:')
  console.log(`NOTION_USERS_DATABASE_ID=${dbId}`)
  console.log(`NOTION_USERS_DATA_SOURCE_ID=${dataSourceId}`)
}

setup().catch(console.error)
