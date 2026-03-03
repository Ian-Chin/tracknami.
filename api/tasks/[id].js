import { notion, mapTask } from '../_lib/notion.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PATCH') {
    try {
      const { name, projectId, completed, date, endDate, priority, estimatedTime } = req.body
      const properties = {}
      if (name !== undefined) properties.Name = { title: [{ text: { content: name } }] }
      if (projectId !== undefined) properties.Project = { relation: projectId ? [{ id: projectId }] : [] }
      if (completed !== undefined) properties.Completed = { checkbox: completed }
      if (date !== undefined) {
        if (date) {
          const dateObj = { start: date }
          if (endDate) dateObj.end = endDate
          properties.Date = { date: dateObj }
        } else {
          properties.Date = { date: null }
        }
      }
      if (priority !== undefined) properties.Priority = { select: priority ? { name: priority } : null }
      if (estimatedTime !== undefined) properties['Estimated Completion Time'] = { rich_text: estimatedTime ? [{ text: { content: estimatedTime } }] : [] }
      const page = await notion.pages.update({ page_id: id, properties })
      res.json(mapTask(page))
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
