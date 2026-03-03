import { notion, getConfig } from './_lib/notion.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const config = await getConfig()
    if (!config.NOTION_USERS_DATA_SOURCE_ID) {
      return res.status(500).json({ error: 'NOTION_USERS_DATA_SOURCE_ID is not configured' })
    }
    const response = await notion.dataSources.query({
      data_source_id: config.NOTION_USERS_DATA_SOURCE_ID,
    })
    const user = response.results.find(
      (r) => r.properties.Email?.email === email
    )
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const storedPassword = user.properties.Password?.rich_text?.[0]?.plain_text || ''
    if (password !== storedPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.properties.Name?.title?.[0]?.plain_text || '',
        email: user.properties.Email?.email || '',
        role: user.properties.Role?.select?.name || 'employee',
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
