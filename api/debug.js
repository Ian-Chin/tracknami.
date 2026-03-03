import { notion, getConfig } from './_lib/notion.js'

export default async function handler(req, res) {
  const envCheck = {
    NOTION_TOKEN: !!process.env.NOTION_TOKEN,
    NOTION_CONFIG_DATA_SOURCE_ID: process.env.NOTION_CONFIG_DATA_SOURCE_ID || '(not set)',
  }

  let configResult = null
  try {
    const config = await getConfig()
    configResult = {
      entriesLoaded: Object.keys(config).length,
      keys: Object.keys(config),
      values: Object.fromEntries(
        Object.entries(config).map(([k, v]) => [k, v.slice(0, 8) + '...'])
      ),
    }
  } catch (err) {
    configResult = { error: err.message }
  }

  let usersResult = null
  try {
    const config = await getConfig()
    if (config.NOTION_USERS_DATA_SOURCE_ID) {
      const response = await notion.dataSources.query({
        data_source_id: config.NOTION_USERS_DATA_SOURCE_ID,
      })
      usersResult = {
        count: response.results.length,
        users: response.results.map(r => ({
          name: r.properties.Name?.title?.[0]?.plain_text || '(none)',
          email: r.properties.Email?.email || '(none)',
          hasPassword: !!r.properties.Password?.rich_text?.[0]?.plain_text,
        })),
      }
    }
  } catch (err) {
    usersResult = { error: err.message }
  }

  res.json({ env: envCheck, config: configResult, users: usersResult })
}
