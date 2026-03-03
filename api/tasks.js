import { notion, mapTask } from './_lib/notion.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await notion.dataSources.query({
        data_source_id: process.env.NOTION_TASKS_DATA_SOURCE_ID,
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      })
      res.json(response.results.map(mapTask))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, projectId, completed, date, endDate, priority, estimatedTime } = req.body
      const properties = {
        Name: { title: [{ text: { content: name } }] },
      }
      if (projectId) properties.Project = { relation: [{ id: projectId }] }
      if (completed !== undefined) properties.Completed = { checkbox: completed }
      if (date) {
        const dateObj = { start: date }
        if (endDate) dateObj.end = endDate
        properties.Date = { date: dateObj }
      }
      if (priority) properties.Priority = { select: { name: priority } }
      if (estimatedTime) properties['Estimated Completion Time'] = { rich_text: [{ text: { content: estimatedTime } }] }
      const page = await notion.pages.create({
        parent: { database_id: process.env.NOTION_TASKS_DATABASE_ID },
        properties,
      })
      res.json(mapTask(page))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
