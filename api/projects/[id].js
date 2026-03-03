import { notion, mapProject } from '../_lib/notion.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PATCH') {
    try {
      const { name, state, date, category } = req.body
      const properties = {}
      if (name !== undefined) properties.Name = { title: [{ text: { content: name } }] }
      if (state !== undefined) properties.State = { status: { name: state } }
      if (date !== undefined) properties.Date = { date: date ? { start: date } : null }
      if (category !== undefined) {
        properties.Category = { multi_select: category.map(c => ({ name: c })) }
      }
      const page = await notion.pages.update({ page_id: id, properties })
      res.json(mapProject(page))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      await notion.pages.update({ page_id: id, archived: true })
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
