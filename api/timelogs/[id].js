import { notion, mapTimeLog } from '../_lib/notion.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PATCH') {
    try {
      const { name, hours, date, notes, taskId, projectId, personId } = req.body
      const properties = {}
      if (name !== undefined) properties.Name = { title: [{ text: { content: name } }] }
      if (hours !== undefined) properties.Hours = { number: hours }
      if (date !== undefined) properties.Date = { date: date ? { start: date } : null }
      if (notes !== undefined) properties.Notes = { rich_text: notes ? [{ text: { content: notes } }] : [] }
      if (taskId !== undefined) properties.Task = { relation: taskId ? [{ id: taskId }] : [] }
      if (projectId !== undefined) properties.Project = { relation: projectId ? [{ id: projectId }] : [] }
      if (personId !== undefined) properties.Person = { people: personId ? [{ id: personId }] : [] }
      const page = await notion.pages.update({ page_id: id, properties })
      res.json(mapTimeLog(page))
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
