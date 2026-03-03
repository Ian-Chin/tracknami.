import { notion } from './_lib/notion.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const response = await notion.users.list({})
    const people = response.results
      .filter(u => u.type === 'person')
      .map(u => ({ id: u.id, name: u.name, avatar_url: u.avatar_url }))
    res.json(people)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
